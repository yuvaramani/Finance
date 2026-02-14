<?php

namespace Database\Factories;

use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Project>
 */
class ProjectFactory extends Factory
{
    protected $model = Project::class;

    public function definition(): array
    {
        $start = $this->faker->dateTimeBetween('-6 months', 'now');
        $end = $this->faker->boolean(50) ? $this->faker->dateTimeBetween($start, '+6 months') : null;

        return [
            'name' => $this->faker->unique()->company(),
            'description' => $this->faker->optional()->sentence(12),
            'status' => $this->faker->randomElement(['active', 'completed', 'on_hold']),
            'start_date' => $start,
            'end_date' => $end,
        ];
    }
}










