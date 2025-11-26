<?php

namespace Database\Factories;

use App\Models\Employee;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Employee>
 */
class EmployeeFactory extends Factory
{
    protected $model = Employee::class;

    /**
     * Define the model's default state.
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->name(),
            'account_name' => $this->faker->name(),
            'account_number' => $this->faker->bankAccountNumber(),
            'ifsc_code' => strtoupper($this->faker->bothify('????0#####')),
            'pan_no' => strtoupper($this->faker->bothify('?????####?')),
            'projects' => $this->faker->randomElements([
                'Project Alpha',
                'Project Beta',
                'Project Gamma',
                'Project Delta',
                'Project Epsilon',
            ], rand(1, 3)),
            'status' => 'active',
        ];
    }
}



