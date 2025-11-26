<?php

namespace App\Presentation\API\V1\Controllers;

use App\Models\Employee;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class EmployeeController extends BaseController
{
    /**
     * Display a listing of the employees.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Employee::query();

            if ($status = $request->query('status')) {
                $query->where('status', $status);
            }

            if ($search = $request->query('search')) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('account_name', 'like', "%{$search}%")
                        ->orWhere('account_number', 'like', "%{$search}%")
                        ->orWhere('pan_no', 'like', "%{$search}%");
                });
            }

            $perPage = (int) $request->query('per_page', 25);
            $employees = $query->latest()->paginate($perPage);

            return $this->successResponse([
                'employees' => collect($employees->items())->map(function ($employee) {
                    $employee->projects = $this->decodeProjects($employee->projects);
                    return $employee;
                }),
                'meta' => [
                    'current_page' => $employees->currentPage(),
                    'per_page' => $employees->perPage(),
                    'total' => $employees->total(),
                    'last_page' => $employees->lastPage(),
                ],
            ]);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to fetch employees: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Store a newly created employee in storage.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $this->validateData($request);

            $payload = $this->transformPayload($validated);
            $employee = Employee::create($payload);

            return $this->createdResponse([
                'employee' => $employee,
            ], 'Employee created successfully');
        } catch (ValidationException $e) {
            return $this->errorResponse('Validation failed', 422, $e->errors());
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to create employee: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Display the specified employee.
     */
    public function show(Employee $employee): JsonResponse
    {
        return $this->successResponse([
            'employee' => $employee,
        ]);
    }

    /**
     * Update the specified employee in storage.
     */
    public function update(Request $request, Employee $employee): JsonResponse
    {
        try {
            $validated = $this->validateData($request, $employee->id, true);

            $payload = $this->transformPayload($validated);
            $employee->update($payload);

            return $this->successResponse([
                'employee' => $employee,
            ], 'Employee updated successfully');
        } catch (ValidationException $e) {
            return $this->errorResponse('Validation failed', 422, $e->errors());
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to update employee: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Remove the specified employee from storage.
     */
    public function destroy(Employee $employee): JsonResponse
    {
        try {
            $employee->delete();
            return $this->successResponse(null, 'Employee deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to delete employee: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Archive the specified employee.
     */
    public function archive(Employee $employee): JsonResponse
    {
        try {
            if ($employee->status === 'archived') {
                return $this->successResponse([
                    'employee' => $employee,
                ], 'Employee already archived');
            }

            $employee->update([
                'status' => 'archived',
                'archived_at' => now(),
            ]);

            return $this->successResponse([
                'employee' => $employee,
            ], 'Employee archived successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to archive employee: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Validate incoming data.
     */
    private function validateData(Request $request, ?int $employeeId = null, bool $isUpdate = false): array
    {
        $rules = [
            'name' => $isUpdate ? 'sometimes|required|string|max:255' : 'required|string|max:255',
            'account_name' => $isUpdate ? 'sometimes|required|string|max:255' : 'required|string|max:255',
            'account_number' => [
                $isUpdate ? 'sometimes' : 'required',
                'string',
                'max:30',
            ],
            'ifsc_code' => [
                $isUpdate ? 'sometimes' : 'required',
                'string',
                'max:20',
            ],
            'pan_no' => [
                $isUpdate ? 'sometimes' : 'required',
                'string',
                'max:12',
            ],
            'projects' => 'nullable|array',
            'projects.*' => 'string|max:255',
            'status' => 'nullable|in:active,archived',
        ];

        return $request->validate($rules);
    }

    /**
     * Normalize payload to support legacy columns.
     */
    private function transformPayload(array $data): array
    {
        if (array_key_exists('projects', $data) && is_array($data['projects'])) {
            // Convert project IDs to integers and store as comma-separated string or JSON
            $projectIds = array_map(function($project) {
                // If it's already a number, use it; if it's a string, try to convert
                if (is_numeric($project)) {
                    return (int) $project;
                }
                // If it's a name, try to find the project ID (legacy support)
                $projectModel = \App\Models\Project::where('name', $project)->first();
                return $projectModel ? $projectModel->id : null;
            }, $data['projects']);
            
            // Filter out null values and store as comma-separated string
            $projectIds = array_filter($projectIds, fn($id) => $id !== null);
            $data['projects'] = !empty($projectIds) ? implode(',', $projectIds) : null;
        }

        return $data;
    }

    private function decodeProjects($value)
    {
        if (is_null($value) || $value === '') {
            return [];
        }

        if (is_array($value)) {
            // Convert to string IDs
            return array_map(fn($id) => (string) $id, $value);
        }

        // Try JSON decode first
        $decoded = json_decode($value, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            return array_map(fn($id) => (string) $id, $decoded);
        }

        // If not JSON, treat as comma-separated string
        if (is_string($value)) {
            $ids = array_filter(array_map('trim', explode(',', $value)));
            return array_map(fn($id) => (string) $id, $ids);
        }

        return [];
    }
}

