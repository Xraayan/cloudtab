# 🚀 CloudTab Implementation Plan

## Architecture: Customer Portal (Cloud) + Shopkeeper Backend (Local PC)

**Customer uploads → Cloud relay → Shopkeeper's PC downloads → Print → Delete**

---

## Phase 1: Cloud Relay Server (1-2 hours)

### What we're building:
- Receives files from customers
- Stores encrypted in S3 temporarily
- Notifies shopkeeper via WebSocket
- Serves files to shopkeeper on demand

### Files to create:
```
cloud-relay/
├── package.json
├── server.js                 # Main Express + WebSocket server
├── routes/
│   ├── customerRoutes.js    # Customer upload endpoints
│   └── shopkeeperRoutes.js  # Shopkeeper download endpoints
├── services/
│   ├── s3Service.js         # S3 file operations
│   ├── wsHub.js             # WebSocket management
│   └── sessionManager.js    # Session lifecycle
└── db/
    └── schema.sql           # PostgreSQL tables
```

### Implementation:
1. Create Express server with WebSocket support
2. Customer upload endpoint: `POST /api/sessions/upload`
3. Shopkeeper endpoints: `GET /api/sessions/pending`, `GET /api/sessions/:id/download`
4. WebSocket hub: Notify shopkeepers of new sessions
5. S3 integration: Store/retrieve encrypted files
6. Database: Track sessions and status

---

## Phase 2: Update Customer Portal (30 min)

### Changes needed:
1. Update API URL to point to cloud relay
2. Add client-side encryption (optional extra layer)
3. Update success page to show cloud status

### Files to modify:
- `frontend/src/services/api.js` - Change BASE_URL
- `frontend/src/components/FileUpload.jsx` - Update upload logic
- `frontend/.env` - Add `VITE_RELAY_URL`

---

## Phase 3: Shopkeeper Desktop App (2-3 hours)

### What we're building:
- Connects to cloud relay via WebSocket
- Shows notifications for new sessions
- Downloads encrypted files
- Decrypts and displays locally
- Prints and auto-deletes

### Files to create:
```
shopkeeper-app/src/
├── App.jsx                      # Main UI
├── components/
│   ├── ConnectionStatus.jsx    # WebSocket status
│   ├── SessionList.jsx         # Pending sessions
│   ├── FileViewer.jsx          # Canvas PDF viewer
│   └── PrintControls.jsx       # Print + Complete buttons
└── services/
    ├── relayConnection.js      # WebSocket client
    ├── fileHandler.js          # Download + decrypt
    └── secureViewer.js         # Canvas rendering
```

### Implementation:
1. WebSocket connection to relay server
2. Listen for new session notifications
3. Download encrypted files from relay
4. Decrypt locally (key stored in config)
5. Canvas-based PDF viewer (reuse existing code)
6. Print function (secure iframe method)
7. Complete job → notify relay → delete local files

---

## Phase 4: Database Setup (15 min)

### Create PostgreSQL database:
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  session_id VARCHAR(6) UNIQUE,
  file_count INTEGER,
  status VARCHAR(20) DEFAULT 'pending',
  s3_keys JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

CREATE TABLE files (
  id UUID PRIMARY KEY,
  session_id VARCHAR(6),
  s3_key VARCHAR(500),
  file_name VARCHAR(255),
  file_size BIGINT,
  uploaded_at TIMESTAMP DEFAULT NOW()
);
```

---

## Phase 5: S3 Configuration (10 min)

### Setup S3 bucket with auto-delete:
```json
{
  "Rules": [{
    "Id": "AutoDelete",
    "Status": "Enabled",
    "Expiration": { "Days": 1 }
  }]
}
```

### CORS configuration:
```json
{
  "CORSRules": [{
    "AllowedOrigins": ["https://cloudtab.com"],
    "AllowedMethods": ["GET", "POST", "PUT"],
    "AllowedHeaders": ["*"]
  }]
}
```

---

## Phase 6: Deployment (30 min)

### Deploy cloud relay:
```bash
cd cloud-relay
railway login
railway init
railway up
```

### Deploy customer portal:
```bash
cd frontend
npm run build
vercel --prod
```

### Build shopkeeper app:
```bash
cd shopkeeper-app
npm run package:win
```

---

## Phase 7: Testing (1 hour)

### End-to-end test:
1. Customer uploads file at cloudtab.com
2. File stored in S3
3. Shopkeeper app receives notification
4. Shopkeeper downloads and views file
5. Prints document
6. Completes job
7. File deleted from S3 and shopkeeper's PC

---

## 🎯 Total Time: 5-6 hours

## 🔒 Security Maintained:
- Files encrypted in transit
- Temporary cloud storage (auto-delete)
- Shopkeeper initiates all connections
- Decryption happens locally only
- No file persistence after completion

---

**Ready to start implementation?**
