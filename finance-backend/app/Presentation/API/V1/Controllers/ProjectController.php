<?php

namespace App\Presentation\API\V1\Controllers;

use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ProjectController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Project::query();

            if ($status = $request->query('status')) {
                $query->where('status', $status);
            }

            if ($search = $request->query('search')) {
                $query->where('name', 'like', "%{$search}%");
            }

            $perPage = (int) $request->query('per_page', 50);
            $projects = $query->orderBy('name')->paginate($perPage);

            return $this->successResponse([
                'projects' => $projects->items(),
                'meta' => [
                    'current_page' => $projects->currentPage(),
                    'per_page' => $projects->perPage(),
                    'total' => $projects->total(),
                    'last_page' => $projects->lastPage(),
                ],
            ]);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to fetch projects: ' . $e->getMessage(), 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $this->validateData($request);
            $project = Project::create($validated);

            return $this->createdResponse([
                'project' => $project,
            ], 'Project created successfully');
        } catch (ValidationException $e) {
            return $this->errorResponse('Validation failed', 422, $e->errors());
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to create project: ' . $e->getMessage(), 500);
        }
    }

    public function show(Project $project): JsonResponse
    {
        return $this->successResponse([
            'project' => $project,
        ]);
    }

    public function update(Request $request, Project $project): JsonResponse
    {
        try {
            $validated = $this->validateData($request, true);
            $project->update($validated);

            return $this->successResponse([
                'project' => $project,
            ], 'Project updated successfully');
        } catch (ValidationException $e) {
            return $this->errorResponse('Validation failed', 422, $e->errors());
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to update project: ' . $e->getMessage(), 500);
        }
    }

    public function destroy(Project $project): JsonResponse
    {
        try {
            $project->delete();
            return $this->successResponse(null, 'Project deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to delete project: ' . $e->getMessage(), 500);
        }
    }

    private function validateData(Request $request, bool $isUpdate = false): array
    {
        $rules = [
            'name' => $isUpdate ? 'sometimes|required|string|max:255' : 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'nullable|in:active,completed,on_hold,cancelled',
            'start_date' => $isUpdate ? 'sometimes|date' : 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ];

        $validated = $request->validate($rules);

        // Provide sensible defaults when optional fields are omitted
        $validated['status'] = $validated['status'] ?? 'active';
        $validated['start_date'] = $validated['start_date'] ?? now()->toDateString();

        return $validated;
    }
}

