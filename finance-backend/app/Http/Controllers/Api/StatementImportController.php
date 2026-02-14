<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Log;

class StatementImportController extends Controller
{
    public function parse(Request $request)
    {
        $baseRules = [
            'file' => 'required|file|mimes:xlsx,xls,csv',
            'bank_name' => 'required|string',
            'date_col' => 'required|string',
            'desc_col' => 'required|string',
            'amount_format_type' => 'required|in:separate_debit_credit,drcr_with_amount',
            'trans_id_col' => 'nullable|string',
        ];

        $amountFormat = $request->input('amount_format_type');
        if ($amountFormat === 'drcr_with_amount') {
            $baseRules['amount_col'] = 'required|string';
            $baseRules['drcr_col'] = 'required|string';
            $baseRules['debit_texts'] = 'required|string';
            $baseRules['credit_texts'] = 'required|string';
        } else {
            $baseRules['debit_col'] = 'required|string';
            $baseRules['credit_col'] = 'required|string';
        }

        $request->validate($baseRules);

        try {
            $file = $request->file('file');
            $data = Excel::toArray([], $file);

            if (empty($data) || empty($data[0])) {
                return response()->json(['message' => 'File is empty or invalid'], 422);
            }

            $rows = $data[0]; // First sheet
            $headers = array_shift($rows); // Assume first row is header
            
            // Normalize headers for comparison
            $headers = array_map(function($h) {
                return trim(strtolower($h ?? ''));
            }, $headers);

            $parsedData = [];
            $columnMap = [
                'date' => $this->findIndex($headers, $request->date_col),
                'desc' => $this->findIndex($headers, $request->desc_col),
                'trans_id' => $request->trans_id_col ? $this->findIndex($headers, $request->trans_id_col) : null,
            ];

            if ($amountFormat === 'drcr_with_amount') {
                $columnMap['amount'] = $this->findIndex($headers, $request->amount_col);
                $columnMap['drcr'] = $this->findIndex($headers, $request->drcr_col);
            } else {
                $columnMap['debit'] = $this->findIndex($headers, $request->debit_col);
                $columnMap['credit'] = $this->findIndex($headers, $request->credit_col);
            }

            // Validate columns found
            foreach ($columnMap as $key => $index) {
                if ($index === null) {
                    continue;
                }
                if ($index === false) {
                    $colName = match ($key) {
                        'date' => $request->date_col,
                        'desc' => $request->desc_col,
                        'trans_id' => $request->trans_id_col,
                        'amount' => $request->amount_col,
                        'drcr' => $request->drcr_col,
                        'debit' => $request->debit_col,
                        'credit' => $request->credit_col,
                        default => $request->input($key . '_col'),
                    };
                    return response()->json([
                        'message' => "Column '{$colName}' not found in Excel file"
                    ], 422);
                }
            }

            $debitTokens = $amountFormat === 'drcr_with_amount'
                ? $this->normalizeTokens($request->debit_texts)
                : [];
            $creditTokens = $amountFormat === 'drcr_with_amount'
                ? $this->normalizeTokens($request->credit_texts)
                : [];

            foreach ($rows as $index => $row) {
                // Skip empty rows
                if ($this->isRowEmpty($row)) continue;

                $dateRaw = $row[$columnMap['date']] ?? null;
                $desc = $row[$columnMap['desc']] ?? '';
                $transId = ($columnMap['trans_id'] !== null) ? ($row[$columnMap['trans_id']] ?? '') : '';
                $debit = 0;
                $credit = 0;
                $amount = 0;
                $type = null;

                if ($amountFormat === 'drcr_with_amount') {
                    $indicatorRaw = $row[$columnMap['drcr']] ?? '';
                    $indicator = $this->normalizeIndicator($indicatorRaw);
                    $amount = $this->parseAmount($row[$columnMap['amount']] ?? 0);

                    if ($amount == 0) continue;

                    if ($this->matchesToken($indicator, $debitTokens)) {
                        $type = 'expense';
                        $debit = $amount;
                    } elseif ($this->matchesToken($indicator, $creditTokens)) {
                        $type = 'income';
                        $credit = $amount;
                    } else {
                        // Unknown indicator, skip row
                        continue;
                    }
                } else {
                    $debit = $this->parseAmount($row[$columnMap['debit']] ?? 0);
                    $credit = $this->parseAmount($row[$columnMap['credit']] ?? 0);

                    // Skip if no amount
                    if ($debit == 0 && $credit == 0) continue;

                    // Determine type
                    $type = $credit > 0 ? 'income' : 'expense';
                    $amount = $credit > 0 ? $credit : $debit;
                }

                // Try to parse date
                $date = $this->parseDate($dateRaw);

                $parsedData[] = [
                    'id' => $index + 1, // Temporary ID for frontend
                    'date' => $date,
                    'description' => $desc,
                    'transaction_id' => $transId,
                    'amount' => $amount,
                    'debit' => $debit,
                    'credit' => $credit,
                    'type' => $type,
                    'category' => '', // To be filled by user
                    'notes' => '',
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $parsedData
            ]);

        } catch (\Exception $e) {
            Log::error('Import Error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to parse file: ' . $e->getMessage()
            ], 500);
        }
    }

    private function findIndex($headers, $colName)
    {
        $search = trim(strtolower($colName));
        $index = array_search($search, $headers);
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
             // Excel date serial number handling
            if (is_numeric($value)) {
                 return \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($value)->format('Y-m-d');
            }
            return date('Y-m-d', strtotime($value));
        } catch (\Exception $e) {
            return null;
        }
    }

    private function normalizeTokens(string $tokens): array
    {
        $parts = array_map('trim', explode(',', $tokens));
        $parts = array_filter($parts, fn ($t) => $t !== '');
        return array_map(fn ($t) => strtoupper($t), $parts);
    }

    private function normalizeIndicator($value): string
    {
        $str = is_string($value) ? $value : strval($value);
        return strtoupper(trim($str));
    }

    private function matchesToken(string $indicator, array $tokens): bool
    {
        foreach ($tokens as $token) {
            if ($indicator === $token) {
                return true;
            }
            if ($token !== '' && strlen($token) >= 2 && str_contains($indicator, $token)) {
                return true;
            }
        }
        return false;
    }
}
