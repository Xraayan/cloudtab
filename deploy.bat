@echo off
echo 🚀 CloudTab Deployment Setup
echo ==============================

REM Backend deployment
echo 📦 Setting up backend for deployment...
cd backend

REM Generate encryption key if not exists
if not exist .env (
    echo 🔑 Generating encryption key...
    node generate-key.js > .env
    echo PORT=5000 >> .env
    echo NODE_ENV=production >> .env
    echo SESSION_TIMEOUT=7200000 >> .env
    echo MAX_FILE_SIZE=52428800 >> .env
)

cd ..

REM Frontend deployment
echo 🎨 Setting up frontend for deployment...
cd frontend

REM Build frontend
echo 🔨 Building frontend...
npm run build

cd ..

echo ✅ Deployment setup complete!
echo.
echo Next steps:
echo 1. Deploy backend to Railway/Render
echo 2. Update VITE_API_BASE_URL in frontend/.env.production
echo 3. Deploy frontend to Vercel

pause