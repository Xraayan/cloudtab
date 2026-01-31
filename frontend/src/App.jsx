import React, { useState } from 'react';
import { uploadFiles } from './services/api.js';
import { FileUpload } from './components/FileUpload.jsx';
import { SessionSuccess } from './components/SessionSuccess.jsx';
import './App.css';

function App() {
  const [sessionData, setSessionData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = async (files) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await uploadFiles(files);
      setSessionData(data);
    } catch (err) {
      setError(err.message);
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
          expiresAt={sessionData.expiresAt}
          files={sessionData.files}
        />
      ) : (
        <>
          <FileUpload onUpload={handleFileUpload} isLoading={isLoading} />
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
