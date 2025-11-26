<?php

namespace App\Presentation\API\V1\Controllers;

use App\Models\IncomeSource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class IncomeSourceController extends BaseController
{
    public function index(): JsonResponse
    {
        try {
            $sources = IncomeSource::orderBy('source_name')
                ->get()
                ->map(fn ($source) => [
                    'id' => $source->id,
                    'name' => $source->name,
                ]);

            return $this->successResponse(['sources' => $sources]);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to load sources: ' . $e->getMessage(), 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:income_sources,source_name',
        ]);

        try {
            $source = IncomeSource::create([
                'source_name' => $validated['name'],
            ]);

            return $this->createdResponse([
                'source' => [
                    'id' => $source->id,
                    'name' => $source->name,
                ],
            ], 'Source created successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to create source: ' . $e->getMessage(), 500);
        }
    }

    public function update(Request $request, IncomeSource $source): JsonResponse
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('income_sources', 'source_name')->ignore($source->id),
            ],
        ]);

        try {
            $source->update([
                'source_name' => $validated['name'],
            ]);

            return $this->successResponse([
                'source' => [
                    'id' => $source->id,
                    'name' => $source->name,
                ],
            ], 'Source updated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to update source: ' . $e->getMessage(), 500);
        }
    }

    public function destroy(IncomeSource $source): JsonResponse
    {
        try {
            $source->delete();
            return $this->successResponse(null, 'Source deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to delete source: ' . $e->getMessage(), 500);
        }
    }
}

