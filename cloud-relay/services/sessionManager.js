// In-memory session storage (no database needed!)
class SessionManager {
  constructor() {
    this.sessions = new Map(); // sessionId -> session data
    this.shopkeepers = new Map(); // apiKey -> shopkeeper info
    
    // Add default shopkeeper
    this.shopkeepers.set('SHOP_DEFAULT_KEY_12345', {
      id: 'SHOP_001',
      name: 'Default Shopkeeper',
      status: 'offline'
    });
    
    console.log('✅ Session manager initialized (in-memory)');
  }

  /**
   * Generate a unique 6-character session ID
   */
  generateSessionId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let sessionId = '';
    for (let i = 0; i < 6; i++) {
      sessionId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return sessionId;
  }

  /**
   * Create a new session
   * @param {string} customerName - Optional customer name
   * @returns {string} Session ID
   */
  createSession(customerName = null) {
    let sessionId = this.generateSessionId();
    
    // Ensure unique session ID
    while (this.sessions.has(sessionId)) {
      sessionId = this.generateSessionId();
    }
    
    const expiresAt = new Date(Date.now() + parseInt(process.env.SESSION_TIMEOUT || 1800000));

    this.sessions.set(sessionId, {
      sessionId,
      customerName,
      status: 'pending',
      createdAt: new Date(),
      expiresAt,
      completedAt: null,
      shopkeeperId: null
    });
    
    console.log(`✅ Session created: ${sessionId} (expires: ${expiresAt.toLocaleTimeString()})`);
    return sessionId;
  }

  /**
   * Get session details
   * @param {string} sessionId - Session ID
   * @returns {Object} Session object
   */
  getSession(sessionId) {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Get all pending sessions (status = 'pending')
   * @returns {Array} Array of pending sessions
   */
  getPendingSessions() {
    const now = new Date();
    const pending = [];
    
    for (const session of this.sessions.values()) {
      if (session.status === 'pending' && session.expiresAt > now) {
        pending.push(session);
      }
    }
    
    return pending.sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Update session status
   * @param {string} sessionId - Session ID
   * @param {string} status - New status (pending, processing, completed, expired)
   */
  updateStatus(sessionId, status) {
    const session = this.sessions.get(sessionId);
    
    if (session) {
      session.status = status;
      if (status === 'completed') {
        session.completedAt = new Date();
      }
      console.log(`✅ Session ${sessionId} status updated to: ${status}`);
    }
  }

  /**
   * Mark session as being processed by a shopkeeper
   * @param {string} sessionId - Session ID
   * @param {string} shopkeeperId - Shopkeeper ID
   */
  assignToShopkeeper(sessionId, shopkeeperId) {
    const session = this.sessions.get(sessionId);
    
    if (session) {
      session.status = 'processing';
      session.shopkeeperId = shopkeeperId;
      console.log(`✅ Session ${sessionId} assigned to shopkeeper ${shopkeeperId}`);
    }
  }

  /**
   * Delete expired sessions and their files
   */
  cleanupExpiredSessions() {
    const now = new Date();
    const expired = [];
    
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.expiresAt < now && session.status !== 'completed') {
        expired.push(sessionId);
        this.sessions.delete(sessionId);
      }
    }
    
    if (expired.length > 0) {
      console.log(`🗑️  Cleaned up ${expired.length} expired sessions`);
    }
    
    return expired;
  }

  /**
   * Verify shopkeeper API key
   * @param {string} apiKey - API key
   * @returns {Object} Shopkeeper object or null
   */
  verifyShopkeeper(apiKey) {
    return this.shopkeepers.get(apiKey) || null;
  }

  /**
   * Update shopkeeper status
   * @param {string} shopkeeperId - Shopkeeper ID
   * @param {string} status - Status (online, offline)
   */
  updateShopkeeperStatus(shopkeeperId, status) {
    for (const shopkeeper of this.shopkeepers.values()) {
      if (shopkeeper.id === shopkeeperId) {
        shopkeeper.status = status;
        shopkeeper.lastConnected = new Date();
        console.log(`✅ Shopkeeper ${shopkeeperId} status: ${status}`);
        break;
      }
    }
  }
}

module.exports = new SessionManager();
