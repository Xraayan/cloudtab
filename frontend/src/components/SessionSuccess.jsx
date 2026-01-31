import React from 'react';
import QRCode from 'qrcode.react';

export function SessionSuccess({ sessionId, expiresAt, files }) {
  const expiresDate = new Date(expiresAt);
  const expiresIn = Math.floor((expiresAt - Date.now()) / 1000 / 60);

  return (
    <div className="success-container">
      <div className="success-card">
        <div className="success-icon">✅</div>
        <h1>Upload Successful!</h1>
        <p className="subtitle">Your files have been securely uploaded and encrypted.</p>

        <div className="session-details">
          <div className="detail-row">
            <span className="label">Session ID:</span>
            <span className="value highlight">{sessionId}</span>
          </div>
          <div className="detail-row">
            <span className="label">Files Uploaded:</span>
            <span className="value">{files.length}</span>
          </div>
          <div className="detail-row">
            <span className="label">Expires In:</span>
            <span className="value timer">{expiresIn} minutes</span>
          </div>
        </div>

        <div className="qr-section">
          <p>Share this QR code with the shopkeeper:</p>
          <div className="qr-container">
            <QRCode 
              value={`${window.location.origin}/shopkeeper-login?id=${sessionId}`}
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>
        </div>

        <div className="files-list">
          <h3>Uploaded Files:</h3>
          {files.map((file, idx) => (
            <div key={idx} className="file-row">
              <span className="file-icon">📄</span>
              <span className="file-name">{file.name}</span>
              <span className="file-size">{(file.size / 1024).toFixed(2)} KB</span>
            </div>
          ))}
        </div>

        <div className="actions">
          <button className="btn btn-secondary" onClick={() => window.location.href = '/upload'}>
            ↻ Upload More Files
          </button>
        </div>

        <div className="warning">
          <strong>⚠️ Important:</strong> Session will expire in {expiresIn} minutes. All files will be automatically deleted.
        </div>
      </div>
    </div>
  );
}
