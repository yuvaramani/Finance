<?php

namespace App\Domain\Shared\Exceptions;

class ValidationException extends DomainException
{
    private array $errors;

    public function __construct(string $message, array $errors = [])
    {
        parent::__construct($message);
        $this->errors = $errors;
    }

    public function getErrorCode(): string
    {
        return 'VALIDATION_ERROR';
    }

    public function getErrors(): array
    {
        return $this->errors;
    }

    public function getContext(): array
    {
        return [
            'errors' => $this->errors,
        ];
    }
}
