const express = require('express');
const sessionManager = require('../services/sessionManager');
const s3Service = require('../services/s3Service');

const router = express.Router();

/**
 * Middleware to verify shopkeeper API key
 */
async function verifyApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: 'API key required'
    });
  }

  const shopkeeper = await sessionManager.verifyShopkeeper(apiKey);

  if (!shopkeeper) {
    return res.status(401).json({
      success: false,
      message: 'Invalid API key'
    });
  }

  req.shopkeeper = shopkeeper;
  next();
}

/**
 * GET /api/shopkeeper/sessions/pending
 * Get all pending sessions
 */
router.get('/sessions/pending', verifyApiKey, async (req, res) => {
  try {
    const sessions = sessionManager.getPendingSessions();

    res.json({
      success: true,
      count: sessions.length,
      sessions: sessions.map(s => ({
        sessionId: s.sessionId,
        fileCount: s.fileCount,
        totalSize: s.totalSize,
        createdAt: s.createdAt,
        expiresAt: s.expiresAt
      }))
    });
  } catch (error) {
    console.error('❌ Failed to get pending sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pending sessions'
    });
  }
});

/**
 * GET /api/shopkeeper/sessions/:sessionId
 * Get session details
 */
router.get('/sessions/:sessionId', verifyApiKey, async (req, res) => {
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
        fileCount: session.fileCount,
        totalSize: session.totalSize,
        status: session.status,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
        files: files.map(f => ({
          id: f.id,
          name: f.originalName,
          type: f.fileType,
          size: f.fileSize,
          s3Key: f.s3Key
        }))
      }
    });
  } catch (error) {
    console.error('❌ Failed to get session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get session'
    });
  }
});

/**
 * POST /api/shopkeeper/sessions/:sessionId/claim
 * Claim a session for processing
 */
router.post('/sessions/:sessionId/claim', verifyApiKey, async (req, res) => {
  const { sessionId } = req.params;

  try {
    sessionManager.assignToShopkeeper(sessionId, req.shopkeeper.id);

    res.json({
      success: true,
      message: 'Session claimed successfully'
    });
  } catch (error) {
    console.error('❌ Failed to claim session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to claim session'
    });
  }
});

/**
 * GET /api/shopkeeper/files/:fileId/download
 * Download a file (returns presigned S3 URL or file data)
 */
router.get('/files/:fileId/download', verifyApiKey, async (req, res) => {
  const { fileId } = req.params;

  try {
    // Get file info from memory
    const file = sessionManager.getFileById(fileId);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Option 1: Return presigned URL (shopkeeper downloads directly from S3)
    const downloadUrl = s3Service.getPresignedUrl(file.s3_key);

    res.json({
      success: true,
      file: {
        id: file.id,
        name: file.originalName,
        type: file.fileType,
        size: file.fileSize,
        downloadUrl: downloadUrl
      }
    });

    // Option 2: Stream file directly (uncomment to use)
    // const fileBuffer = await s3Service.downloadFile(file.s3_key);
    // res.setHeader('Content-Type', file.file_type);
    // res.setHeader('Content-Disposition', `inline; filename="${file.original_name}"`);
    // res.send(fileBuffer);

  } catch (error) {
    console.error('❌ File download failed:', error);
    res.status(500).json({
      success: false,
      message: 'File download failed'
    });
  }
});

/**
 * POST /api/shopkeeper/sessions/:sessionId/complete
 * Mark session as completed
 */
router.post('/sessions/:sessionId/complete', verifyApiKey, async (req, res) => {
  const { sessionId } = req.params;

  try {
    // Update session status
    sessionManager.updateStatus(sessionId, 'completed');

    // Delete files from S3
    await s3Service.deleteSessionFiles(sessionId);

    res.json({
      success: true,
      message: 'Session completed and files deleted'
    });
  } catch (error) {
    console.error('❌ Failed to complete session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete session'
    });
  }
});

module.exports = router;
