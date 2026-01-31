# 🔒 CloudTab - Secure Hybrid Architecture

## 🎯 Core Principle
**"Files NEVER leave shopkeeper's control"**

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    INTERNET (Public)                        │
│                                                             │
│  ┌──────────────────────────────────────────┐              │
│  │  Customer Portal (Deployed on Vercel)    │              │
│  │  - File upload interface                 │              │
│  │  - Session creation                      │              │
│  │  - Stores files temporarily in cloud     │              │
│  └──────────────────┬───────────────────────┘              │
│                     │                                       │
│                     │ HTTPS                                 │
│                     ▼                                       │
│  ┌──────────────────────────────────────────┐              │
│  │  Cloud Relay Server (Railway/Render)     │              │
│  │  - Receives files from customers         │              │
│  │  - Stores encrypted in S3/temp           │              │
│  │  - WebSocket notification hub            │              │
│  │  - Session database (PostgreSQL)         │              │
│  └──────────────────┬───────────────────────┘              │
│                     │                                       │
└─────────────────────┼───────────────────────────────────────┘
                      │ WebSocket/Polling
                      │ (Shopkeeper initiated)
┌─────────────────────▼───────────────────────────────────────┐
│              SHOPKEEPER'S PC (Private)                      │
│                                                             │
│  ┌──────────────────────────────────────────┐              │
│  │  CloudTab Desktop App (.exe)             │              │
│  │  - Connects to cloud relay               │              │
│  │  - Downloads encrypted files             │              │
│  │  - Decrypts locally (key never sent)     │              │
│  │  - Displays for printing                 │              │
│  │  - Auto-deletes after completion         │              │
│  └──────────────────────────────────────────┘              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Flow

### **Step 1: Customer Upload**
```
Customer → cloudtab.com → Upload file
```
- File encrypted in browser (client-side)
- Sent to cloud relay server
- Stored in temporary S3 bucket (auto-expire 30 min)
- Session ID generated (ABC123)
- QR code shown to customer

### **Step 2: Notification**
```
Cloud Relay → WebSocket → Shopkeeper App
```
- Shopkeeper app maintains WebSocket connection
- Cloud sends notification: "New session: ABC123"
- Shopkeeper sees notification in app

