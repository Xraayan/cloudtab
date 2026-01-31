@echo off
REM CloudTab Setup Script - Windows
REM This script sets up both backend and frontend

color 0A
echo.
echo ╔════════════════════════════════════════════╗
echo ║   CloudTab Setup Script - Windows          ║
echo ║   Secure File Handling for Internet Cafes  ║
echo ╚════════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 16+ from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js detected: 
node --version

echo.
echo 📦 Setting up Backend...
cd backend
if exist node_modules (
    echo ⏭️  Dependencies already installed
) else (
    echo ⏳ Installing backend dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Backend installation failed
        pause
        exit /b 1
    )
)

echo ✅ Backend dependencies installed
echo.
echo 🔑 Generating encryption key...
call npm run generate-key

echo ✅ Backend setup complete
echo.

echo 📦 Setting up Frontend...
cd ..\frontend
if exist node_modules (
    echo ⏭️  Dependencies already installed
) else (
    echo ⏳ Installing frontend dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Frontend installation failed
        pause
        exit /b 1
    )
)

echo ✅ Frontend setup complete
echo.

cd ..
echo ╔════════════════════════════════════════════╗
echo ║        Setup Complete!                     ║
echo ╚════════════════════════════════════════════╝
echo.
echo 🚀 To start the application:
echo.
echo    Terminal 1 (Backend):
echo    $ cd backend
echo    $ npm start
echo.
echo    Terminal 2 (Frontend):
echo    $ cd frontend
echo    $ npm run dev
echo.
echo 🌐 Then open:
echo    - Frontend: http://localhost:5173
echo    - Backend:  http://localhost:5000
echo    - API Docs: http://localhost:5000/api/health
echo.
pause
