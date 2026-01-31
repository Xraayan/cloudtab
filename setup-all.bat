@echo off
echo 🚀 CloudTab Setup - Installing Dependencies
echo ==========================================

echo 📦 Installing Backend dependencies...
cd backend
call npm install
cd ..

echo 👥 Installing User Portal dependencies...
cd frontend
call npm install
cd ..

echo 🏪 Installing Shopkeeper Portal dependencies...
cd shopkeeper-frontend
call npm install
cd ..

echo ✅ Setup complete!
echo.
echo Run 'start-all.bat' to start all services
pause