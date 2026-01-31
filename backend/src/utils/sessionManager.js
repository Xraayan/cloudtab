import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SESSIONS_DIR = path.join(__dirname, '../../sessions');
const SESSION_TIMEOUT = 300000; // 5 minutes in milliseconds

// Ensure sessions directory exists
if (!fs.existsSync(SESSIONS_DIR)) {
  fs.mkdirSync(SESSIONS_DIR, { recursive: true });
}

// Generate a 6-character alphanumeric session ID
export function generateSessionId() {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Create a new session
export function createSession(files = []) {
  const sessionId = generateSessionId();
  const now = Date.now();
  const expiresAt = now + SESSION_TIMEOUT;

  const sessionData = {
    sessionId,
    files,
    createdAt: now,
    expiresAt,
    status: 'active',
    encryptionKey: null // Will be set when files are uploaded
  };

  const sessionPath = path.join(SESSIONS_DIR, `${sessionId}.json`);
  fs.writeFileSync(sessionPath, JSON.stringify(sessionData, null, 2));

  return sessionData;
}

// Get session data
export function getSession(sessionId) {
  try {
    const sessionPath = path.join(SESSIONS_DIR, `${sessionId}.json`);
    
    if (!fs.existsSync(sessionPath)) {
      return null;
    }

    const data = JSON.parse(fs.readFileSync(sessionPath, 'utf-8'));

    // Check if session has expired
    if (data.expiresAt < Date.now()) {
      deleteSession(sessionId);
      return null;
    }

    return data;
  } catch (error) {
    console.error(`Error reading session ${sessionId}:`, error);
    return null;
  }
}

// Update session
export function updateSession(sessionId, updates) {
  try {
    const session = getSession(sessionId);
    if (!session) return null;

    const updated = { ...session, ...updates };
    const sessionPath = path.join(SESSIONS_DIR, `${sessionId}.json`);
    fs.writeFileSync(sessionPath, JSON.stringify(updated, null, 2));

    return updated;
  } catch (error) {
    console.error(`Error updating session ${sessionId}:`, error);
    return null;
  }
}

// Delete a session
export function deleteSession(sessionId) {
  try {
    const sessionPath = path.join(SESSIONS_DIR, `${sessionId}.json`);
    if (fs.existsSync(sessionPath)) {
      fs.unlinkSync(sessionPath);
    }
    return true;
  } catch (error) {
    console.error(`Error deleting session ${sessionId}:`, error);
    return false;
  }
}

// Clean up expired sessions (run periodically)
export function cleanupExpiredSessions() {
  try {
    const files = fs.readdirSync(SESSIONS_DIR);
    let cleaned = 0;

    files.forEach(file => {
      const sessionId = file.replace('.json', '');
      const session = getSession(sessionId);
      
      if (!session) {
        cleaned++;
      }
    });

    console.log(`Cleaned up ${cleaned} expired sessions`);
    return cleaned;
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error);
    return 0;
  }
}
