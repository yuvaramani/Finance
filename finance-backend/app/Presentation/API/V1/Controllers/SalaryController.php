<?php

namespace App\Presentation\API\V1\Controllers;

use App\Models\Salary;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class SalaryController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Salary::with(['employee', 'account'])
                ->orderByDesc('date')
                ->orderByDesc('id');

            if ($search = $request->input('search')) {
                $query->where(function ($q) use ($search) {
                    $q->whereHas('employee', fn ($employeeQuery) =>
                        $employeeQuery->where('name', 'like', '%' . $search . '%')
                    );
                });
            }

            if ($employeeId = $request->input('employee_id')) {
                $query->where('employee_id', $employeeId);
            }

            if ($fromDate = $request->input('from_date')) {
                $query->whereDate('date', '>=', $fromDate);
            }

            if ($toDate = $request->input('to_date')) {
                $query->whereDate('date', '<=', $toDate);
            }

            if ($month = $request->input('month')) {
                $query->whereMonth('date', date('m', strtotime($month)))
                      ->whereYear('date', date('Y', strtotime($month)));
            }

            $salaries = $query->get()->map(function ($salary) {
                return [
                    'id' => $salary->id,
                    'date' => $salary->date->toDateString(),
                    'salary' => $salary->gross_salary ?? $salary->salary ?? 0, // Backward compatibility
                    'gross_salary' => $salary->gross_salary ?? $salary->salary ?? 0,
                    'tds' => $salary->tds ?? 0,
                    'net_salary' => $salary->net_salary ?? 0,
                    'employee' => [
                        'id' => $salary->employee?->id,
                        'name' => $salary->employee?->name,
                        'pan_no' => $salary->employee?->pan_no,
                    ],
                    'account' => [
                        'id' => $salary->account?->id,
                        'name' => $salary->account?->name,
                    ],
                ];
            });

            return $this->successResponse(['salaries' => $salaries]);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to load salaries: ' . $e->getMessage(), 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $this->validateData($request);
            $salary = Salary::create($validated);

            return $this->createdResponse([
                'salary' => $salary->load(['employee', 'account']),
            ], 'Salary payment created successfully');
        } catch (ValidationException $e) {
            return $this->errorResponse('Validation failed', 422, $e->errors());
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to create salary payment: ' . $e->getMessage(), 500);
        }
    }

    public function show(Salary $salary): JsonResponse
    {
        return $this->successResponse([
            'salary' => $salary->load(['employee', 'account']),
        ]);
    }

    public function update(Request $request, Salary $salary): JsonResponse
    {
        try {
            $validated = $this->validateData($request, true);
            $salary->update($validated);

            return $this->successResponse([
                'salary' => $salary->load(['employee', 'account']),
            ], 'Salary payment updated successfully');
        } catch (ValidationException $e) {
            return $this->errorResponse('Validation failed', 422, $e->errors());
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to update salary payment: ' . $e->getMessage(), 500);
        }
    }

    public function destroy(Salary $salary): JsonResponse
    {
        try {
            $salary->delete();
            return $this->successResponse(null, 'Salary payment deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to delete salary payment: ' . $e->getMessage(), 500);
        }
    }

    private function validateData(Request $request, bool $isUpdate = false): array
    {
        $rules = [
            'date' => $isUpdate ? 'sometimes|required|date' : 'required|date',
            'employee_id' => $isUpdate ? 'sometimes|required|exists:employees,id' : 'required|exists:employees,id',
            'account_id' => $isUpdate ? 'sometimes|nullable|exists:accounts,id' : 'nullable|exists:accounts,id',
            'gross_salary' => $isUpdate ? 'sometimes|required|numeric|min:0' : 'required|numeric|min:0',
            'tds' => 'nullable|numeric|min:0',
            'net_salary' => 'nullable|numeric|min:0',
        ];

        $validated = $request->validate($rules);
        
        // Backward compatibility: if 'salary' is sent instead of 'gross_salary', use it
        if (isset($validated['salary']) && !isset($validated['gross_salary'])) {
            $validated['gross_salary'] = $validated['salary'];
            unset($validated['salary']);
        }
        
        return $validated;
    }
}

