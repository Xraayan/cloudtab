@echo off
REM Quick build script for testing

title CloudTab - Quick Build
color 0E

echo.
echo ========================================
echo   CloudTab - Quick Build (Test)
echo ========================================
echo.

echo 📦 Building backend executable...
echo.

cd backend
call pkg src/server.js --targets node18-win-x64 --output ../dist/cloudtab-backend.exe

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Build failed!
    cd ..
    pause
    exit /b 1
)

cd ..

echo.
echo ✅ Backend executable created!
echo.

echo 📁 Creating dist structure...
if not exist dist mkdir dist
if not exist dist\frontend mkdir dist\frontend

echo.
echo 📝 Copying files...
copy stop-cloudtab.bat dist\ >nul
copy backend\.env dist\ >nul 2>nul
if not exist dist\.env (
    copy backend\.env.example dist\.env >nul
)

echo.
echo 🔨 Building frontend...
cd frontend
call npm run build
xcopy /E /I /Y dist ..\dist\frontend\dist >nul

cd ..

echo.
echo 📝 Creating launcher...
(
echo @echo off
echo title CloudTab
echo.
echo echo Starting CloudTab...
echo start /MIN "" "%~dp0cloudtab-backend.exe"
echo timeout /t 3 /nobreak ^>nul
echo start http://localhost:5173
echo.
echo echo CloudTab is running!
echo echo Frontend: http://localhost:5173
echo echo Backend: http://localhost:5000
echo echo.
echo echo Press any key to stop CloudTab...
echo pause ^>nul
echo taskkill /F /IM cloudtab-backend.exe ^>nul 2^>^&1
) > dist\start-cloudtab.bat

echo.
echo ========================================
echo   ✅ BUILD COMPLETE!
echo ========================================
echo.
echo 📁 Output: dist\
echo.
echo Files:
dir /B dist
echo.
echo 🚀 To test: cd dist ^&^& start-cloudtab.bat
echo.
pause
