<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        apiPrefix: 'api/v1',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Enable API middleware with Sanctum
        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);

        // Configure trusted proxies for API behind load balancer/reverse proxy
        $middleware->trustProxies(at: '*');

        // Set up CORS for API access
        $middleware->validateCsrfTokens(except: [
            'api/*', // Disable CSRF for API routes (using token auth instead)
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
