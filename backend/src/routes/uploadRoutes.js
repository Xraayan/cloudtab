import express from 'express';
import multer from 'multer';
import path from 'path';
import os from 'os';
import {
  uploadFiles,
  getSessionData,
  completeSession,
  downloadFile,
  viewFile
} from '../controllers/uploadController.js';
import { validateSessionId } from '../middleware/errorHandler.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  dest: path.join(os.tmpdir(), 'cloudtab-uploads'),
  limits: {
    fileSize: 52428800, // 50MB
    files: 10
  },
  fileFilter: (req, file, cb) => {
    // File filtering done in controller
    cb(null, true);
  }
});

// Upload files - generates session ID
router.post('/upload', upload.array('files', 10), uploadFiles);

// Get session details and file list
router.get('/session/:sessionId', validateSessionId, getSessionData);

// Mark session as complete and delete files
router.post('/session/:sessionId/complete', validateSessionId, completeSession);

// Download/preview file - view in browser (NOT download)
router.get('/session/:sessionId/file/:fileId/view', validateSessionId, viewFile);

// Download endpoint (disabled for security - returns error)
router.get('/session/:sessionId/file/:fileId/download', validateSessionId, downloadFile);

export default router;
