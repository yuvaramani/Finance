<?php

namespace App\Presentation\API\V1\Controllers;

use App\Models\Expense;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ExpenseController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Expense::with(['account', 'category'])
                ->orderByDesc('date')
                ->orderByDesc('id');

            if ($search = $request->input('search')) {
                $query->where(function ($q) use ($search) {
                    $q->whereHas('account', fn ($accountQuery) =>
                        $accountQuery->where('name', 'like', '%' . $search . '%')
                    )->orWhereHas('category', fn ($categoryQuery) =>
                        $categoryQuery->where('name', 'like', '%' . $search . '%')
                    )->orWhere('description', 'like', '%' . $search . '%');
                });
            }

            if ($date = $request->input('date')) {
                $query->whereDate('date', $date);
            }

            if ($accountId = $request->input('account_id')) {
                $query->where('account_id', $accountId);
            }

            if ($categoryId = $request->input('category_id')) {
                $query->where('category_id', $categoryId);
            }

            if ($amount = $request->input('amount')) {
                $query->where('amount', $amount);
            }

            $expenses = $query->get()->map(function ($expense) {
                return [
                    'id' => $expense->id,
                    'date' => $expense->date->toDateString(),
                    'amount' => $expense->amount,
                    'description' => $expense->description,
                    'transaction_id' => $expense->transaction_id,
                    'account' => [
                        'id' => $expense->account?->id,
                        'name' => $expense->account?->name,
                    ],
                    'category' => [
                        'id' => $expense->category?->id,
                        'name' => $expense->category?->name,
                    ],
                ];
            });

            return $this->successResponse(['expenses' => $expenses]);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to load expenses: ' . $e->getMessage(), 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $this->validateData($request);
            $expense = Expense::create($validated);

            return $this->createdResponse([
                'expense' => $expense->load(['account', 'category']),
            ], 'Expense created successfully');
        } catch (ValidationException $e) {
            return $this->errorResponse('Validation failed', 422, $e->errors());
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to create expense: ' . $e->getMessage(), 500);
        }
    }

    public function show(Expense $expense): JsonResponse
    {
        return $this->successResponse([
            'expense' => $expense->load(['account', 'category']),
        ]);
    }

    public function update(Request $request, Expense $expense): JsonResponse
    {
        try {
            $validated = $this->validateData($request, true);
            $expense->update($validated);

            return $this->successResponse([
                'expense' => $expense->load(['account', 'category']),
            ], 'Expense updated successfully');
        } catch (ValidationException $e) {
            return $this->errorResponse('Validation failed', 422, $e->errors());
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to update expense: ' . $e->getMessage(), 500);
        }
    }

    public function destroy(Expense $expense): JsonResponse
    {
        try {
            $expense->delete();
            return $this->successResponse(null, 'Expense deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to delete expense: ' . $e->getMessage(), 500);
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
            'category_id' => [
                $isUpdate ? 'sometimes' : 'required',
                'exists:expense_categories,id',
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
            'transaction_id' => [
                'nullable',
                'string',
                'max:255',
            ],
        ];

        return $request->validate($rules);
    }
}










