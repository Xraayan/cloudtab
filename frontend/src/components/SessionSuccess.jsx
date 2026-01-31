import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';
import { getSessionStatus } from '../services/api';

export function SessionSuccess({ sessionId, filesUploaded, files }) {
  const [sessionStatus, setSessionStatus] = useState('pending');
  const [expiresIn, setExpiresIn] = useState(30);

  // Poll for session status
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const data = await getSessionStatus(sessionId);
        setSessionStatus(data.session.status);
        
        // Calculate time remaining
        const expiresAt = new Date(data.session.expiresAt);
        const minutes = Math.floor((expiresAt - Date.now()) / 1000 / 60);
        setExpiresIn(minutes);
      } catch (error) {
        console.error('Failed to check status:', error);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [sessionId]);

  const getStatusIcon = () => {
    switch (sessionStatus) {
      case 'pending': return '⏳';
      case 'processing': return '🖨️';
      case 'completed': return '✅';
      default: return '❓';
    }
  };

  const getStatusText = () => {
    switch (sessionStatus) {
      case 'pending': return 'Waiting for shopkeeper';
      case 'processing': return 'Shopkeeper is printing your documents';
      case 'completed': return 'Job completed! You can collect your documents.';
      default: return 'Unknown status';
    }
  };

  return (
    <div className="success-container">
      <div className="success-card">
        <div className="success-icon">{getStatusIcon()}</div>
        <h1>{sessionStatus === 'completed' ? 'Job Complete!' : 'Upload Successful!'}</h1>
        <p className="subtitle">{getStatusText()}</p>

        <div className="session-details">
          <div className="detail-row">
            <span className="label">Session ID:</span>
            <span className="value highlight">{sessionId}</span>
          </div>
          <div className="detail-row">
            <span className="label">Files Uploaded:</span>
            <span className="value">{filesUploaded || files?.length || 0}</span>
          </div>
          <div className="detail-row">
            <span className="label">Status:</span>
            <span className={`value status-${sessionStatus}`}>{sessionStatus.toUpperCase()}</span>
          </div>
          <div className="detail-row">
            <span className="label">Expires In:</span>
            <span className="value timer">{expiresIn > 0 ? `${expiresIn} minutes` : 'Expired'}</span>
          </div>
        </div>

        {sessionStatus === 'pending' && (
          <div className="qr-section">
            <p>Show this QR code to the shopkeeper:</p>
            <div className="qr-container">
              <QRCode 
                value={sessionId}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
            <p className="session-id-display">Session ID: <strong>{sessionId}</strong></p>
          </div>
        )}

        {files && files.length > 0 && (
          <div className="files-list">
            <h3>Uploaded Files:</h3>
            {files.map((file, idx) => (
              <div key={idx} className="file-row">
                <span className="file-icon">📄</span>
                <span className="file-name">{file.name || file.originalName}</span>
                <span className="file-size">
                  {((file.size || file.fileSize) / 1024).toFixed(2)} KB
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="actions">
          <button className="btn btn-secondary" onClick={() => window.location.reload()}>
            ↻ Upload More Files
          </button>
        </div>

        {sessionStatus !== 'completed' && (
          <div className="warning">
            <strong>⚠️ Important:</strong> Session expires in {expiresIn} minutes. Files auto-delete after printing.
          </div>
        )}

        {sessionStatus === 'completed' && (
          <div className="success-message">
            <strong>✅ Success:</strong> Your documents are ready for collection at the counter!
          </div>
        )}
      </div>
    </div>
  );
}
