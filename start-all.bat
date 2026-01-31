@echo off
echo 🚀 Starting CloudTab - All Services
echo ===================================

echo 📦 Starting Backend API...
start "Backend API" cmd /k "cd backend && npm start"

timeout /t 3 /nobreak > nul

echo 👥 Starting User Portal...
start "User Portal" cmd /k "cd frontend && npm run dev"

timeout /t 2 /nobreak > nul

echo 🏪 Starting Shopkeeper Portal...
start "Shopkeeper Portal" cmd /k "cd shopkeeper-frontend && npm run dev"

echo.
echo ✅ All services started!
echo.
echo 📱 User Portal: http://localhost:5173
echo 🏪 Shopkeeper Portal: http://localhost:5174
echo 🔧 Backend API: http://localhost:5000
echo.
echo Press any key to exit...
pause > nul