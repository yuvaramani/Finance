<?php

namespace App\Presentation\API\V1\Controllers;

use App\Models\ExpenseCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ExpenseCategoryController extends BaseController
{
    public function index(): JsonResponse
    {
        try {
            $categories = ExpenseCategory::orderBy('category_name')
                ->get()
                ->map(fn ($category) => [
                    'id' => $category->id,
                    'name' => $category->name,
                ]);

            return $this->successResponse(['categories' => $categories]);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to load categories: ' . $e->getMessage(), 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:expense_categories,category_name',
        ]);

        try {
            $category = ExpenseCategory::create([
                'category_name' => $validated['name'],
            ]);

            return $this->createdResponse([
                'category' => $category,
            ], 'Category created successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to create category: ' . $e->getMessage(), 500);
        }
    }

    public function update(Request $request, ExpenseCategory $expenseCategory): JsonResponse
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('expense_categories', 'category_name')->ignore($expenseCategory->id),
            ],
        ]);

        try {
            $expenseCategory->update([
                'category_name' => $validated['name'],
            ]);

            return $this->successResponse(['category' => $expenseCategory], 'Category updated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to update category: ' . $e->getMessage(), 500);
        }
    }

    public function destroy(ExpenseCategory $expenseCategory): JsonResponse
    {
        try {
            $expenseCategory->delete();
            return $this->successResponse(null, 'Category deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to delete category: ' . $e->getMessage(), 500);
        }
    }
}

