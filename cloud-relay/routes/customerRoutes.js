const express = require('express');
const multer = require('multer');
const sessionManager = require('../services/sessionManager');
const wsHub = require('../services/wsHub');

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || 52428800) // 50MB default
  }
});

/**
 * POST /api/customer/sessions/create
 * Create a new session
 */
router.post('/sessions/create', async (req, res) => {
  try {
    const { customerName } = req.body;
    const sessionId = sessionManager.createSession(customerName);

    res.json({
      success: true,
      sessionId,
      message: 'Session created successfully'
    });
  } catch (error) {
    console.error('❌ Session creation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create session'
    });
  }
});

/**
 * GET /api/customer/shopkeeper/status
 * Check if shopkeeper is online
 */
router.get('/shopkeeper/status', (req, res) => {
  const isOnline = wsHub.getConnectedCount() > 0;
  res.json({
    online: isOnline,
    message: isOnline ? 'Shopkeeper is online' : 'Shopkeeper is currently offline'
  });
});

/**
 * POST /api/customer/sessions/:sessionId/upload
 * Upload files - REAL-TIME STREAMING ONLY (no storage)
 */
router.post('/sessions/:sessionId/upload', upload.array('files', 10), async (req, res) => {
  const { sessionId } = req.params;

  try {
    // Verify session exists
    const session = sessionManager.getSession(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check if shopkeeper is online - REJECT if offline
    if (wsHub.getConnectedCount() === 0) {
      return res.status(503).json({
        success: false,
        online: false,
        message: 'Shopkeeper is offline. Please try again later.'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files provided'
      });
    }

    // Stream files directly to shopkeeper via WebSocket (NO STORAGE)
    const filesList = req.files.map(file => ({
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      buffer: file.buffer.toString('base64') // Base64 for WebSocket
    }));

    // Send immediately to connected shopkeeper
    wsHub.sendFilesToShopkeeper({
      sessionId,
      customerName: session.customerName,
      files: filesList,
      fileCount: req.files.length
    });

    // Update session status
    sessionManager.updateStatus(sessionId, 'processing');

    res.json({
      success: true,
      sessionId,
      filesUploaded: req.files.length,
      files: req.files.map(f => ({
        originalName: f.originalname,
        size: f.size,
        type: f.mimetype
      })),
      message: 'Files sent to shopkeeper in real-time'
    });

  } catch (error) {
    console.error('❌ File upload failed:', error);
    res.status(500).json({
      success: false,
      message: 'File upload failed'
    });
  }
});

/**
 * GET /api/customer/sessions/:sessionId/status
 * Get session status (for customer to check if job is complete)
 */
router.get('/sessions/:sessionId/status', async (req, res) => {
  const { sessionId } = req.params;

  try {
    const session = sessionManager.getSession(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    const files = sessionManager.getSessionFiles(sessionId);

    res.json({
      success: true,
      session: {
        sessionId: session.sessionId,
        status: session.status,
        fileCount: session.fileCount,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
        completedAt: session.completedAt,
        files: files.map(f => ({
          name: f.originalName,
          type: f.fileType,
          size: f.fileSize
        }))
      }
    });

  } catch (error) {
    console.error('❌ Status check failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get session status'
    });
  }
});

module.exports = router;
