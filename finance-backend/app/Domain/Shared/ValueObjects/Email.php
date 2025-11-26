<?php

namespace App\Domain\Shared\ValueObjects;

use App\Domain\Shared\Exceptions\ValidationException;

/**
 * Email Value Object
 */
final class Email extends ValueObject
{
    private string $value;

    public function __construct(string $email)
    {
        $this->validate($email);
        $this->value = strtolower(trim($email));
    }

    private function validate(string $email): void
    {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new ValidationException('Invalid email format', [
                'email' => ['The provided email address is not valid'],
            ]);
        }
    }

    public function getValue(): string
    {
        return $this->value;
    }

    public function toArray(): array
    {
        return ['email' => $this->value];
    }

    public function toString(): string
    {
        return $this->value;
    }

    public static function fromString(string $email): self
    {
        return new self($email);
    }
}
