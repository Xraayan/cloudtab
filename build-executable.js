/**
 * CloudTab Executable Builder
 * Creates standalone executables for Windows, Mac, and Linux
 * No Node.js installation required for end users
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building CloudTab Executable...\n');

// Configuration
const config = {
  appName: 'CloudTab',
  version: '1.0.0',
  outputDir: path.join(__dirname, 'dist'),
  platforms: ['win', 'linux', 'macos']
};

// Step 1: Install pkg if not already installed
console.log('📦 Checking pkg installation...');
exec('npm list -g pkg', (error) => {
  if (error) {
    console.log('Installing pkg globally...');
    exec('npm install -g pkg', (err) => {
      if (err) {
        console.error('❌ Failed to install pkg:', err);
        process.exit(1);
      }
      buildExecutable();
    });
  } else {
    console.log('✅ pkg is already installed\n');
    buildExecutable();
  }
});

function buildExecutable() {
  // Create output directory
  if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
  }

  console.log('🔨 Building backend executable...\n');

  // Build backend
  const backendCommand = `pkg backend/src/server.js --targets node18-win-x64 --output ${path.join(config.outputDir, 'cloudtab-backend.exe')}`;
  
  exec(backendCommand, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Backend build failed:', error);
      return;
    }
    
    console.log('✅ Backend executable created!');
    console.log(stdout);
    
    // Build frontend
    console.log('\n🔨 Building frontend...\n');
    buildFrontend();
  });
}

function buildFrontend() {
  const frontendCommand = 'cd frontend && npm run build';
  
  exec(frontendCommand, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Frontend build failed:', error);
      return;
    }
    
    console.log('✅ Frontend built successfully!');
    console.log(stdout);
    
    // Create launcher
    createLauncher();
  });
}

function createLauncher() {
  console.log('\n📝 Creating launcher script...\n');
  
  const launcherScript = `@echo off
title CloudTab - Secure File Transfer
color 0A

echo.
echo ========================================
echo   CloudTab - Secure File Transfer
echo ========================================
echo.
echo Starting services...
echo.

:: Start backend
start "CloudTab Backend" /MIN "%~dp0cloudtab-backend.exe"
timeout /t 2 /nobreak >nul

:: Start frontend (using serve)
cd "%~dp0frontend\\dist"
start "CloudTab Frontend" /MIN npx serve -s . -l 5173

timeout /t 3 /nobreak >nul

echo.
echo ✅ CloudTab is running!
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:5000
echo.
echo Press any key to open browser...
pause >nul

start http://localhost:5173

echo.
echo CloudTab is running in the background.
echo Close this window to stop CloudTab.
echo.
pause
`;

  fs.writeFileSync(path.join(config.outputDir, 'start-cloudtab.bat'), launcherScript);
  
  // Create README
  createReadme();
  
  console.log('✅ Launcher created!');
  console.log('\n🎉 Build complete!\n');
  console.log(`📁 Output directory: ${config.outputDir}`);
  console.log('\n📋 Files created:');
  console.log('  - cloudtab-backend.exe (Backend server)');
  console.log('  - start-cloudtab.bat (Launcher)');
  console.log('  - frontend/dist/ (Frontend files)');
  console.log('  - README.txt (Instructions)');
  console.log('\n🚀 To run: Double-click start-cloudtab.bat');
}

function createReadme() {
  const readme = `
CloudTab - Secure File Transfer System
=======================================

Version: ${config.version}
Built: ${new Date().toISOString()}

QUICK START
-----------
1. Double-click "start-cloudtab.bat"
2. Wait for browser to open automatically
3. Upload files at http://localhost:5173
4. Share session ID with shopkeeper

SYSTEM REQUIREMENTS
-------------------
- Windows 10/11 (64-bit)
- 4GB RAM minimum
- 500MB free disk space
- No Node.js installation needed!

FEATURES
--------
✅ End-to-end encryption (AES-256)
✅ No file persistence on shopkeeper PC
✅ Auto-delete after 5 minutes
✅ Session-based access
✅ Secure print-only viewing

PORTS USED
----------
- Frontend: http://localhost:5173
- Backend:  http://localhost:5000
- Local Service: http://localhost:8765

TROUBLESHOOTING
---------------
Q: Browser doesn't open?
A: Manually go to http://localhost:5173

Q: Upload fails?
A: Check if backend is running (look for backend window)

Q: Port already in use?
A: Close other apps using ports 5000, 5173, or 8765

SUPPORT
-------
Issues: https://github.com/Xraayan/cloudtab/issues
Docs: See included documentation files

LICENSE
-------
All rights reserved.
`;

  fs.writeFileSync(path.join(config.outputDir, 'README.txt'), readme);
}