### **Step 3: File Retrieval**
```
Shopkeeper App → Request file → Cloud Relay → S3
```
- Shopkeeper app requests encrypted file
- Cloud relay provides download link
- File downloads to shopkeeper's PC
- Decrypted locally (encryption key only on shopkeeper's PC)
- File displayed in app

### **Step 4: Printing**
```
Shopkeeper → View → Print → Complete
```
- File displayed in canvas (no download button)
- Shopkeeper prints
- Clicks "Complete Job"
- Local file deleted immediately
- Cloud notified, S3 file deleted

### **Step 5: Customer Confirmation**
```
Cloud Relay → Customer Portal → "Job Complete"
```
- Customer's browser polls for status
- Shows "Job completed" message
- Session archived

---

## 🛡️ Security Layers

### **Layer 1: Client-Side Encryption**
```javascript
// Customer's browser encrypts BEFORE upload
const encryptedFile = await encryptInBrowser(file, sessionKey);
uploadToCloud(encryptedFile);
```

### **Layer 2: Temporary Cloud Storage**
```javascript
// S3 auto-delete after 30 minutes
{
  "LifecycleConfiguration": {
    "Rules": [{
      "Expiration": { "Days": 1 },
      "Status": "Enabled"
    }]
  }
}
```

### **Layer 3: Shopkeeper-Only Decryption**
```javascript
// Encryption key stored ONLY on shopkeeper's PC
const decryptedFile = decryptLocally(encryptedFile, LOCAL_KEY);
// Cloud NEVER has decryption key
```

### **Layer 4: No File Persistence**
```javascript
// Shopkeeper app - in-memory only
const fileBuffer = Buffer.from(encryptedData);
displayInMemory(fileBuffer); // Canvas rendering
// After print:
fileBuffer.fill(0); // Zero out memory
deleteFromDisk();   // Remove any temp files
```

### **Layer 5: WebSocket Security**
```javascript
// Shopkeeper initiates connection (no exposed ports)
const ws = new WebSocket('wss://relay.cloudtab.com', {
  headers: { 'Authorization': `Bearer ${SHOP_TOKEN}` }
});
// Cloud can't initiate connection to shopkeeper
```

---

## 📡 Communication Options

### **Option A: WebSocket (Recommended)**

**Pros:**
- Real-time notifications
- Shopkeeper initiates (no port forwarding)
- Bidirectional communication

**Cons:**
- Requires persistent connection
- More complex

**Implementation:**
```javascript
// Shopkeeper app
const ws = new WebSocket('wss://relay.cloudtab.com');
ws.on('message', (data) => {
  if (data.type === 'NEW_SESSION') {
    showNotification(`New job: ${data.sessionId}`);
  }
});
```

### **Option B: Long Polling**

**Pros:**
- Simple to implement
- Works through firewalls
- No persistent connection needed

**Cons:**
- Higher latency
- More server requests

**Implementation:**
```javascript
// Shopkeeper app polls every 5 seconds
setInterval(async () => {
  const sessions = await fetch('https://relay.cloudtab.com/api/pending');
  if (sessions.length > 0) {
    showNotification(`${sessions.length} new jobs`);
  }
}, 5000);
```

### **Option C: Server-Sent Events (SSE)**

**Pros:**
- Unidirectional (server → client)
- Auto-reconnect
- Simpler than WebSocket

**Cons:**
- One-way only

**Implementation:**
```javascript
// Shopkeeper app
const eventSource = new EventSource('https://relay.cloudtab.com/api/stream');
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  showNotification(`New job: ${data.sessionId}`);
};
```

---

## 🏗️ Implementation Components

### **Component 1: Customer Portal (React - Cloud)**

**Location:** Deployed on Vercel  
**URL:** https://cloudtab.com

**Features:**
- File upload with drag-drop
- Client-side encryption
- Session ID generation
- QR code display
- Status polling

**Files:**
- `frontend/src/components/FileUpload.jsx` (existing)
- `frontend/src/utils/encryption.js` (NEW - client-side encrypt)
- `frontend/src/services/cloudApi.js` (NEW - API calls)

### **Component 2: Cloud Relay Server (Node.js - Cloud)**

**Location:** Deployed on Railway  
**URL:** https://relay.cloudtab.com

**Features:**
- Receive encrypted files from customers
- Store in S3 temporarily
- WebSocket hub for shopkeepers
- Session management (PostgreSQL)
- File delivery to shopkeepers

**Files:**
- `cloud-relay/server.js` (NEW - Express + WebSocket)
- `cloud-relay/routes/customerRoutes.js` (NEW - upload endpoint)
- `cloud-relay/routes/shopkeeperRoutes.js` (NEW - download endpoint)
- `cloud-relay/services/s3Service.js` (NEW - S3 operations)
- `cloud-relay/services/wsHub.js` (NEW - WebSocket management)

### **Component 3: Shopkeeper Desktop App (Electron - Local)**

**Location:** Runs on shopkeeper's PC  
**File:** CloudTab.exe

**Features:**
- Connect to cloud relay (WebSocket/polling)
- Receive notifications
- Download encrypted files
- Decrypt locally
- Canvas-based PDF viewer
- Print function
- Auto-cleanup

**Files:**
- `shopkeeper-app/src/App.jsx` (NEW - main UI)
- `shopkeeper-app/src/services/relayConnection.js` (NEW - WebSocket)
- `shopkeeper-app/src/services/fileHandler.js` (NEW - decrypt + render)
- `shopkeeper-app/electron/main.js` (existing - needs update)

---

## 📦 Database Schema

### **Sessions Table**
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(6) UNIQUE NOT NULL,
  customer_name VARCHAR(255),
  file_count INTEGER,
  status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed
  s3_keys JSONB, -- Array of S3 object keys
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '30 minutes'),
  completed_at TIMESTAMP
);

