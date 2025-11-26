<?php

namespace App\Domain\Shared\Exceptions;

class ResourceNotFoundException extends DomainException
{
    private string $resourceType;
    private mixed $identifier;

    public function __construct(string $resourceType, mixed $identifier)
    {
        $this->resourceType = $resourceType;
        $this->identifier = $identifier;

        parent::__construct(
            sprintf('%s with identifier "%s" not found', $resourceType, $identifier)
        );
    }

    public function getErrorCode(): string
    {
        return 'RESOURCE_NOT_FOUND';
    }

    public function getContext(): array
    {
        return [
            'resource_type' => $this->resourceType,
            'identifier' => $this->identifier,
        ];
    }
}
