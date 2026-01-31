const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  // API methods
  fetchSession: (sessionId) => ipcRenderer.invoke('fetch-session', sessionId),
  fetchFile: (sessionId, fileId) => ipcRenderer.invoke('fetch-file', sessionId, fileId),
  completeSession: (sessionId) => ipcRenderer.invoke('complete-session', sessionId),
  printFile: (fileData) => ipcRenderer.invoke('print-file', fileData),
  
  // Update handlers
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', callback),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', callback),
  installUpdate: () => ipcRenderer.send('install-update')
});
