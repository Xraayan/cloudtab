# CloudTab - Full System Test

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  CloudTab Full System Test" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Test 1: Check if relay server is running
Write-Host "[1/5] Checking Cloud Relay Server..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri http://localhost:5000/health
    Write-Host "  ✅ Relay server is healthy" -ForegroundColor Green
    Write-Host "     Uptime: $($health.uptime) seconds" -ForegroundColor Gray
    Write-Host "     Connected shopkeepers: $($health.connectedShopkeepers)" -ForegroundColor Gray
} catch {
    Write-Host "  ❌ Relay server not running!" -ForegroundColor Red
    Write-Host "     Start it with: cd cloud-relay; node server.js" -ForegroundColor Yellow
    exit 1
}

# Test 2: Check if frontend is running
Write-Host "`n[2/5] Checking Frontend Server..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri http://localhost:5173 -Method Head -TimeoutSec 2
    Write-Host "  ✅ Frontend is running" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Frontend not running!" -ForegroundColor Red
    Write-Host "     Start it with: cd frontend; npm run dev" -ForegroundColor Yellow
    exit 1
}

# Test 3: Create a test session
Write-Host "`n[3/5] Creating Test Session..." -ForegroundColor Yellow
try {
    $session = Invoke-RestMethod -Uri http://localhost:5000/api/customer/sessions/create `
        -Method POST `
        -ContentType "application/json" `
        -Body '{"customerName":"Test Customer"}'
    
    $sessionId = $session.sessionId
    Write-Host "  ✅ Session created: $sessionId" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Failed to create session" -ForegroundColor Red
    Write-Host "     Error: $_" -ForegroundColor Red
    exit 1
}

# Test 4: Check pending sessions (as shopkeeper)
Write-Host "`n[4/5] Checking Pending Sessions (Shopkeeper View)..." -ForegroundColor Yellow
try {
    $pending = Invoke-RestMethod -Uri http://localhost:5000/api/shopkeeper/sessions/pending `
        -Headers @{"X-API-Key"="SHOP_DEFAULT_KEY_12345"}
    
    Write-Host "  ✅ Found $($pending.count) pending session(s)" -ForegroundColor Green
    
    if ($pending.count -gt 0) {
        Write-Host "`n  Pending Sessions:" -ForegroundColor Cyan
        foreach ($s in $pending.sessions) {
            Write-Host "    - $($s.sessionId) | Files: $($s.fileCount) | Created: $($s.createdAt)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "  ❌ Failed to get pending sessions" -ForegroundColor Red
    exit 1
}

# Test 5: Check session status (customer view)
Write-Host "`n[5/5] Checking Session Status (Customer View)..." -ForegroundColor Yellow
try {
    $status = Invoke-RestMethod -Uri "http://localhost:5000/api/customer/sessions/$sessionId/status"
    
    Write-Host "  ✅ Session status retrieved" -ForegroundColor Green
    Write-Host "     Session ID: $($status.session.sessionId)" -ForegroundColor Gray
    Write-Host "     Status: $($status.session.status)" -ForegroundColor Gray
    Write-Host "     Files: $($status.session.fileCount)" -ForegroundColor Gray
    Write-Host "     Expires: $($status.session.expiresAt)" -ForegroundColor Gray
} catch {
    Write-Host "  ❌ Failed to get session status" -ForegroundColor Red
    exit 1
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  ✅ ALL TESTS PASSED!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "🎉 Your CloudTab system is working!" -ForegroundColor Green
Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "  1. Open http://localhost:5173 in your browser" -ForegroundColor White
Write-Host "  2. Upload a test file" -ForegroundColor White
Write-Host "  3. You'll get a session ID: $sessionId" -ForegroundColor White
Write-Host "  4. Build shopkeeper app to download and print" -ForegroundColor White
Write-Host "`nTest Session ID: $sessionId" -ForegroundColor Cyan
Write-Host "API Key (for shopkeeper): SHOP_DEFAULT_KEY_12345`n" -ForegroundColor Cyan
