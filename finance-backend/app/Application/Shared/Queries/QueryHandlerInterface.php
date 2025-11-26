<?php

namespace App\Application\Shared\Queries;

/**
 * Interface for query handlers
 */
interface QueryHandlerInterface
{
    /**
     * Handle the query and return the result
     */
    public function handle(QueryInterface $query): mixed;
}
