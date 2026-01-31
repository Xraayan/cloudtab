require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const http = require('http');

const customerRoutes = require('./routes/customerRoutes');
const shopkeeperRoutes = require('./routes/shopkeeperRoutes');
const wsHub = require('./services/wsHub');
const sessionManager = require('./services/sessionManager');
const s3Service = require('./services/s3Service');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    connectedShopkeepers: wsHub.getConnectedCount()
  });
});

// API Routes
app.use('/api/customer', customerRoutes);
app.use('/api/shopkeeper', shopkeeperRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'CloudTab Relay Server',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      customer: '/api/customer',
      shopkeeper: '/api/shopkeeper',
      websocket: '/ws'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Initialize WebSocket hub
wsHub.initialize(server);

// Cleanup expired sessions every 10 minutes
setInterval(async () => {
  try {
    const expired = await sessionManager.cleanupExpiredSessions();
    
    // Delete S3 files for expired sessions
    for (const sessionId of expired) {
      await s3Service.deleteSessionFiles(sessionId);
    }
  } catch (error) {
    console.error('❌ Cleanup error:', error);
  }
}, 10 * 60 * 1000);

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log('');
  console.log('🚀 ================================');
  console.log('🚀  CloudTab Relay Server');
  console.log('🚀 ================================');
  console.log(`🚀  HTTP Server: http://localhost:${PORT}`);
  console.log(`🚀  WebSocket: ws://localhost:${PORT}/ws`);
  console.log(`🚀  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('🚀 ================================');
  console.log('');
  console.log('📡 Waiting for connections...');
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