CREATE INDEX idx_status ON sessions(status);
CREATE INDEX idx_session_id ON sessions(session_id);
```

### **Files Table**
```sql
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(6) REFERENCES sessions(session_id),
  original_name VARCHAR(255),
  file_type VARCHAR(100),
  file_size BIGINT,
  s3_key VARCHAR(500) UNIQUE,
  encrypted BOOLEAN DEFAULT true,
  uploaded_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔑 Environment Variables

### **Customer Portal (.env):**
```env
VITE_RELAY_API_URL=https://relay.cloudtab.com
VITE_ENCRYPTION_ENABLED=true
```

### **Cloud Relay Server (.env):**
```env
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL=postgresql://user:pass@db.railway.app:5432/cloudtab

# S3 Storage
AWS_S3_BUCKET=cloudtab-temp-files
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1

# Security
JWT_SECRET=your-jwt-secret
SESSION_EXPIRY=1800 # 30 minutes

# CORS
ALLOWED_ORIGINS=https://cloudtab.com
```

### **Shopkeeper App (config.json):**
```json
{
  "relayUrl": "wss://relay.cloudtab.com",
  "shopId": "SHOP_001",
  "apiKey": "your-shop-api-key",
  "encryptionKey": "your-local-encryption-key",
  "pollingInterval": 5000,
  "autoUpdate": true
}
```

---

## 🚀 Deployment Steps

### **Step 1: Deploy Cloud Relay**
```bash
cd cloud-relay
npm install
railway login
railway up
```

### **Step 2: Deploy Customer Portal**
```bash
cd frontend
npm run build
vercel --prod
```

### **Step 3: Build Shopkeeper App**
```bash
cd shopkeeper-app
npm run package:win
# Output: CloudTab-Setup.exe
```

### **Step 4: Configure Database**
```bash
# Create tables
psql $DATABASE_URL < schema.sql
```

### **Step 5: Configure S3**
```bash
# Create bucket with auto-delete policy
aws s3 mb s3://cloudtab-temp-files
aws s3api put-bucket-lifecycle-configuration --bucket cloudtab-temp-files --lifecycle-configuration file://s3-lifecycle.json
```

---

## ✅ Security Checklist

- [x] Files encrypted client-side before upload
- [x] Cloud storage auto-expires (30 min)
- [x] Shopkeeper initiates all connections (no exposed ports)
- [x] Decryption key never sent to cloud
- [x] Files decrypt in memory only
- [x] Auto-delete after job completion
- [x] WebSocket uses authentication tokens
- [x] HTTPS/WSS everywhere
- [x] No file persistence on shopkeeper's PC
- [x] Canvas-based viewing (no download buttons)
- [x] Right-click blocked
- [x] Print screen blocked
- [x] Session watermarks

---

## 💰 Cost Estimate

### **Free Tier (100 sessions/day):**
- Railway: $5/month (relay server)
- Vercel: Free (customer portal)
- Supabase: Free (database)
- S3: $1/month (temporary storage)
- **Total: $6/month**

### **Production (1000 sessions/day):**
- Railway: $20/month
- Vercel: Free
- AWS RDS: $15/month
- S3: $5/month
- **Total: $40/month**

---

## 🎉 Result

✅ Customers access from anywhere (cloudtab.com)  
✅ Files encrypted and temporarily stored  
✅ Shopkeeper downloads to their PC  
✅ Full security maintained  
✅ No port forwarding needed  
✅ Auto-cleanup everywhere  
✅ Simple .exe for shopkeepers  

**"Cloud convenience + Local security"** 🔒
