import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';
import { 
  createSession, 
  getSession, 
  updateSession, 
  deleteSession 
} from '../utils/sessionManager.js';
import {
  validateFile,
  sanitizeFileName,
  getFileCategory
} from '../utils/fileValidator.js';
import { encryptFile, decryptFile, secureDeleteDirectory } from '../utils/encryption.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, '../../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export async function uploadFiles(req, res) {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'No files provided'
      });
    }

    // Create session first
    const session = createSession();

    // Validate and process uploaded files
    const uploadedFiles = [];
    const sessionUploadDir = path.join(UPLOADS_DIR, session.sessionId);

    // Create session upload directory
    if (!fs.existsSync(sessionUploadDir)) {
      fs.mkdirSync(sessionUploadDir, { recursive: true });
    }

    const encryptionKey = process.env.ENCRYPTION_KEY;

    for (const file of req.files) {
      const validation = validateFile(file);
      
      if (!validation.valid) {
        return res.status(400).json({
          error: `Invalid file: ${file.originalname}`,
          details: validation.errors
        });
      }

      const sanitized = sanitizeFileName(file.originalname);
      const fileId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      const originalPath = file.path;
      const encryptedFileName = `${fileId}.enc`;
      const encryptedPath = path.join(sessionUploadDir, encryptedFileName);

      // Encrypt the file
      await encryptFile(originalPath, encryptedPath, encryptionKey);

      // Delete original uploaded file
      fs.unlinkSync(originalPath);

      uploadedFiles.push({
        id: fileId,
        name: sanitized,
        size: file.size,
        type: file.mimetype,
        category: getFileCategory(file.mimetype),
        uploadedAt: Date.now()
      });
    }

    // Update session with files
    session.files = uploadedFiles;
    session.encryptionKey = encryptionKey;
    updateSession(session.sessionId, session);

    res.json({
      sessionId: session.sessionId,
      files: uploadedFiles,
      expiresAt: session.expiresAt,
      status: 'active'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: error.message
    });
  }
}

export function getSessionData(req, res) {
  try {
    const { sessionId } = req.params;
    const session = getSession(sessionId);

    if (!session) {
      return res.status(404).json({
        error: 'Session not found or expired'
      });
    }

    res.json({
      sessionId: session.sessionId,
      files: session.files,
      status: session.status,
      expiresAt: session.expiresAt,
      createdAt: session.createdAt
    });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({
      error: 'Failed to retrieve session'
    });
  }
}

export async function completeSession(req, res) {
  try {
    const { sessionId } = req.params;
    const session = getSession(sessionId);

    if (!session) {
      return res.status(404).json({
        error: 'Session not found'
      });
    }

    // Delete all files in the session directory
    const sessionUploadDir = path.join(UPLOADS_DIR, sessionId);
    await secureDeleteDirectory(sessionUploadDir);

    // Delete session record
    deleteSession(sessionId);

    res.json({
      success: true,
      message: 'Session completed and all files deleted'
    });
  } catch (error) {
    console.error('Complete session error:', error);
    res.status(500).json({
      error: 'Failed to complete session',
      message: error.message
    });
  }
}

export async function viewFile(req, res) {
  try {
    const { sessionId, fileId } = req.params;
    const session = getSession(sessionId);

    if (!session) {
      return res.status(404).json({
        error: 'Session not found'
      });
    }

    const file = session.files.find(f => f.id === fileId);
    if (!file) {
      return res.status(404).json({
        error: 'File not found in session'
      });
    }

    const encryptedPath = path.join(UPLOADS_DIR, sessionId, `${fileId}.enc`);
    if (!fs.existsSync(encryptedPath)) {
      return res.status(404).json({
        error: 'File not found on server'
      });
    }

    // Decrypt file in memory and stream to browser
    const decryptedPath = path.join(os.tmpdir(), `temp_${fileId}_${Date.now()}`);
    
    try {
      await decryptFile(encryptedPath, decryptedPath, session.encryptionKey);
      
      // Set appropriate headers for viewing in browser (NOT downloading)
      res.setHeader('Content-Type', file.type);
      res.setHeader('Content-Disposition', 'inline'); // Force inline, no filename hint
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      // Additional security headers to prevent download
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Download-Options', 'noopen'); // IE/Edge specific
      res.setHeader('Content-Security-Policy', "default-src 'self'");
      res.setHeader('X-Frame-Options', 'SAMEORIGIN');
      res.setHeader('X-Session-ID', sessionId); // Watermark/tracking
      
      // Stream file to browser
      const stream = fs.createReadStream(decryptedPath);
      stream.pipe(res);
      
      // Clean up temp file after streaming
      stream.on('end', () => {
        fs.unlink(decryptedPath, (err) => {
          if (err) console.error('Error deleting temp file:', err);
        });
      });
      
      stream.on('error', (err) => {
        console.error('Stream error:', err);
        res.status(500).json({ error: 'Error streaming file' });
        fs.unlink(decryptedPath, (err) => {
          if (err) console.error('Error deleting temp file:', err);
        });
      });
    } catch (error) {
      // Clean up on error
      if (fs.existsSync(decryptedPath)) {
        fs.unlinkSync(decryptedPath);
      }
      throw error;
    }
  } catch (error) {
    console.error('View file error:', error);
    res.status(500).json({
      error: 'Failed to view file',
      message: error.message
    });
  }
}

export function downloadFile(req, res) {
  // Download feature disabled for security - files must not persist on shopkeeper's disk
  return res.status(403).json({
    error: 'Download disabled',
    message: 'Files cannot be downloaded to disk for security reasons. Use the Print button to save as PDF instead.'
  });
}
