const WebSocket = require('ws');
const sessionManager = require('./sessionManager');

class WebSocketHub {
  constructor() {
    this.wss = null;
    this.shopkeeperConnections = new Map(); // shopkeeperId -> WebSocket
    this.heartbeatInterval = null;
  }

  /**
   * Initialize WebSocket server
   * @param {Object} server - HTTP server instance
   */
  initialize(server) {
    this.wss = new WebSocket.Server({ server, path: '/ws' });

    this.wss.on('connection', (ws, req) => {
      console.log('🔌 New WebSocket connection');

      ws.isAlive = true;
      ws.shopkeeperId = null;

      // Handle pong responses
      ws.on('pong', () => {
        ws.isAlive = true;
      });

      // Handle incoming messages
      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message);
          await this.handleMessage(ws, data);
        } catch (error) {
          console.error('❌ WebSocket message error:', error.message);
          ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
        }
      });

      // Handle disconnection
      ws.on('close', () => {
        if (ws.shopkeeperId) {
          this.shopkeeperConnections.delete(ws.shopkeeperId);
          sessionManager.updateShopkeeperStatus(ws.shopkeeperId, 'offline');
          console.log(`🔌 Shopkeeper ${ws.shopkeeperId} disconnected`);
        }
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error.message);
      });
    });

    // Start heartbeat to detect dead connections
    this.startHeartbeat();

    console.log('✅ WebSocket server initialized');
  }

  /**
   * Handle incoming WebSocket messages
   */
  async handleMessage(ws, data) {
    const { type, apiKey, sessionId } = data;

    switch (type) {
      case 'authenticate':
        await this.handleAuthentication(ws, apiKey);
        break;

      case 'get_pending':
        await this.handleGetPending(ws);
        break;

      case 'claim_session':
        await this.handleClaimSession(ws, sessionId);
        break;

      case 'complete_session':
        await this.handleCompleteSession(ws, sessionId);
        break;

      case 'ping':
        ws.send(JSON.stringify({ type: 'pong' }));
        break;

      default:
        ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
    }
  }

  /**
   * Authenticate shopkeeper
   */
  async handleAuthentication(ws, apiKey) {
    const shopkeeper = await sessionManager.verifyShopkeeper(apiKey);

    if (!shopkeeper) {
      ws.send(JSON.stringify({ type: 'auth_failed', message: 'Invalid API key' }));
      ws.close();
      return;
    }

    ws.shopkeeperId = shopkeeper.id;
    this.shopkeeperConnections.set(shopkeeper.id, ws);
    await sessionManager.updateShopkeeperStatus(shopkeeper.id, 'online');

    ws.send(JSON.stringify({
      type: 'authenticated',
      shopkeeper: {
        id: shopkeeper.id,
        name: shopkeeper.name
      }
    }));

    console.log(`✅ Shopkeeper authenticated: ${shopkeeper.id}`);

    // Send pending sessions immediately after authentication
    await this.handleGetPending(ws);
  }

  /**
   * Get pending sessions
   */
  async handleGetPending(ws) {
    if (!ws.shopkeeperId) {
      ws.send(JSON.stringify({ type: 'error', message: 'Not authenticated' }));
      return;
    }

    const pendingSessions = await sessionManager.getPendingSessions();

    ws.send(JSON.stringify({
      type: 'pending_sessions',
      sessions: pendingSessions
    }));
  }

  /**
   * Claim a session for processing
   */
  async handleClaimSession(ws, sessionId) {
    if (!ws.shopkeeperId) {
      ws.send(JSON.stringify({ type: 'error', message: 'Not authenticated' }));
      return;
    }

    try {
      await sessionManager.assignToShopkeeper(sessionId, ws.shopkeeperId);
      const session = await sessionManager.getSession(sessionId);
      const files = await sessionManager.getSessionFiles(sessionId);

      ws.send(JSON.stringify({
        type: 'session_claimed',
        session: {
          ...session,
          files
        }
      }));
    } catch (error) {
      ws.send(JSON.stringify({ type: 'error', message: 'Failed to claim session' }));
    }
  }

  /**
   * Complete a session
   */
  async handleCompleteSession(ws, sessionId) {
    if (!ws.shopkeeperId) {
      ws.send(JSON.stringify({ type: 'error', message: 'Not authenticated' }));
      return;
    }

    try {
      await sessionManager.updateStatus(sessionId, 'completed');

      ws.send(JSON.stringify({
        type: 'session_completed',
        sessionId
      }));
    } catch (error) {
      ws.send(JSON.stringify({ type: 'error', message: 'Failed to complete session' }));
    }
  }

  /**
   * Notify all connected shopkeepers about a new session
   */
  notifyNewSession(sessionId, fileCount) {
    const notification = JSON.stringify({
      type: 'new_session',
      sessionId,
      fileCount,
      timestamp: new Date().toISOString()
    });

    this.shopkeeperConnections.forEach((ws, shopkeeperId) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(notification);
        console.log(`📢 Notified shopkeeper ${shopkeeperId} of new session ${sessionId}`);
      }
    });
  }

  /**
   * Start heartbeat to detect dead connections
   */
  startHeartbeat() {
    const interval = parseInt(process.env.WS_HEARTBEAT_INTERVAL || 30000);

    this.heartbeatInterval = setInterval(() => {
      this.wss.clients.forEach((ws) => {
        if (!ws.isAlive) {
          console.log('💀 Terminating dead connection');
          return ws.terminate();
        }

        ws.isAlive = false;
        ws.ping();
      });
    }, interval);
  }

  /**
   * Get number of connected shopkeepers
   */
  getConnectedCount() {
    return this.shopkeeperConnections.size;
  }

  /**
   * Send files directly to shopkeeper (real-time streaming)
   */
  sendFilesToShopkeeper(data) {
    const message = JSON.stringify({
      type: 'files_upload',
      data: data
    });

    this.shopkeeperConnections.forEach((ws, shopkeeperId) => {
      if (ws.readyState === 1) { // WebSocket.OPEN
        ws.send(message);
        console.log(`📤 Streamed ${data.fileCount} file(s) to shopkeeper ${shopkeeperId} for session ${data.sessionId}`);
      }
    });
  }
}

module.exports = new WebSocketHub();
