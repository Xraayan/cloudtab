# CloudTab API Documentation

Complete API reference for CloudTab backend.

## Base URL

```
http://localhost:5000
```

## Authentication

Currently no authentication required (development). For production, implement JWT or similar.

---

## Endpoints

### 1. Upload Files

**Endpoint:** `POST /api/upload`

**Purpose:** Upload files and create a new session

**Request:**
```
Content-Type: multipart/form-data

Parameter: files (array)
- Multiple files can be uploaded
- Max 50MB per file
- Supported types: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX, TXT, TIFF
```

**Example with curl:**
```bash
curl -X POST http://localhost:5000/api/upload \
  -F "files=@document.pdf" \
  -F "files=@image.jpg" \
  -F "files=@spreadsheet.xlsx"
```

**Response (200 OK):**
```json
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
    },
    {
      "id": "1705123457_xyz789abc",
      "name": "image.jpg",
      "size": 1048576,
      "type": "image/jpeg",
      "category": "image",
      "uploadedAt": 1705123457000
    }
  ],
  "expiresAt": 1705130656789,
  "status": "active"
}
```

**Error Responses:**

400 Bad Request:
```json
{
  "error": "Invalid file: document.exe",
  "details": ["File type application/x-msdownload is not allowed"]
}
```

400 Bad Request (No files):
```json
{
  "error": "No files provided"
}
```

413 Payload Too Large:
```json
{
  "error": "File too large. Maximum size is 50MB"
}
```

---

### 2. Get Session

**Endpoint:** `GET /api/session/:sessionId`

**Purpose:** Retrieve session data and file list

**Parameters:**
- `sessionId` (string, required): 6-character session ID (e.g., ABC123)

**Example:**
```bash
curl http://localhost:5000/api/session/ABC123
```

**Response (200 OK):**
```json
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
  "status": "active",
  "expiresAt": 1705130656789,
  "createdAt": 1705123456789
}
```

**Error Responses:**

404 Not Found:
```json
{
  "error": "Session not found or expired"
}
```

400 Bad Request (Invalid ID format):
```json
{
  "error": "Invalid session ID format"
}
```

---

### 3. Complete Session

**Endpoint:** `POST /api/session/:sessionId/complete`

**Purpose:** Mark session complete and securely delete all files

**Parameters:**
- `sessionId` (string, required): 6-character session ID

**Example:**
```bash
curl -X POST http://localhost:5000/api/session/ABC123/complete
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Session completed and all files deleted"
}
```

**Error Responses:**

404 Not Found:
```json
{
  "error": "Session not found"
}
```

500 Internal Server Error:
```json
{
  "error": "Failed to complete session",
  "message": "Details of the error"
}
```

---

### 4. Download File

**Endpoint:** `GET /api/session/:sessionId/file/:fileId`

**Purpose:** Get file metadata for preview/download

**Parameters:**
- `sessionId` (string, required): 6-character session ID
- `fileId` (string, required): File ID from session

**Example:**
```bash
curl http://localhost:5000/api/session/ABC123/file/1705123456_abc123def
```

**Response (200 OK):**
```json
{
  "file": {
    "id": "1705123456_abc123def",
    "name": "document.pdf",
    "size": 2097152,
    "type": "application/pdf",
    "category": "pdf",
    "uploadedAt": 1705123456789
  },
  "message": "File decryption would happen server-side"
}
```

**Error Responses:**

404 Not Found (Session):
```json
{
  "error": "Session not found"
}
```

404 Not Found (File):
```json
{
  "error": "File not found in session"
}
```

---

### 5. Health Check

**Endpoint:** `GET /api/health`

**Purpose:** Check API server status

**Example:**
```bash
curl http://localhost:5000/api/health
```

**Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### 6. Shopkeeper Interface (HTML Page)

**Endpoint:** `GET /shopkeeper/:sessionId`

**Purpose:** Render shopkeeper interface to view and manage files

**Example:**
```
http://localhost:5000/shopkeeper/ABC123
```

**Returns:** HTML page with:
- Session ID display
- File list with previews
- Print button
- Download button
- Job completion button

---

### 7. Shopkeeper Login

**Endpoint:** `GET /shopkeeper-login`

**Purpose:** Login page for shopkeepers to enter session ID

**Example:**
```
http://localhost:5000/shopkeeper-login
```

**Returns:** HTML form to enter 6-digit session ID

---

## Data Models

