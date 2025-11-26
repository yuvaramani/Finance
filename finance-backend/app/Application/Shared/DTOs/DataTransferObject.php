<?php

namespace App\Application\Shared\DTOs;

use JsonSerializable;

/**
 * Base class for Data Transfer Objects
 * DTOs are used to transfer data between layers
 */
abstract class DataTransferObject implements JsonSerializable
{
    /**
     * Create DTO from array
     */
    public static function fromArray(array $data): static
    {
        return new static(...$data);
    }

    /**
     * Convert DTO to array
     */
    public function toArray(): array
    {
        $result = [];

        foreach ((new \ReflectionClass($this))->getProperties(\ReflectionProperty::IS_PUBLIC) as $property) {
            $result[$property->getName()] = $property->getValue($this);
        }

        return $result;
    }

    /**
     * JSON serialization
     */
    public function jsonSerialize(): mixed
    {
        return $this->toArray();
    }
}
