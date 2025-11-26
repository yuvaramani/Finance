<?php

namespace App\Presentation\API\V1\Controllers;

use App\Models\Income;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class IncomeController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Income::with(['account', 'source'])
                ->orderByDesc('date')
                ->orderByDesc('id');

            if ($search = $request->input('search')) {
                $query->where(function ($q) use ($search) {
                    $q->whereHas('account', fn ($accountQuery) =>
                        $accountQuery->where('name', 'like', '%' . $search . '%')
                    )->orWhereHas('source', fn ($sourceQuery) =>
                        $sourceQuery->where('source_name', 'like', '%' . $search . '%')
                    )->orWhere('description', 'like', '%' . $search . '%');
                });
            }

            $incomes = $query->get()->map(function ($income) {
                return [
                    'id' => $income->id,
                    'date' => $income->date->toDateString(),
                    'amount' => $income->amount,
                    'description' => $income->description,
                    'account' => [
                        'id' => $income->account?->id,
                        'name' => $income->account?->name,
                    ],
                    'source' => [
                        'id' => $income->source?->id,
                        'name' => $income->source?->name,
                    ],
                ];
            });

            return $this->successResponse(['incomes' => $incomes]);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to load incomes: ' . $e->getMessage(), 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $this->validateData($request);
            $income = Income::create($validated);

            return $this->createdResponse([
                'income' => $income->load(['account', 'source']),
            ], 'Income created successfully');
        } catch (ValidationException $e) {
            return $this->errorResponse('Validation failed', 422, $e->errors());
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to create income: ' . $e->getMessage(), 500);
        }
    }

    public function show(Income $income): JsonResponse
    {
        return $this->successResponse([
            'income' => $income->load(['account', 'source']),
        ]);
    }

    public function update(Request $request, Income $income): JsonResponse
    {
        try {
            $validated = $this->validateData($request, true);
            $income->update($validated);

            return $this->successResponse([
                'income' => $income->load(['account', 'source']),
            ], 'Income updated successfully');
        } catch (ValidationException $e) {
            return $this->errorResponse('Validation failed', 422, $e->errors());
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to update income: ' . $e->getMessage(), 500);
        }
    }

    public function destroy(Income $income): JsonResponse
    {
        try {
            $income->delete();
            return $this->successResponse(null, 'Income deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to delete income: ' . $e->getMessage(), 500);
        }
    }

    private function validateData(Request $request, bool $isUpdate = false): array
    {
        $rules = [
            'date' => [
                $isUpdate ? 'sometimes' : 'required',
                'date',
            ],
            'account_id' => [
                $isUpdate ? 'sometimes' : 'required',
                'exists:accounts,id',
            ],
            'source_id' => [
                $isUpdate ? 'sometimes' : 'required',
                'exists:income_sources,id',
            ],
            'amount' => [
                $isUpdate ? 'sometimes' : 'required',
                'numeric',
                'min:0',
            ],
            'description' => [
                'nullable',
                'string',
                'max:1000',
            ],
        ];

        return $request->validate($rules);
    }
}