### Session Object
```json
{
  "sessionId": "ABC123",          // 6-character session ID
  "files": [                      // Array of file objects
    {
      "id": "timestamp_uuid",     // Unique file ID
      "name": "document.pdf",     // Original filename
      "size": 2097152,            // File size in bytes
      "type": "application/pdf",  // MIME type
      "category": "pdf",          // File category
      "uploadedAt": 1705123456789 // Upload timestamp
    }
  ],
  "createdAt": 1705123456789,     // Session creation timestamp
  "expiresAt": 1705130656789,     // Expiration timestamp
  "status": "active",             // "active" or "completed"
  "encryptionKey": "hex-string"   // Encryption key (server-side only)
}
```

### File Categories
- `pdf` - PDF documents
- `image` - Images (JPG, PNG, TIFF)
- `document` - Word documents (DOC, DOCX)
- `spreadsheet` - Excel files (XLS, XLSX)
- `file` - Other files

### Error Response Object
```json
{
  "error": "Error message",           // Error description
  "message": "Detailed message",      // Optional detailed message
  "details": ["detail1", "detail2"]   // Optional array of details
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 400 | Bad Request - Invalid input |
| 404 | Not Found - Resource not found |
| 413 | Payload Too Large - File exceeds size limit |
| 500 | Internal Server Error - Server error |

---

## Request/Response Examples

### Example 1: Complete Upload Flow

**Step 1: Upload Files**
```bash
curl -X POST http://localhost:5000/api/upload \
  -F "files=@invoice.pdf" \
  -F "files=@receipt.jpg"
```

Response:
```json
{
  "sessionId": "XYZ789",
  "files": [
    {"id": "1_abc", "name": "invoice.pdf", "size": 1048576, "type": "application/pdf"},
    {"id": "2_def", "name": "receipt.jpg", "size": 512000, "type": "image/jpeg"}
  ],
  "expiresAt": 1705130656789,
  "status": "active"
}
```

**Step 2: Get Session**
```bash
curl http://localhost:5000/api/session/XYZ789
```

Response:
```json
{
  "sessionId": "XYZ789",
  "files": [...],
  "status": "active",
  "expiresAt": 1705130656789,
  "createdAt": 1705123456789
}
```

**Step 3: Complete Session**
```bash
curl -X POST http://localhost:5000/api/session/XYZ789/complete
```

Response:
```json
{
  "success": true,
  "message": "Session completed and all files deleted"
}
```

---

## Rate Limiting

Currently not implemented. For production, add:
- Max 10 uploads per minute per IP
- Max 100 concurrent sessions
- Max 1000 requests per hour per IP

---

## CORS Policy

**Allowed Origins:**
- http://localhost:3000
- http://localhost:5173
- http://127.0.0.1:3000
- http://127.0.0.1:5173

**Allowed Methods:** GET, POST, OPTIONS

**Allowed Headers:** Content-Type, Authorization

---

## File Storage

Files are stored encrypted in:
```
backend/uploads/{sessionId}/{fileId}.enc
```

Session metadata stored in:
```
backend/sessions/{sessionId}.json
```

---

## Encryption

**Algorithm:** AES-256-CBC
**Key Size:** 256-bit (32 bytes)
**IV:** Randomly generated per file
**Storage:** Files encrypted at rest

---

## Session Timeout

- **Default:** 2 hours (7200000 ms)
- **Cleanup:** Every 30 minutes
- **Auto-deletion:** Expired sessions and files removed

---

## Testing with Thunder Client

1. Create a new request:
   - Method: POST
   - URL: http://localhost:5000/api/upload
   - Body: form-data
   - Add file field and select file(s)
   - Send

2. Get session:
   - Method: GET
   - URL: http://localhost:5000/api/session/ABC123
   - Send

3. Complete session:
   - Method: POST
   - URL: http://localhost:5000/api/session/ABC123/complete
   - Send

---

## Webhooks (Future)

Plan to implement webhooks for:
- Session created
- Session expired
- Files uploaded
- Session completed

---

## API Versioning

Current version: `v1` (implied in endpoints)

Future versions: `/api/v2/upload`, etc.

---

## Support

For API issues:
1. Check [TESTING.md](./TESTING.md) for test examples
2. Check server logs in backend terminal
3. Enable debug logging if needed
4. Create GitHub issue with details

---

**Last Updated:** January 2024
**Version:** 1.0.0
