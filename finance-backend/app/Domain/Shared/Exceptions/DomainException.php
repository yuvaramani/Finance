<?php

namespace App\Domain\Shared\Exceptions;

use Exception;

/**
 * Base exception for all domain-related errors
 */
abstract class DomainException extends Exception
{
    /**
     * Get the error code for API responses
     */
    public function getErrorCode(): string
    {
        return 'DOMAIN_ERROR';
    }

    /**
     * Get additional context data
     */
    public function getContext(): array
    {
        return [];
    }

    /**
     * Convert exception to array for API response
     */
    public function toArray(): array
    {
        return [
            'error' => $this->getErrorCode(),
            'message' => $this->getMessage(),
            'context' => $this->getContext(),
        ];
    }
}
