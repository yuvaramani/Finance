@echo off
echo ========================================
echo   Finance App - Stopping Servers
echo ========================================
echo.

echo Stopping servers on ports 8000 and 3002...

REM Kill processes on port 8000 (Backend)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000" ^| findstr "LISTENING"') do (
    echo Stopping process %%a on port 8000...
    taskkill /F /PID %%a >nul 2>&1
)

REM Kill processes on port 3002 (Frontend)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3002" ^| findstr "LISTENING"') do (
    echo Stopping process %%a on port 3002...
    taskkill /F /PID %%a >nul 2>&1
)

REM Also kill any node processes (Vite)
echo Stopping Node.js processes...
taskkill /F /IM node.exe >nul 2>&1

REM Kill any PHP processes (Laravel)
echo Stopping PHP processes...
taskkill /F /IM php.exe >nul 2>&1

timeout /t 2 /nobreak >nul

echo.
echo All servers stopped successfully!
echo.
pause

