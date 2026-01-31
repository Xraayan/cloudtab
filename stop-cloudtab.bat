@echo off
REM CloudTab - Stop All Services

title CloudTab - Stopping Services
color 0C

echo.
echo ========================================
echo   Stopping CloudTab Services
echo ========================================
echo.

echo Stopping backend...
taskkill /FI "WINDOWTITLE eq CloudTab Backend*" /F >nul 2>&1

echo Stopping frontend...
taskkill /FI "WINDOWTITLE eq CloudTab Frontend*" /F >nul 2>&1

echo Stopping any node processes on our ports...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173" ^| find "LISTENING"') do taskkill /F /PID %%a >nul 2>&1

echo.
echo ✅ All CloudTab services stopped!
echo.
timeout /t 2 /nobreak >nul
