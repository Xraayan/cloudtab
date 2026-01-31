@echo off
echo ========================================
echo   CloudTab Relay Server - Quick Start
echo ========================================
echo.

REM Check if .env exists
if not exist ".env" (
    echo [!] No .env file found
    echo [!] Copying .env.example to .env
    copy .env.example .env
    echo.
    echo [!] IMPORTANT: Edit .env with your credentials before running!
    echo [!] You need:
    echo     - PostgreSQL DATABASE_URL
    echo     - AWS S3 credentials
    echo.
    pause
    exit /b 1
)

echo [1/3] Checking dependencies...
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

echo.
echo [2/3] Starting relay server...
echo.
echo ^> Server will start on port 5000
echo ^> WebSocket endpoint: ws://localhost:5000/ws
echo ^> Press Ctrl+C to stop
echo.

call npm start
