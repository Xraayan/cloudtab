@echo off
title CloudTab

echo Starting CloudTab...
start /MIN "" "C:\Users\adith\Desktop\cloudtab\cloudtab-backend.exe"
timeout /t 3 /nobreak >nul
start http://localhost:5173

echo CloudTab is running!
echo Frontend: http://localhost:5173
echo Backend: http://localhost:5000
echo.
echo Press any key to stop CloudTab...
pause >nul
taskkill /F /IM cloudtab-backend.exe >nul 2>&1
