import { useState } from 'react'
import { validateSession } from '../services/api'

function SessionLogin({ onLogin }) {
  const [sessionId, setSessionId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!/^[A-Z0-9]{6}$/.test(sessionId)) {
      setError('Invalid session ID. Must be 6 characters.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const session = await validateSession(sessionId)
      onLogin(sessionId)
    } catch (err) {
      setError(err.response?.data?.error || 'Session not found or expired')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="header">
        <h1>🏪 Shopkeeper Portal</h1>
        <p>Enter the 6-digit session ID to access customer files</p>
      </div>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="sessionId">Session ID</label>
          <input
            type="text"
            id="sessionId"
            className="session-input"
            placeholder="ABC123"
            maxLength="6"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value.toUpperCase())}
            required
          />
        </div>
        
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Validating...' : 'Access Session'}
        </button>
      </form>
    </div>
  )
}

export default SessionLogin