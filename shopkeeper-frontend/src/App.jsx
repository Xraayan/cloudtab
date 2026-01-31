import { useState } from 'react'
import SessionLogin from './components/SessionLogin'
import SessionView from './components/SessionView'
import './App.css'

function App() {
  const [sessionId, setSessionId] = useState(null)

  return (
    <div className="app">
      {!sessionId ? (
        <SessionLogin onLogin={setSessionId} />
      ) : (
        <SessionView sessionId={sessionId} onLogout={() => setSessionId(null)} />
      )}
    </div>
  )
}

export default App