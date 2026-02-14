<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Facades\Excel;

class SalaryImportController extends Controller
{
    public function parse(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv',
        ]);

        try {
            $file = $request->file('file');
            $data = Excel::toArray([], $file);

            if (empty($data) || empty($data[0])) {
                return response()->json(['message' => 'File is empty or invalid'], 422);
            }

            $rows = $data[0]; // First sheet
            $headers = array_shift($rows); // Assume first row is header

            $headers = array_map(function ($h) {
                return trim(strtolower($h ?? ''));
            }, $headers);

            $dateIndex = $this->findIndex($headers, 'date');
            $accountIndex = $this->findIndex($headers, 'account');
            $debitIndex = $this->findIndex($headers, 'debit');

            if ($dateIndex === false || $accountIndex === false || $debitIndex === false) {
                return response()->json([
                    'message' => "Columns 'Date', 'Account', and 'Debit' are required in the Excel file"
                ], 422);
            }

            $employees = Employee::select('id', 'name')->get();
            $employeeMap = $employees->mapWithKeys(function ($emp) {
                return [strtolower(trim($emp->name)) => $emp];
            });

            $parsedData = [];

            foreach ($rows as $index => $row) {
                if ($this->isRowEmpty($row)) {
                    continue;
                }

                $dateRaw = $row[$dateIndex] ?? null;
                $accountRaw = $row[$accountIndex] ?? '';
                $debitRaw = $row[$debitIndex] ?? 0;

                $date = $this->parseDate($dateRaw);
                $accountName = trim(strval($accountRaw));
                $grossSalary = $this->parseAmount($debitRaw);
                $tds = $grossSalary > 0 ? $grossSalary * 0.10 : 0;
                $netSalary = $grossSalary - $tds;

                $employee = $accountName !== ''
                    ? ($employeeMap[strtolower($accountName)] ?? null)
                    : null;

                $warnings = [];
                if (!$date) {
                    $warnings[] = 'Invalid date';
                }
                if ($accountName === '') {
                    $warnings[] = 'Missing account';
                } elseif (!$employee) {
                    $warnings[] = 'Employee not found';
                }
                if ($grossSalary <= 0) {
                    $warnings[] = 'Invalid gross salary';
                }

                $parsedData[] = [
                    'id' => $index + 1,
                    'row_index' => $index + 2, // header + 1-based
                    'date' => $date,
                    'account' => $accountName,
                    'employee_id' => $employee?->id,
                    'employee_name' => $employee?->name,
                    'gross_salary' => round($grossSalary, 2),
                    'tds' => round($tds, 2),
                    'net_salary' => round($netSalary, 2),
                    'warnings' => $warnings,
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $parsedData,
            ]);
        } catch (\Exception $e) {
            Log::error('Salary Import Error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to parse file: ' . $e->getMessage(),
            ], 500);
        }
    }

    private function findIndex($headers, $colName)
    {
        $search = trim(strtolower($colName));
        $index = array_search($search, $headers, true);
        return $index !== false ? $index : false;
    }

    private function isRowEmpty($row)
    {
        foreach ($row as $cell) {
            if (!empty($cell)) return false;
        }
        return true;
    }

    private function parseAmount($value)
    {
        if (is_string($value)) {
            $value = str_replace([',', '$', ' '], '', $value);
        }
        return floatval($value);
    }

    private function parseDate($value)
    {
        try {
            if (is_numeric($value)) {
                return \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($value)->format('Y-m-d');
            }
            return date('Y-m-d', strtotime($value));
        } catch (\Exception $e) {
            return null;
        }
    }
}
