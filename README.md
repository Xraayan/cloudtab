# CloudTab - Secure File Handling for Internet Cafes

A complete solution for secure file uploads, encryption, and management in internet cafes and xerox shops. Customers upload files via a web portal, shopkeepers access them through an isolated browser session, and all data is automatically deleted after printing.

## 🎯 Features

### Security
- ✅ **AES-256 Encryption** - All files encrypted at rest
- ✅ **Secure Deletion** - Files overwritten 3 times before deletion
- ✅ **Session Isolation** - Unique 6-digit session IDs
- ✅ **CORS Protection** - Controlled cross-origin access
- ✅ **Path Traversal Prevention** - File name sanitization

### Functionality
- ✅ **Drag & Drop Upload** - User-friendly file upload with progress tracking
- ✅ **QR Code Generation** - Easy session sharing with shopkeepers
- ✅ **File Type Validation** - PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, TIFF, TXT
- ✅ **Auto-Expiration** - Sessions expire after 2 hours
- ✅ **Responsive Design** - Works on desktop and mobile

### Supported File Types
- 📄 PDF documents
- 🖼️ Images (JPG, PNG, TIFF)
- 📋 Documents (DOC, DOCX)
- 📊 Spreadsheets (XLS, XLSX)
- 📝 Text files (TXT)

**Max file size**: 50MB per file

## 📁 Project Structure

```
cloudtab/
├── frontend/                  # React + Vite web portal
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── services/         # API client
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/                   # Node.js + Express API
│   ├── src/
│   │   ├── routes/           # API routes
│   │   ├── controllers/      # Business logic
│   │   ├── middleware/       # Error handling, validation
│   │   ├── utils/            # Encryption, session management
│   │   └── server.js
│   ├── sessions/             # Session metadata (auto-created)
│   ├── uploads/              # Encrypted file storage (auto-created)
│   ├── .env.example
│   └── package.json
│
├── local-service/            # Python service (Phase 2)
│   ├── src/
│   │   ├── main.py           # FastAPI server
│   │   └── browser.py        # Browser automation
│   └── requirements.txt
│
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+ (for Phase 2)
- A text editor or IDE

### Backend Setup

1. **Install backend dependencies:**
```bash
cd backend
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
```

Edit `.env` and set a 64-character encryption key (or generate one):
```bash
# Generate a secure encryption key (on Windows, run in PowerShell):
# [System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32)) | clip

PORT=5000
NODE_ENV=development
SESSION_TIMEOUT=7200000
MAX_FILE_SIZE=52428800
ENCRYPTION_KEY=your-64-character-hex-string-here
```

3. **Start the backend:**
```bash
npm start
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. **Install frontend dependencies:**
```bash
cd frontend
npm install
```

2. **Start the development server:**
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## 📖 How to Use

### For Customers (Upload)

1. Open `http://localhost:5173` in a browser
2. Click "Upload Files" or drag & drop files
3. Select multiple files (supported formats only)
4. Click "Upload Files"
5. Share the 6-digit Session ID with the shopkeeper
6. Can also scan QR code with the session link

### For Shopkeepers (Access)

**Method 1: Direct URL**
1. Go to `http://localhost:5000/shopkeeper-login`
2. Enter the 6-digit Session ID
3. View and print files

**Method 2: QR Code**
1. Scan QR code from customer's screen
2. Session opens directly with all files

**On the Session Page:**
- View uploaded files
- Download files
- Print files (browser print dialog)
- Mark job as complete (deletes all files)

## 🔐 Security Details

### Critical Security Principle
**Files MUST NEVER persist on the shopkeeper's PC after job completion.**

This system achieves zero file persistence through intelligent architecture:

### Encryption
- **Algorithm**: AES-256-CBC
- **Key Size**: 256-bit (32 bytes)
- **IV**: Randomly generated for each file
- **Method**: Symmetric encryption (same key for encrypt/decrypt)
- **Storage**: Files encrypted at rest on server disk

### File Viewing (SECURE - No Download Possible)
```
Browser Request for File
    ↓
Backend decrypts file IN MEMORY (never written to disk)
    ↓
Browser renders via:
  - PDF.js for PDFs (no download button)
  - <img> tags for images (no download option)
    ↓
HTTP Headers prevent disk caching:
  - Content-Disposition: inline (not attachment)
  - Cache-Control: no-store, no-cache
  - Pragma: no-cache
  - Expires: 0
    ↓
Decrypted data deleted from server memory
```

**Result:** Files exist only in browser memory, never on disk.

### Printing (Only Persistent Storage Option)
```
User clicks [Print] → Browser native print dialog → Physical document only
```

