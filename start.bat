@echo off
REM Quick Start Script for CloudTab
REM Starts both backend and frontend servers

color 0B
title CloudTab - Startup

echo.
echo ╔════════════════════════════════════════════╗
echo ║         CloudTab Quick Start                ║
echo ║   Secure File Handling for Internet Cafes  ║
echo ╚════════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed
    pause
    exit /b 1
)

echo 🔄 Starting CloudTab services...
echo.

REM Start backend
echo [Backend] Starting on port 5000...
start "CloudTab Backend" cmd /k "cd backend && npm start"

REM Wait a moment for backend to start
timeout /t 3 /nobreak

REM Start frontend  
echo [Frontend] Starting on port 5173...
start "CloudTab Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ Services starting...
echo.
echo 🌐 Open in your browser:
echo    📤 Customer Portal: http://localhost:5173
echo    🏪 Shopkeeper Login: http://localhost:5000/shopkeeper-login
echo    📊 API Server: http://localhost:5000/api/health
echo.
echo ✋ Press Ctrl+C in each window to stop
echo.
pause
