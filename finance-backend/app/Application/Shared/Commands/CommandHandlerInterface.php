<?php

namespace App\Application\Shared\Commands;

/**
 * Interface for command handlers
 */
interface CommandHandlerInterface
{
    /**
     * Handle the command and return the result
     */
    public function handle(CommandInterface $command): mixed;
}
