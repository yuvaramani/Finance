<?php

namespace App\Domain\Shared\Contracts;

interface RepositoryInterface
{
    /**
     * Find a resource by its ID
     */
    public function find(int $id): ?object;

    /**
     * Find a resource by its ID or throw exception
     */
    public function findOrFail(int $id): object;

    /**
     * Get all resources with optional filters
     */
    public function all(array $filters = []): iterable;

    /**
     * Create a new resource
     */
    public function create(array $data): object;

    /**
     * Update an existing resource
     */
    public function update(int $id, array $data): object;

    /**
     * Delete a resource
     */
    public function delete(int $id): bool;

    /**
     * Check if resource exists
     */
    public function exists(int $id): bool;
}
