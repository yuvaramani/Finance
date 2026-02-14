<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Salary;
use Carbon\Carbon;
use Illuminate\Http\Request;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class TdsExportController extends Controller
{
    public function exportQuarter(Request $request)
    {
        $request->validate([
            'fy_start' => 'required|integer|min:2000|max:2100',
            'quarter' => 'required|integer|min:1|max:4',
        ]);

        $fyStart = (int) $request->input('fy_start');
        $quarter = (int) $request->input('quarter');

        [$fromDate, $toDate, $label] = $this->getQuarterRange($fyStart, $quarter);

        $salaries = Salary::with(['employee'])
            ->whereDate('date', '>=', $fromDate->toDateString())
            ->whereDate('date', '<=', $toDate->toDateString())
            ->orderBy('date')
            ->get();

        $months = $this->getQuarterMonths($fyStart, $quarter);

        $grouped = [];
        foreach ($salaries as $salary) {
            $employee = $salary->employee;
            if (!$employee) {
                continue;
            }
            $empKey = (string) $employee->id;
            if (!isset($grouped[$empKey])) {
                $grouped[$empKey] = [
                    'name' => $employee->account_name ?? $employee->name ?? '',
                    'pan' => $employee->pan_no ?? '',
                    'months' => [],
                ];
            }

            $monthKey = $salary->date?->format('Y-m') ?? '';
            if ($monthKey === '') {
                continue;
            }

            $tds = (float) ($salary->tds ?? 0);

            if (!isset($grouped[$empKey]['months'][$monthKey])) {
                $grouped[$empKey]['months'][$monthKey] = ['tds' => 0];
            }

            $grouped[$empKey]['months'][$monthKey]['tds'] += $tds;
        }

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Header row 1
        $sheet->setCellValue('A1', 'Name');
        $sheet->setCellValue('B1', 'PAN');

        $col = 'C';
        foreach ($months as $m) {
            $sheet->setCellValue($col . '1', $m['label'] . '-Tax');
            $col = chr(ord($col) + 1);
        }

        $rowIndex = 2;
        foreach ($grouped as $emp) {
            $sheet->setCellValue("A{$rowIndex}", $emp['name']);
            $sheet->setCellValue("B{$rowIndex}", $emp['pan']);

            $col = 'C';
            foreach ($months as $m) {
                $monthKey = $m['key'];
                $values = $emp['months'][$monthKey] ?? null;
                $tdsValue = $values && isset($values['tds']) ? $values['tds'] : 0;
                $sheet->setCellValue($col . $rowIndex, $tdsValue);
                $col = chr(ord($col) + 1);
            }
            $rowIndex++;
        }

        // Totals row (per month TDS)
        $sheet->setCellValue("A{$rowIndex}", 'Total');
        $col = 'C';
        foreach ($months as $m) {
            $monthKey = $m['key'];
            $monthTotal = 0;
            foreach ($grouped as $emp) {
                if (isset($emp['months'][$monthKey]) && isset($emp['months'][$monthKey]['tds'])) {
                    $monthTotal += $emp['months'][$monthKey]['tds'];
                }
            }
            $sheet->setCellValue($col . $rowIndex, $monthTotal);
            $col = chr(ord($col) + 1);
        }

        $lastCol = chr(ord('B') + count($months));
        $lastRow = $rowIndex;

        // Column sizing
        $sheet->getColumnDimension('A')->setWidth(30);
        $sheet->getColumnDimension('B')->setWidth(18);
        $col = 'C';
        foreach ($months as $_m) {
            $sheet->getColumnDimension($col)->setWidth(14);
            $col = chr(ord($col) + 1);
        }

        // Header styling
        $sheet->getStyle("A1:{$lastCol}1")->applyFromArray([
            'font' => [
                'bold' => true,
                'size' => 12,
                'color' => ['rgb' => 'FFFFFF'],
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '15803D'], // green-700
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ]);
        $sheet->getStyle('A1:B1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
        $sheet->getStyle("C1:{$lastCol}1")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getRowDimension(1)->setRowHeight(16);

        // Header borders (thin)
        $sheet->getStyle("A1:{$lastCol}1")->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => 'D1D5DB'],
                ],
            ],
        ]);

        // Data borders (thin for all data cells)
        if ($lastRow >= 2) {
            $sheet->getStyle("A2:{$lastCol}{$lastRow}")->applyFromArray([
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['rgb' => 'D1D5DB'],
                    ],
                ],
            ]);
        }

        // Keep thin borders as default for the full populated area
        $sheet->getStyle("A1:{$lastCol}{$lastRow}")->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => 'D1D5DB'],
                ],
            ],
        ]);

        // Data alignment and number format for tax columns
        $sheet->getStyle("A2:A{$lastRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
        $sheet->getStyle("B2:B{$lastRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
        if ($lastRow >= 2) {
            $sheet->getStyle("C2:{$lastCol}{$lastRow}")
                ->getNumberFormat()
                ->setFormatCode(NumberFormat::FORMAT_NUMBER_COMMA_SEPARATED1);
            $sheet->getStyle("C2:{$lastCol}{$lastRow}")
                ->getAlignment()
                ->setHorizontal(Alignment::HORIZONTAL_RIGHT);
        }

        // Alternating row background for readability
        for ($r = 2; $r < $lastRow; $r++) {
            if ($r % 2 === 0) {
                $sheet->getStyle("A{$r}:{$lastCol}{$r}")->applyFromArray([
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => 'F9FAFB'],
                    ],
                ]);
            }
        }

        // Totals row styling
        $sheet->getStyle("A{$lastRow}:{$lastCol}{$lastRow}")->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => '111827'],
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'ECFDF5'], // green tint
            ],
        ]);

        $fileName = "TDS_FY{$fyStart}-" . substr((string) ($fyStart + 1), -2) . "_{$label}.xlsx";

        return response()->streamDownload(function () use ($spreadsheet) {
            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
        }, $fileName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    private function getQuarterRange(int $fyStart, int $quarter): array
    {
        return match ($quarter) {
            1 => [Carbon::create($fyStart, 4, 1), Carbon::create($fyStart, 6, 30), 'Q1'],
            2 => [Carbon::create($fyStart, 7, 1), Carbon::create($fyStart, 9, 30), 'Q2'],
            3 => [Carbon::create($fyStart, 10, 1), Carbon::create($fyStart, 12, 31), 'Q3'],
            4 => [Carbon::create($fyStart + 1, 1, 1), Carbon::create($fyStart + 1, 3, 31), 'Q4'],
        };
    }

    private function getQuarterMonths(int $fyStart, int $quarter): array
    {
        return match ($quarter) {
            1 => [
                ['key' => sprintf('%d-04', $fyStart), 'label' => 'April'],
                ['key' => sprintf('%d-05', $fyStart), 'label' => 'May'],
                ['key' => sprintf('%d-06', $fyStart), 'label' => 'June'],
            ],
            2 => [
                ['key' => sprintf('%d-07', $fyStart), 'label' => 'July'],
                ['key' => sprintf('%d-08', $fyStart), 'label' => 'August'],
                ['key' => sprintf('%d-09', $fyStart), 'label' => 'September'],
            ],
            3 => [
                ['key' => sprintf('%d-10', $fyStart), 'label' => 'October'],
                ['key' => sprintf('%d-11', $fyStart), 'label' => 'November'],
                ['key' => sprintf('%d-12', $fyStart), 'label' => 'December'],
            ],
            4 => [
                ['key' => sprintf('%d-01', $fyStart + 1), 'label' => 'January'],
                ['key' => sprintf('%d-02', $fyStart + 1), 'label' => 'February'],
                ['key' => sprintf('%d-03', $fyStart + 1), 'label' => 'March'],
            ],
        };
    }
}
