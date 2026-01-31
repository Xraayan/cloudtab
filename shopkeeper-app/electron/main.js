const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

// Cloud API configuration
const CLOUD_API_URL = process.env.CLOUD_API_URL || 'https://api.cloudtab.com';

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, '../public/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    title: 'CloudTab Shopkeeper',
    autoHideMenuBar: true
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5174');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Check for updates
  autoUpdater.checkForUpdatesAndNotify();
}

// App lifecycle
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers for API communication
ipcMain.handle('fetch-session', async (event, sessionId) => {
  try {
    const response = await fetch(`${CLOUD_API_URL}/api/sessions/${sessionId}`);
    if (!response.ok) {
      throw new Error('Session not found');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching session:', error);
    throw error;
  }
});

ipcMain.handle('fetch-file', async (event, sessionId, fileId) => {
  try {
    const response = await fetch(
      `${CLOUD_API_URL}/api/sessions/${sessionId}/files/${fileId}`
    );
    if (!response.ok) {
      throw new Error('File not found');
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('Error fetching file:', error);
    throw error;
  }
});

ipcMain.handle('complete-session', async (event, sessionId) => {
  try {
    const response = await fetch(
      `${CLOUD_API_URL}/api/sessions/${sessionId}/complete`,
      { method: 'POST' }
    );
    if (!response.ok) {
      throw new Error('Failed to complete session');
    }
    return await response.json();
  } catch (error) {
    console.error('Error completing session:', error);
    throw error;
  }
});

ipcMain.handle('print-file', async (event, fileData) => {
  try {
    // Create a temporary window for printing
    const printWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: false
      }
    });

    // Load file for printing
    await printWindow.loadURL(`data:application/pdf;base64,${fileData.toString('base64')}`);
    
    // Print silently
    await printWindow.webContents.print({
      silent: false,
      printBackground: true
    });

    printWindow.close();
    return { success: true };
  } catch (error) {
    console.error('Error printing:', error);
    throw error;
  }
});

// Auto-updater events
autoUpdater.on('update-available', () => {
  mainWindow.webContents.send('update-available');
});

autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('update-downloaded');
});

ipcMain.on('install-update', () => {
  autoUpdater.quitAndInstall();
});
