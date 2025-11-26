<?php

namespace App\Domain\Shared\ValueObjects;

use JsonSerializable;

/**
 * Base class for all Value Objects in the domain
 * Value Objects are immutable and compared by value, not identity
 */
abstract class ValueObject implements JsonSerializable
{
    /**
     * Compare this value object with another
     */
    public function equals(?ValueObject $other): bool
    {
        if ($other === null || !($other instanceof static)) {
            return false;
        }

        return $this->toArray() === $other->toArray();
    }

    /**
     * Convert value object to array
     */
    abstract public function toArray(): array;

    /**
     * Convert value object to string representation
     */
    abstract public function toString(): string;

    /**
     * JSON serialization
     */
    public function jsonSerialize(): mixed
    {
        return $this->toArray();
    }

    /**
     * String representation
     */
    public function __toString(): string
    {
        return $this->toString();
    }
}
