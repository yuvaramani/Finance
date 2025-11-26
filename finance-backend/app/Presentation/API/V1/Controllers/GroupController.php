<?php

namespace App\Presentation\API\V1\Controllers;

use App\Models\Group;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class GroupController extends BaseController
{
    public function index(): JsonResponse
    {
        try {
            $groups = Group::orderBy('GroupName')
                ->get()
                ->map(fn ($group) => [
                    'id' => $group->id,
                    'name' => $group->name,
                ]);

            return $this->successResponse([
                'groups' => $groups,
            ]);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to load groups: ' . $e->getMessage(), 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:groups,GroupName',
        ]);

        try {
            $group = Group::create([
                'GroupName' => $validated['name'],
            ]);

            return $this->createdResponse([
                'group' => [
                    'id' => $group->id,
                    'name' => $group->name,
                ],
            ], 'Group created successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to create group: ' . $e->getMessage(), 500);
        }
    }

    public function update(Request $request, Group $group): JsonResponse
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('groups', 'GroupName')->ignore($group->id),
            ],
        ]);

        try {
            $group->update([
                'GroupName' => $validated['name'],
            ]);

            return $this->successResponse([
                'group' => [
                    'id' => $group->id,
                    'name' => $group->name,
                ],
            ], 'Group updated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to update group: ' . $e->getMessage(), 500);
        }
    }

    public function destroy(Group $group): JsonResponse
    {
        try {
            $group->delete();
            return $this->successResponse(null, 'Group deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to delete group: ' . $e->getMessage(), 500);
        }
    }
}

