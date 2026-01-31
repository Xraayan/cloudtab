import { useState, useEffect } from 'react'
import { getSession, completeSession, getFileUrl } from '../services/api'

function SessionView({ sessionId, onLogout }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadSession()
  }, [sessionId])

  const loadSession = async () => {
    try {
      const sessionData = await getSession(sessionId)
      setSession(sessionData)
    } catch (err) {
      setError('Failed to load session')
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteJob = async () => {
    if (!confirm('Complete this job? All files will be permanently deleted.')) return

    try {
      await completeSession(sessionId)
      alert('Job completed successfully!')
      onLogout()
    } catch (err) {
      alert('Failed to complete job')
    }
  }

  const handleViewFile = (fileId) => {
    const url = getFileUrl(sessionId, fileId)
    window.open(url, '_blank')
  }

  const handlePrintFile = (fileId) => {
    const url = getFileUrl(sessionId, fileId)
    const printWindow = window.open(url, '_blank')
    printWindow.onload = () => printWindow.print()
  }

  const getFileIcon = (category) => {
    const icons = {
      pdf: '📄',
      image: '🖼️',
      document: '📋',
      spreadsheet: '📊',
      text: '📝'
    }
    return icons[category] || '📄'
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) return <div className="container"><div className="loading">Loading session...</div></div>
  if (error) return <div className="container"><div className="error">{error}</div></div>

  return (
    <div className="container">
      <div className="header">
        <h1>📁 Session: {sessionId}</h1>
        <p>{session.files.length} files uploaded</p>
      </div>

      <div className="session-info">
        <strong>Session Details:</strong><br />
        Created: {new Date(session.createdAt).toLocaleString()}<br />
        Expires: {new Date(session.expiresAt).toLocaleString()}<br />
        Status: {session.status}
      </div>

      <div className="files-grid">
        {session.files.map((file) => (
          <div key={file.id} className="file-card">
            <div className="file-icon">{getFileIcon(file.category)}</div>
            <div className="file-name">{file.name}</div>
            <div className="file-size">{formatFileSize(file.size)}</div>
            <div className="file-actions">
              <button 
                className="btn btn-secondary" 
                onClick={() => handleViewFile(file.id)}
              >
                View
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => handlePrintFile(file.id)}
              >
                Print
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="session-actions">
        <button className="btn btn-secondary" onClick={onLogout}>
          ← Back to Login
        </button>
        <button className="btn btn-danger" onClick={handleCompleteJob}>
          Complete Job & Delete Files
        </button>
      </div>
    </div>
  )
}

export default SessionView