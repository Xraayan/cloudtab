# CloudTab Relay Server

Cloud relay server that connects customers (uploading files) with shopkeepers (printing files).

## Architecture

```
Customer → Upload to Relay → S3 Storage → Notify Shopkeeper → Download to PC → Print
```

## Features

- ✅ File upload from customers
- ✅ Temporary S3 storage (auto-delete)
- ✅ WebSocket notifications to shopkeepers
- ✅ Session management with PostgreSQL
- ✅ Secure API key authentication
- ✅ Auto-cleanup of expired sessions

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your credentials
```

### 3. Setup Database
```bash
npm run db:setup
```

### 4. Start Server
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Customer Endpoints

**Create Session:**
```http
POST /api/customer/sessions/create
Content-Type: application/json

{
  "customerName": "John Doe"
}
```

**Upload Files:**
```http
POST /api/customer/sessions/:sessionId/upload
Content-Type: multipart/form-data

files: [file1, file2, ...]
```

**Check Status:**
```http
GET /api/customer/sessions/:sessionId/status
```

### Shopkeeper Endpoints

**Get Pending Sessions:**
```http
GET /api/shopkeeper/sessions/pending
X-API-Key: your-api-key
```

**Get Session Details:**
```http
GET /api/shopkeeper/sessions/:sessionId
X-API-Key: your-api-key
```

**Download File:**
```http
GET /api/shopkeeper/files/:fileId/download
X-API-Key: your-api-key
```

**Complete Session:**
```http
POST /api/shopkeeper/sessions/:sessionId/complete
X-API-Key: your-api-key
```

## WebSocket Protocol

### Connect:
```javascript
const ws = new WebSocket('ws://localhost:5000/ws');
```

### Authenticate:
```javascript
ws.send(JSON.stringify({
  type: 'authenticate',
  apiKey: 'your-api-key'
}));
```

### Receive Notifications:
```javascript
ws.on('message', (data) => {
  const message = JSON.parse(data);
  
  if (message.type === 'new_session') {
    console.log('New session:', message.sessionId);
  }
});
```

## Deployment

### Railway
```bash
railway login
railway init
railway up
```

### Render
```bash
# Connect GitHub repo to Render
# Add environment variables in dashboard
```

### Heroku
```bash
heroku create cloudtab-relay
git push heroku main
```

## Environment Variables

See `.env.example` for all required variables.

## Security

- API key authentication for shopkeepers
- HTTPS/WSS in production
- Files auto-expire after 24 hours
- Sessions expire after 30 minutes
- Helmet.js security headers
- CORS protection

## Monitoring

Health check: `GET /health`

Returns:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-31T...",
  "uptime": 12345,
  "connectedShopkeepers": 2
}
```
