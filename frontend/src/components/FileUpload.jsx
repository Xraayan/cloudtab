import React, { useState } from 'react';

export function FileUpload({ onUpload, isLoading, disabled }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [progress, setProgress] = useState(0);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && !disabled) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files) => {
    const newFiles = Array.from(files);
    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (disabled) {
      alert('Shopkeeper is offline. Please wait until they are online.');
      return;
    }
    if (selectedFiles.length === 0) {
      alert('Please select at least one file');
      return;
    }
    await onUpload(selectedFiles);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="upload-container">
      <div className="upload-card">
        <h1>📤 Upload Files</h1>
        <p className="subtitle">Securely upload files for printing at internet cafes</p>

        <form onSubmit={handleSubmit}>
          <div
            className={`drop-zone ${dragActive ? 'active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="drop-content">
              <div className="drop-icon">☁️</div>
              <h2>Drag & Drop Files Here</h2>
              <p>or click to browse</p>
              <input
                type="file"
                id="file-input"
                multiple
                onChange={handleChange}
                disabled={isLoading}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* Browse button overlay */}
          <label htmlFor="file-input" className="browse-label">
            <span>Browse Files</span>
          </label>

          {/* Selected files list */}
          {selectedFiles.length > 0 && (
            <div className="files-section">
              <h3>Selected Files ({selectedFiles.length})</h3>
              <div className="files-list">
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="file-item">
                    <div className="file-info">
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">{formatFileSize(file.size)}</span>
                    </div>
                    {!isLoading && (
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => removeFile(idx)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress bar */}
          {isLoading && progress > 0 && (
            <div className="progress-section">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }}>
                  {progress}%
                </div>
              </div>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading || selectedFiles.length === 0 || disabled}
          >
            {disabled ? '🔴 Shopkeeper Offline' : isLoading ? '⏳ Uploading...' : '🚀 Upload Files'}
          </button>
        </form>

        <div className="features">
          <div className="feature">
            <span className="icon">🔒</span>
            <div>
              <h4>End-to-End Encrypted</h4>
              <p>All files encrypted with AES-256</p>
            </div>
          </div>
          <div className="feature">
            <span className="icon">⏰</span>
            <div>
              <h4>Auto-Delete</h4>
              <p>Files deleted after 5 minutes</p>
            </div>
          </div>
          <div className="feature">
            <span className="icon">🛡️</span>
            <div>
              <h4>Secure Session</h4>
              <p>Unique 6-digit session ID</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
