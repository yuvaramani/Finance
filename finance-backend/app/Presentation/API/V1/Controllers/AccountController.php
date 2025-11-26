<?php

namespace App\Presentation\API\V1\Controllers;

use App\Models\Account;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AccountController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Account::with('group');

            if ($status = $request->query('status')) {
                $query->where('status', $status);
            }

            if ($groupId = $request->query('group_id')) {
                $query->where('group_id', $groupId);
            }

            if ($search = $request->query('search')) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                });
            }

            $perPage = (int) $request->query('per_page', 25);
            $accounts = $query->orderBy('name')->paginate($perPage);

            return $this->successResponse([
                'accounts' => $accounts->through(fn ($account) => $this->transformAccount($account)),
                'meta' => [
                    'current_page' => $accounts->currentPage(),
                    'per_page' => $accounts->perPage(),
                    'total' => $accounts->total(),
                    'last_page' => $accounts->lastPage(),
                ],
            ]);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to fetch accounts: ' . $e->getMessage(), 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $this->validateData($request);
            $account = Account::create($validated);
            $account->load('group');

            return $this->createdResponse([
                'account' => $this->transformAccount($account),
            ], 'Account created successfully');
        } catch (ValidationException $e) {
            return $this->errorResponse('Validation failed', 422, $e->errors());
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to create account: ' . $e->getMessage(), 500);
        }
    }

    public function show(Account $account): JsonResponse
    {
        $account->load('group');
        return $this->successResponse([
            'account' => $this->transformAccount($account),
        ]);
    }

    public function update(Request $request, Account $account): JsonResponse
    {
        try {
            $validated = $this->validateData($request, true);
            $account->update($validated);
            $account->load('group');

            return $this->successResponse([
                'account' => $this->transformAccount($account),
            ], 'Account updated successfully');
        } catch (ValidationException $e) {
            return $this->errorResponse('Validation failed', 422, $e->errors());
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to update account: ' . $e->getMessage(), 500);
        }
    }

    public function destroy(Account $account): JsonResponse
    {
        try {
            $account->delete();
            return $this->successResponse(null, 'Account deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to delete account: ' . $e->getMessage(), 500);
        }
    }

    private function validateData(Request $request, bool $isUpdate = false): array
    {
        $rules = [
            'group_id' => [
                $isUpdate ? 'sometimes' : 'required',
                'integer',
                'exists:groups,id',
            ],
            'name' => $isUpdate ? 'sometimes|required|string|max:255' : 'required|string|max:255',
            'status' => [
                $isUpdate ? 'sometimes' : 'required',
                Rule::in(['Active', 'Archive']),
            ],
            'balance' => $isUpdate ? 'sometimes|numeric' : 'nullable|numeric',
        ];

        $validated = $request->validate($rules);
        $validated['balance'] = $validated['balance'] ?? 0;

        return $validated;
    }

    private function transformAccount(Account $account): array
    {
        return [
            'id' => $account->id,
            'name' => $account->name,
            'group_id' => $account->group_id,
            'group_name' => $account->group?->name,
            'status' => $account->status,
            'balance' => $account->balance,
        ];
    }
}



