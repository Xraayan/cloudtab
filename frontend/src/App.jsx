import React, { useState, useEffect } from 'react';
import { uploadFiles, checkShopkeeperStatus } from './services/api.js';
import { FileUpload } from './components/FileUpload.jsx';
import { SessionSuccess } from './components/SessionSuccess.jsx';
import './App.css';

function App() {
  const [sessionData, setSessionData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [shopkeeperOnline, setShopkeeperOnline] = useState(null);

  // Check shopkeeper status on mount and periodically
  useEffect(() => {
    const checkStatus = async () => {
      const status = await checkShopkeeperStatus();
      setShopkeeperOnline(status.online);
    };

    checkStatus();
    const interval = setInterval(checkStatus, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const handleFileUpload = async (files) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await uploadFiles(files);
      setSessionData({
        sessionId: data.sessionId,
        filesUploaded: data.filesUploaded,
        files: data.files
      });
    } catch (err) {
      if (err.message === 'SHOPKEEPER_OFFLINE') {
        setError('Shopkeeper is currently offline. Please try again later.');
      } else {
        setError(err.message);
      }
      console.error('Upload error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      {sessionData ? (
        <SessionSuccess
          sessionId={sessionData.sessionId}
          filesUploaded={sessionData.filesUploaded}
          files={sessionData.files}
        />
      ) : (
        <>
          {shopkeeperOnline !== null && (
            <div className={`status-indicator ${shopkeeperOnline ? 'status-online' : 'status-offline'}`}>
              {shopkeeperOnline ? '🟢 Shopkeeper is ONLINE' : '🔴 Shopkeeper is OFFLINE'}
            </div>
          )}
          <FileUpload 
            onUpload={handleFileUpload} 
            isLoading={isLoading}
            disabled={shopkeeperOnline === false}
          />
          {error && (
            <div className="error-banner">
              ❌ {error}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
