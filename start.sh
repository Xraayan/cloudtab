#!/bin/bash

# Quick Start Script for CloudTab
# Starts both backend and frontend servers

echo ""
echo "╔════════════════════════════════════════════╗"
echo "║         CloudTab Quick Start                ║"
echo "║   Secure File Handling for Internet Cafes  ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi

echo "🔄 Starting CloudTab services..."
echo ""

# Start backend
echo "[Backend] Starting on port 5000..."
cd backend
npm start &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend
echo "[Frontend] Starting on port 5173..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Services starting..."
echo ""
echo "🌐 Open in your browser:"
echo "   📤 Customer Portal: http://localhost:5173"
echo "   🏪 Shopkeeper Login: http://localhost:5000/shopkeeper-login"
echo "   📊 API Server: http://localhost:5000/api/health"
echo ""
echo "To stop, press Ctrl+C or run:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""

# Wait for user interrupt
wait
