import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import uploadRoutes from './routes/uploadRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { cleanupExpiredSessions } from './utils/sessionManager.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, '../uploads');

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173', 
  'http://localhost:5174',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
];

// Add production frontend URLs if in production
if (process.env.NODE_ENV === 'production') {
  if (process.env.USER_FRONTEND_URL) allowedOrigins.push(process.env.USER_FRONTEND_URL);
  if (process.env.SHOPKEEPER_FRONTEND_URL) allowedOrigins.push(process.env.SHOPKEEPER_FRONTEND_URL);
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found'
  });
});

// Error handler
app.use(errorHandler);

// Cleanup expired sessions every 30 minutes
setInterval(() => {
  cleanupExpiredSessions();
}, 30 * 60 * 1000);

// Start server
app.listen(PORT, () => {
  console.log(`✅ CloudTab Backend API running on http://localhost:${PORT}`);
  console.log(`📤 Upload endpoint: POST http://localhost:${PORT}/api/upload`);
  console.log(`🔍 Session endpoint: GET http://localhost:${PORT}/api/session/:id`);
});
