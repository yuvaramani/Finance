<?php

use App\Presentation\API\V1\Controllers\AuthController;
use App\Presentation\API\V1\Controllers\EmployeeController;
use App\Presentation\API\V1\Controllers\AccountController;
use App\Presentation\API\V1\Controllers\GroupController;
use App\Presentation\API\V1\Controllers\ProjectController;
use App\Presentation\API\V1\Controllers\ExpenseCategoryController;
use App\Presentation\API\V1\Controllers\ExpenseController;
use App\Presentation\API\V1\Controllers\IncomeController;
use App\Presentation\API\V1\Controllers\IncomeSourceController;
use App\Presentation\API\V1\Controllers\SalaryController;
use App\Http\Controllers\Api\StatementImportController;
use App\Http\Controllers\Api\SalaryImportController;
use App\Http\Controllers\Api\TdsExportController;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Version 1
|--------------------------------------------------------------------------
|
| These routes are loaded with the /api/v1 prefix and are assigned the
| "api" middleware group. They use Laravel Sanctum for authentication.
|
*/

// Health check endpoint (public)
Route::get('/health', function () {
    return response()->json([
        'status' => 'healthy',
        'service' => 'Finance API',
        'version' => '1.0.0',
        'timestamp' => now()->toIso8601String(),
    ]);
});

// Public routes (no authentication required)
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {

    // Authentication routes
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // User routes
    Route::prefix('user')->group(function () {
        Route::get('/profile', [AuthController::class, 'user']);
        // Route::put('/profile', [UserController::class, 'update']);
    });

    // Employee management
    Route::apiResource('employees', EmployeeController::class);
    Route::post('employees/{employee}/archive', [EmployeeController::class, 'archive'])
        ->name('employees.archive');

    // Groups & Accounts
    Route::apiResource('groups', GroupController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::apiResource('accounts', AccountController::class);

    // Projects
    Route::apiResource('projects', ProjectController::class);

    // Income & Expenses
    Route::apiResource('income-sources', IncomeSourceController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::apiResource('incomes', IncomeController::class);
    Route::apiResource('expense-categories', ExpenseCategoryController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::apiResource('expenses', ExpenseController::class);
    
    // Salaries
    Route::apiResource('salaries', SalaryController::class);
    Route::post('/salaries/parse', [SalaryImportController::class, 'parse']);

    // Statement Import
    Route::post('/statements/parse', [StatementImportController::class, 'parse']);

    // TDS Export
    Route::get('/tds/quarter-export', [TdsExportController::class, 'exportQuarter']);



    // Financial management routes will be added here
    // Route::apiResource('accounts', AccountController::class);
    // Route::apiResource('transactions', TransactionController::class);
    // Route::apiResource('budgets', BudgetController::class);
    // Route::apiResource('categories', CategoryController::class);
});
