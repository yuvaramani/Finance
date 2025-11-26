# Employee Module API Implementation Guide

This guide shows you how to connect the Employee frontend to the Laravel backend.

## Backend Implementation

### 1. Employee Model (`app/Models/Employee.php`)

Replace the entire file content with:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'acc_name',
        'acc_number',
        'ifsc_code',
        'pan_no',
        'status',
    ];

    protected $casts = [
        'status' => 'string',
    ];

    public function projects()
    {
        return $this->belongsToMany(Project::class, 'employee_project');
    }
}
```

### 2. Project Model (`app/Models/Project.php`)

Replace the entire file content with:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'status',
    ];

    public function employees()
    {
        return $this->belongsToMany(Employee::class, 'employee_project');
    }
}
```

### 3. EmployeeController (`app/Http/Controllers/EmployeeController.php`)

Replace the entire file content with:

```php
<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    public function index()
    {
        $employees = Employee::with('projects')
            ->where('status', 'active')
            ->get()
            ->map(function ($employee) {
                return [
                    'id' => $employee->id,
                    'name' => $employee->name,
                    'accName' => $employee->acc_name,
                    'accNumber' => $employee->acc_number,
                    'ifscCode' => $employee->ifsc_code,
                    'panNo' => $employee->pan_no,
                    'projects' => $employee->projects->pluck('name')->toArray(),
                    'status' => $employee->status,
                ];
            });

        return response()->json($employees);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'accName' => 'required|string|max:255',
            'accNumber' => 'required|string|max:255',
            'ifscCode' => 'required|string|max:255',
            'panNo' => 'required|string|size:10',
            'projects' => 'array',
            'projects.*' => 'exists:projects,name',
        ]);

        $employee = Employee::create([
            'name' => $validated['name'],
            'acc_name' => $validated['accName'],
            'acc_number' => $validated['accNumber'],
            'ifsc_code' => $validated['ifscCode'],
            'pan_no' => $validated['panNo'],
            'status' => 'active',
        ]);

        if (!empty($validated['projects'])) {
            $projectIds = \App\Models\Project::whereIn('name', $validated['projects'])->pluck('id');
            $employee->projects()->attach($projectIds);
        }

        $employee->load('projects');

        return response()->json([
            'id' => $employee->id,
            'name' => $employee->name,
            'accName' => $employee->acc_name,
            'accNumber' => $employee->acc_number,
            'ifscCode' => $employee->ifsc_code,
            'panNo' => $employee->pan_no,
            'projects' => $employee->projects->pluck('name')->toArray(),
            'status' => $employee->status,
        ], 201);
    }

    public function update(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'accName' => 'required|string|max:255',
            'accNumber' => 'required|string|max:255',
            'ifscCode' => 'required|string|max:255',
            'panNo' => 'required|string|size:10',
            'projects' => 'array',
            'projects.*' => 'exists:projects,name',
        ]);

        $employee->update([
            'name' => $validated['name'],
            'acc_name' => $validated['accName'],
            'acc_number' => $validated['accNumber'],
            'ifsc_code' => $validated['ifscCode'],
            'pan_no' => $validated['panNo'],
        ]);

        if (isset($validated['projects'])) {
            $projectIds = \App\Models\Project::whereIn('name', $validated['projects'])->pluck('id');
            $employee->projects()->sync($projectIds);
        }

        $employee->load('projects');

        return response()->json([
            'id' => $employee->id,
            'name' => $employee->name,
            'accName' => $employee->acc_name,
            'accNumber' => $employee->acc_number,
            'ifscCode' => $employee->ifsc_code,
            'panNo' => $employee->pan_no,
            'projects' => $employee->projects->pluck('name')->toArray(),
            'status' => $employee->status,
        ]);
    }

    public function destroy(Employee $employee)
    {
        $employee->update(['status' => 'archived']);
        return response()->json(['message' => 'Employee archived successfully']);
    }
}
```

### 4. ProjectController (`app/Http/Controllers/ProjectController.php`)

Replace the entire file content with:

```php
<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index()
    {
        $projects = Project::where('status', 'active')
            ->pluck('name');

        return response()->json($projects);
    }
}
```

### 5. API Routes (`routes/api.php`)

Add these routes to your `routes/api.php` file:

```php
// Employee routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/employees', [App\Http\Controllers\EmployeeController::class, 'index']);
    Route::post('/employees', [App\Http\Controllers\EmployeeController::class, 'store']);
    Route::put('/employees/{employee}', [App\Http\Controllers\EmployeeController::class, 'update']);
    Route::delete('/employees/{employee}', [App\Http\Controllers\EmployeeController::class, 'destroy']);

    // Projects route
    Route::get('/projects', [App\Http\Controllers\ProjectController::class, 'index']);
});
```

### 6. Add Sample Projects to Database

Run this SQL to add some sample projects:

```sql
INSERT INTO projects (name, status, created_at, updated_at) VALUES
('Project Alpha', 'active', NOW(), NOW()),
('Project Beta', 'active', NOW(), NOW()),
('Project Gamma', 'active', NOW(), NOW()),
('Project Delta', 'active', NOW(), NOW()),
('Project Epsilon', 'active', NOW(), NOW()),
('Project Zeta', 'active', NOW(), NOW());
```

Run this command:
```bash
"C:\xampp\mysql\bin\mysql.exe" -u root finance_db < projects_seed.sql
```

## Frontend Implementation

### Update EmployeeList Component

File: `c:\xampp\htdocs\Finance\finance-frontend\src\features\employees\components\EmployeeList.tsx`

Replace the file with the implementation that includes API calls using axios or fetch with the Laravel backend at `http://localhost:8000/api`.

Key changes needed:
1. Replace `mockEmployees` with API call to `/api/employees`
2. Replace `availableProjects` with API call to `/api/projects`
3. Update `handleSave` to POST/PUT to `/api/employees` or `/api/employees/{id}`
4. Update `handleArchive` to DELETE `/api/employees/{id}`

Make sure to:
- Use `Authorization: Bearer {token}` header
- Use the correct API_URL from environment variables
- Handle loading states and errors

## Testing

1. Start Laravel backend: `php artisan serve`
2. Start React frontend: Already running on port 3002
3. Login to the application
4. Navigate to Settings > Employees
5. Test CRUD operations

