@echo off
echo ========================================
echo   Finance App - Starting Servers
echo ========================================
echo.

REM Get the script directory
set SCRIPT_DIR=%~dp0

REM Kill any existing servers on ports 8000 and 3002
echo [1/4] Stopping any existing servers...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3002" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 2 /nobreak >nul

REM Start Backend Server (Laravel)
echo [2/4] Starting Backend Server (Laravel) on port 8000...
start "Finance Backend Server" cmd /k "cd /d %SCRIPT_DIR%finance-backend && echo Starting Laravel Backend Server... && php artisan serve"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start Frontend Server (Vite)
echo [3/4] Starting Frontend Server (Vite) on port 3002...
start "Finance Frontend Server" cmd /k "cd /d %SCRIPT_DIR%finance-frontend && echo Starting Vite Frontend Server... && powershell -ExecutionPolicy Bypass -Command "npm run dev""

REM Wait for servers to start
echo [4/4] Waiting for servers to initialize...
timeout /t 8 /nobreak >nul

REM Open Chrome
echo Opening Chrome browser...
start chrome.exe http://localhost:3002

echo.
echo ========================================
echo   Servers Started Successfully!
echo ========================================
echo.
echo Backend API:  http://localhost:8000
echo Frontend App: http://localhost:3002
echo.
echo Press any key to close this window...
pause >nul

