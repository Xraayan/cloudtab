#!/bin/bash

# CloudTab Setup Script - Linux/macOS
# This script sets up both backend and frontend

echo "╔════════════════════════════════════════════╗"
echo "║   CloudTab Setup Script - Linux/macOS      ║"
echo "║   Secure File Handling for Internet Cafes  ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js detected:"
node --version

echo ""
echo "📦 Setting up Backend..."
cd backend

if [ -d "node_modules" ]; then
    echo "⏭️  Dependencies already installed"
else
    echo "⏳ Installing backend dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Backend installation failed"
        exit 1
    fi
fi

echo "✅ Backend setup complete"
echo ""

echo "📦 Setting up Frontend..."
cd ../frontend

if [ -d "node_modules" ]; then
    echo "⏭️  Dependencies already installed"
else
    echo "⏳ Installing frontend dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Frontend installation failed"
        exit 1
    fi
fi

echo "✅ Frontend setup complete"
echo ""

cd ..

echo "╔════════════════════════════════════════════╗"
echo "║        Setup Complete!                     ║"
echo "╚════════════════════════════════════════════╝"
echo ""
echo "🚀 To start the application:"
echo ""
echo "   Terminal 1 (Backend):"
echo "   \$ cd backend"
echo "   \$ npm start"
echo ""
echo "   Terminal 2 (Frontend):"
echo "   \$ cd frontend"
echo "   \$ npm run dev"
echo ""
echo "🌐 Then open:"
echo "   - Frontend: http://localhost:5173"
echo "   - Backend:  http://localhost:5000"
echo "   - API Docs: http://localhost:5000/api/health"
echo ""
