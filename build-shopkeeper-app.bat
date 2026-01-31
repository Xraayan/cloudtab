@echo off
REM Build Shopkeeper Desktop App (.exe)

title CloudTab - Build Shopkeeper App
color 0B

echo.
echo ========================================
echo   Building Shopkeeper Desktop App
echo ========================================
echo.

REM Check if electron-builder is installed
where electron-builder >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Installing electron-builder...
    npm install -g electron-builder
)

echo 📦 Step 1: Install Electron dependencies...
if not exist shopkeeper-app\node_modules (
    cd shopkeeper-app
    call npm install
    cd ..
)

echo.
echo 🔨 Step 2: Build Shopkeeper UI...
cd shopkeeper-app
call npm run build:electron

echo.
echo 📦 Step 3: Package as Windows executable...
call npm run package:win

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   ✅ BUILD SUCCESSFUL!
    echo ========================================
    echo.
    echo 📁 Output: shopkeeper-app\dist\
    echo.
    echo Files created:
    dir /B shopkeeper-app\dist\*.exe 2>nul
    echo.
    echo 📦 Installer: cloudtab-shopkeeper-setup.exe
    echo 📦 Portable: cloudtab-shopkeeper-portable.exe
    echo.
    echo 🚀 Shopkeepers can now:
    echo   1. Download the .exe
    echo   2. Install on their PC
    echo   3. Enter session IDs to fetch files
    echo   4. Print securely
    echo.
) else (
    echo.
    echo ❌ Build failed!
    echo.
)

cd ..
pause
