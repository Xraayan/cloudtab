import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import uploadRoutes from './routes/uploadRoutes.js';
import shopkeeperRoutes from './routes/shopkeeperRoutes.js';
import { errorHandler, validateSessionId } from './middleware/errorHandler.js';
import { cleanupExpiredSessions } from './utils/sessionManager.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, '../uploads');

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api', uploadRoutes);
app.use('/shopkeeper', shopkeeperRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Debug endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working', uploads_dir: UPLOADS_DIR });
});

// Home page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>CloudTab - Secure File Handling</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 0;
          padding: 20px;
        }
        .container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          padding: 40px;
          max-width: 500px;
          text-align: center;
        }
        h1 {
          color: #333;
          margin-bottom: 10px;
        }
        .subtitle {
          color: #666;
          margin-bottom: 30px;
          font-size: 14px;
        }
        .button-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        button, a.button {
          padding: 15px 30px;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }
        .btn-secondary {
          background: #f0f0f0;
          color: #333;
          border: 2px solid #667eea;
        }
        .btn-secondary:hover {
          background: #667eea;
          color: white;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>📄 CloudTab</h1>
        <p class="subtitle">Secure File Handling for Internet Cafes</p>
        
        <div class="button-group">
          <a href="/upload" class="button btn-primary">📤 Upload Files</a>
          <a href="/shopkeeper-login" class="button btn-secondary">🏪 Shopkeeper Login</a>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Shopkeeper login page
app.get('/shopkeeper-login', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>CloudTab - Shopkeeper Login</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 0;
          padding: 20px;
        }
        .container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          padding: 40px;
          max-width: 400px;
          width: 100%;
        }
        h1 {
          color: #333;
          text-align: center;
          margin-bottom: 30px;
        }
        .form-group {
          margin-bottom: 20px;
        }
        label {
          display: block;
          margin-bottom: 8px;
          color: #333;
          font-weight: 600;
        }
        input {
          width: 100%;
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
          font-size: 16px;
          box-sizing: border-box;
          transition: border-color 0.3s;
        }
        input:focus {
          outline: none;
          border-color: #667eea;
        }
        input::placeholder {
          color: #999;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        button {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }
        .back-link {
          text-align: center;
          margin-top: 20px;
        }
        .back-link a {
          color: #667eea;
          text-decoration: none;
          font-size: 14px;
        }
        .back-link a:hover {
          text-decoration: underline;
        }
        .info {
          background: #f0f0f0;
          padding: 15px;
          border-radius: 6px;
          margin-bottom: 20px;
          font-size: 14px;
          color: #666;
          border-left: 4px solid #667eea;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🏪 Shopkeeper Access</h1>
        
        <div class="info">
          Enter the 6-digit session ID provided by the customer to access and view their files.
        </div>

        <form onsubmit="handleLogin(event)">
          <div class="form-group">
            <label for="sessionId">Session ID</label>
            <input 
              type="text" 
              id="sessionId" 
              placeholder="ABC123" 
              maxlength="6"
              style="text-transform: uppercase; letter-spacing: 4px; font-size: 20px; text-align: center;"
              required
            />
          </div>
          <button type="submit">Access Session</button>
        </form>

        <div class="back-link">
          <a href="/">← Back to Home</a>
        </div>
      </div>

      <script>
        function handleLogin(event) {
          event.preventDefault();
          const sessionId = document.getElementById('sessionId').value.toUpperCase();
          
          if (!/^[A-Z0-9]{6}$/.test(sessionId)) {
            alert('Invalid session ID. Must be 6 characters.');
            return;
          }

          window.location.href = '/shopkeeper/' + sessionId;
        }
      </script>
    </body>
    </html>
  `);
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
  console.log(`✅ CloudTab Backend running on http://localhost:${PORT}`);
  console.log(`📤 Upload endpoint: POST http://localhost:${PORT}/api/upload`);
  console.log(`🏪 Shopkeeper login: http://localhost:${PORT}/shopkeeper-login`);
});
