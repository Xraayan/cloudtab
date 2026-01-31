@echo off
title CloudTab - Executable Builder
color 0B

echo.
echo ========================================
echo   CloudTab Executable Builder
echo ========================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Node.js found
echo.

:: Install dependencies if needed
echo 📦 Installing dependencies...
echo.

cd backend
if not exist node_modules (
    echo Installing backend dependencies...
    call npm install
)
cd ..

cd frontend
if not exist node_modules (
    echo Installing frontend dependencies...
    call npm install
)
cd ..

echo.
echo ✅ Dependencies installed
echo.

:: Build executable
echo 🔨 Building executable...
echo.
node build-executable.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   ✅ BUILD SUCCESSFUL!
    echo ========================================
    echo.
    echo 📁 Output: %cd%\dist\
    echo.
    echo Files created:
    echo   - cloudtab-backend.exe
    echo   - start-cloudtab.bat
    echo   - frontend/dist/
    echo   - README.txt
    echo.
    echo 🚀 To distribute:
    echo   1. Copy entire 'dist' folder
    echo   2. Share with users
    echo   3. They run start-cloudtab.bat
    echo.
    
    :: Ask to create zip
    set /p create_zip="Create portable ZIP file? (Y/N): "
    if /i "%create_zip%"=="Y" (
        echo.
        echo 📦 Creating portable ZIP...
        powershell Compress-Archive -Path dist\* -DestinationPath cloudtab-portable.zip -Force
        echo ✅ Created: cloudtab-portable.zip
        echo.
    )
) else (
    echo.
    echo ❌ Build failed! Check errors above.
    echo.
)

echo.
echo Press any key to exit...
pause >nul