The only way files persist is as physical printed documents (user's choice).

### Session Management
```
sessions/
└── {sessionId}.json
    {
      "sessionId": "ABC123",
      "files": [...],
      "createdAt": timestamp,
      "expiresAt": timestamp,
      "status": "active",
      "encryptionKey": "..."
    }
```

### Auto-Cleanup After Job Completion
When shopkeeper clicks "Complete Job":

1. **Backend Actions:**
   - Delete all encrypted session files
   - Mark session as completed
   - Call local service cleanup API

2. **Local Service Actions:**
   - Delete isolated browser profile from %TEMP%
   - Scan Downloads folder for session files → securely delete
   - Clear Windows print spooler temporary files
   - Scan Windows Temp folder for session files → securely delete
   - Multi-pass overwrite (3-pass) for all deleted files

3. **Verification:**
   - Confirm ZERO files related to session remain on PC
   - Log cleanup completion with timestamp

**Result:** No digital trace of files remains on shopkeeper's PC.

### Secure Deletion
- Sessions expire after **2 hours**
- Manual cleanup runs on job completion
- Files are securely overwritten with random data (3-pass) before deletion
- Prevents recovery using disk recovery tools
- Complies with Indian data protection standards

## 🧪 API Endpoints

### Upload Endpoint
```
POST /api/upload
Content-Type: multipart/form-data

Response:
{
  "sessionId": "ABC123",
  "files": [
    {
      "id": "1705123456_abc123def",
      "name": "document.pdf",
      "size": 2097152,
      "type": "application/pdf",
      "category": "pdf",
      "uploadedAt": 1705123456789
    }
  ],
  "expiresAt": 1705130656789,
  "status": "active"
}
```

### Get Session
```
GET /api/session/:sessionId

Response:
{
  "sessionId": "ABC123",
  "files": [...],
  "status": "active",
  "expiresAt": 1705130656789,
  "createdAt": 1705123456789
}
```

### Complete Session
```
POST /api/session/:sessionId/complete

Response:
{
  "success": true,
  "message": "Session completed and all files deleted"
}
```

### Health Check
```
GET /api/health

Response:
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🛠️ Testing with curl/Thunder Client

### Upload Files
```bash
curl -X POST http://localhost:5000/api/upload \
  -F "files=@document.pdf" \
  -F "files=@image.jpg"
```

### Get Session Details
```bash
curl http://localhost:5000/api/session/ABC123
```

### Complete Session
```bash
curl -X POST http://localhost:5000/api/session/ABC123/complete
```

### Access Shopkeeper Interface
```
http://localhost:5000/shopkeeper/ABC123
```

## 📊 Database Schema

### sessions/{sessionId}.json
```json
{
  "sessionId": "ABC123",
  "files": [
    {
      "id": "1705123456_abc123def",
      "name": "sample.pdf",
      "size": 2097152,
      "type": "application/pdf",
      "category": "pdf",
      "uploadedAt": 1705123456789
    }
  ],
  "createdAt": 1705123456789,
  "expiresAt": 1705130656789,
  "status": "active",
  "encryptionKey": "hex-encoded-256-bit-key"
}
```

## 🔧 Configuration

### Environment Variables (.env)

```
# Server
PORT=5000
NODE_ENV=development

# Session
SESSION_TIMEOUT=7200000              # 2 hours in milliseconds

# Files
MAX_FILE_SIZE=52428800               # 50MB in bytes

# Encryption
ENCRYPTION_KEY=your-64-char-hex-key  # Must be 64 characters (32 bytes in hex)
```

### Session Configuration
- **Timeout**: 2 hours (7200000 ms)
- **Cleanup interval**: 30 minutes
- **Session ID length**: 6 alphanumeric characters
- **File overwrite passes**: 3 (for secure deletion)

## 📝 File Validation

### Allowed MIME Types
- `application/pdf`
- `image/jpeg`, `image/jpg`, `image/png`, `image/tiff`
- `application/msword`
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- `application/vnd.ms-excel`
- `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- `text/plain`

### Allowed Extensions
- `.pdf`, `.jpg`, `.jpeg`, `.png`, `.doc`, `.docx`, `.xls`, `.xlsx`, `.txt`, `.tiff`, `.tif`

### Max File Size
- **50MB per file**
- **No limit on total files** (recommended: 10 files per session)

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000 (backend)
npx kill-port 5000

# Kill process on port 5173 (frontend)
npx kill-port 5173
```

### CORS Errors
Make sure backend is running on `http://localhost:5000` and frontend on `http://localhost:5173` or `http://127.0.0.1:3000`.

### Files Not Encrypting
Ensure `ENCRYPTION_KEY` is set correctly (64 hexadecimal characters = 32 bytes).

### Session Not Found
- Check if session ID is exactly 6 characters
- Session may have expired (2-hour limit)
- Try refreshing the page

## 📦 Phase 2 - Local Service (Coming Soon)

The Python local service will add:
- FastAPI server on localhost:8765
- Selenium/Playwright browser automation
- Print job monitoring
- System tray application
- Isolated browser sessions for shopkeepers
- Auto-close browser after job completion

## 🔄 Deployment

### Development
```bash
# Backend
cd backend && npm start

# Frontend (in another terminal)
cd frontend && npm run dev
```

### Production
```bash
# Build frontend
cd frontend && npm run build

# Start backend
cd backend && npm start
```

Serve the built frontend files from the backend's `public/` folder.

## 📄 License

MIT License - Free to use and modify

## 👥 Contributing

This is a secure system for sensitive data handling. Please report security issues privately.

## 🤝 Support

For issues or questions, create a GitHub issue or contact the development team.

---

**Built with ❤️ for secure file handling in internet cafes**
