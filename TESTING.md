# CloudTab Testing Guide

Comprehensive testing procedures for the CloudTab system with emphasis on security verification.

## Table of Contents
1. [Pre-Testing Checklist](#pre-testing-checklist)
2. [Backend Tests](#backend-tests)
3. [Frontend Tests](#frontend-tests)
4. [Integration Tests](#integration-tests)
5. [Security Verification](#security-verification)
6. [Troubleshooting](#troubleshooting)

---

## Pre-Testing Checklist

### System Requirements
- [ ] Node.js 16+ installed
- [ ] Python 3.8+ installed (for local service)
- [ ] Both services can write to Temp directories
- [ ] Administrator access available (for print spooler cleanup)
- [ ] Ports 5000 (backend), 5173 (frontend), 8765 (local service) available

### Services Running
```bash
# Terminal 1: Backend
cd backend
npm start
# Expected: "✅ Server running on http://localhost:5000"

# Terminal 2: Frontend
cd frontend
npm run dev
# Expected: "✅ Local: http://localhost:5173"

# Terminal 3: Local Service
cd local-service
pip install -r requirements.txt
python -m uvicorn src.main:app --host 127.0.0.1 --port 8765
# Expected: "✅ CloudTab Local Service Started"
```

---

## Backend Tests

### Test 1: Server Startup
```bash
curl http://localhost:5000
# Expected: Welcome message with API endpoints
```

### Test 2: Health Check
```bash
curl http://localhost:5000/health
# Expected: {"status":"healthy","timestamp":"2024-01-..."}
```

### Test 3: File Upload (Single File)
```bash
# Create test file
echo "Test PDF content" > test.txt

# Upload
curl -X POST http://localhost:5000/api/upload \
  -F "files=@test.txt"

# Expected Response:
# {
#   "sessionId": "ABC123",
#   "files": [...],
#   "status": "active",
#   "expiresAt": 1705130656789
# }
```

### Test 4: Get Session Details
```bash
# Using sessionId from previous test
curl http://localhost:5000/api/session/ABC123

# Expected: Session data with files array
```

### Test 5: View File (Browser-Only - NEW SECURITY FEATURE)
```bash
# Get session with files first, then view a file
curl -X GET http://localhost:5000/api/session/{sessionId}/file/{fileId}/view

# Expected: File content streamed with headers:
# Content-Disposition: inline
# Cache-Control: no-store, no-cache, must-revalidate
# Pragma: no-cache
```

### Test 6: Download Endpoint (Should Fail - SECURITY)
```bash
# This endpoint is disabled for security
curl -X GET http://localhost:5000/api/session/{sessionId}/file/{fileId}/download

# Expected: 403 Forbidden
# {
#   "error": "File download disabled for security"
# }
```

### Test 7: Complete Session (Cleanup Trigger)
```bash
curl -X POST http://localhost:5000/api/session/ABC123/complete

# Expected: Session completed, cleanup initiated
```

---

## Frontend Tests

### Test 1: Page Load
- Open `http://localhost:5173` in browser
- Expected: CloudTab upload interface loads

### Test 2: Drag & Drop Upload
1. Open frontend
2. Drag `test.pdf` onto upload area
3. Expected: File appears in list with progress bar
4. Expected: Session ID and QR code displayed after completion

### Test 3: Error Handling
1. Try upload without files selected
2. Expected: "No files selected" error message
3. Try upload with > 50MB file
4. Expected: "File too large" error

---

## Integration Tests

### Test 1: Complete Upload → View → Cleanup Flow

**Step 1: Upload Files**
1. Go to `http://localhost:5000/shopkeeper-login`
2. Enter the 6-digit session ID from Test 1
3. Click "Access Session"

**Expected Results:**
✅ Session page loads
✅ Shows all uploaded files
✅ Displays file count and expiration timer
✅ "Print" button works (opens browser print dialog)
✅ "Download All" button accessible
✅ "Job Complete" button works

**Files Displayed:**
- File icons (📄 for PDF, 🖼️ for images, etc.)
- File names
- File sizes
- Preview capabilities

### Test 3: Session Expiration

**Steps:**
1. Upload files (session expires in 2 hours)
2. Wait for expiration or manually test API

**Expected Results:**
✅ Session automatically removed after 2 hours
✅ Files securely deleted
✅ Accessing expired session shows "Session not found"

### Test 4: API Testing

Use curl or Thunder Client for API testing:

#### 4.1 Upload Files via API
```bash
curl -X POST http://localhost:5000/api/upload \
  -F "files=@test.pdf" \
  -F "files=@image.jpg"
```

**Expected:** Session ID and file metadata returned

#### 4.2 Get Session Details
```bash
curl http://localhost:5000/api/session/ABC123
```

**Expected:** Session data with files list

#### 4.3 Complete Session
```bash
curl -X POST http://localhost:5000/api/session/ABC123/complete
```

**Expected:** Success message and session deleted

#### 4.4 Health Check
```bash
curl http://localhost:5000/api/health
```

**Expected:** 
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Test 5: File Validation

**Test Invalid Files:**

1. **File too large (>50MB)**
   ```bash
   # Create a 55MB file
   # Try to upload
   ```
   Expected: ❌ Error message

2. **Wrong file type**
   ```bash
   # Rename .exe to .pdf
   # Try to upload
   ```
   Expected: ❌ Error message

3. **Invalid extension**
   ```bash
   # Try uploading .zip, .rar, .exe
   ```
   Expected: ❌ File type not allowed

**Valid File Types:**
- ✅ PDF
- ✅ JPG, JPEG, PNG, TIFF
- ✅ DOC, DOCX
- ✅ XLS, XLSX
- ✅ TXT

### Test 6: Security Features

#### 6.1 Encryption
**Verify:**
1. Upload a text file
2. Check the uploaded file in `backend/uploads/{sessionId}/`
3. File should be `.enc` format
4. File contents should be unreadable (encrypted)
5. Raw binary data visible

**Expected:** ✅ Files are encrypted with AES-256

#### 6.2 Session Isolation
**Test:**
1. Upload with session ID "ABC123"
2. Upload with another session (gets "DEF456")
3. Try to access DEF456's files using ABC123's session ID
4. Check API call: `GET /api/session/ABC123`

**Expected:** ✅ Cannot access other sessions' files

#### 6.3 Secure Deletion
**Verify:**
1. Upload files
2. Click "Job Complete"
3. Check `backend/uploads/{sessionId}/` directory
4. Verify directory is deleted

**Expected:** ✅ Files and directories completely removed

### Test 7: Responsive Design

**Test on:**
- Desktop (1920x1080)
- Tablet (768x1024)
- Mobile (375x667)

**Expected:**
✅ UI responsive
✅ All buttons clickable
✅ Files display properly
✅ QR code visible
✅ Forms functional

### Test 8: QR Code

**Test:**
1. On success page, take screenshot of QR code
2. Scan with phone camera or QR reader
3. Should redirect to `/shopkeeper-login?id={sessionId}`

**Expected:** ✅ QR code is scannable and redirects properly

### Test 9: Multiple Files

**Test:**
1. Upload 5-10 files at once
2. Various file types
3. Various file sizes (small, large, mixed)

**Expected:**
✅ All files upload successfully
✅ Progress bar shows correct progress
✅ File list shows all files
✅ No missing or corrupted files

### Test 10: Concurrent Users

**Test:**
1. Upload files from Session A
2. Without completing A, upload files from Session B
3. Access both sessions simultaneously

**Expected:**
✅ Sessions don't interfere
✅ Each session has independent files
✅ Expiration times independent

## Performance Tests

### Load Test - Multiple Uploads
```
- Scenario: 10 simultaneous file uploads
- File size: 10MB each
- Expected: All complete successfully
- Timeout: 5 minutes
```

### Load Test - Session Access
```
- Scenario: 100 concurrent session accesses
- Expected: All respond within 2 seconds
- Error rate: 0%
```

## Cleanup

**To clear test data:**

```bash
# Remove uploaded files
rm -rf backend/uploads/*
rm -rf backend/sessions/*

# Or on Windows:
rmdir /s /q backend\uploads
rmdir /s /q backend\sessions
```

## Troubleshooting Tests

### Files Not Uploading
- Check backend is running on port 5000
- Check network connectivity
- Verify file types are supported
- Check file size limits

### Session Not Found
- Ensure session ID is exactly 6 characters
- Check if session has expired (>2 hours)
- Verify backend is running

### Encryption Not Working
- Check ENCRYPTION_KEY is set in .env
- Verify key is 64 characters (32 bytes in hex)
- Check file permissions in uploads folder

### CORS Errors
- Backend must be on http://localhost:5000
- Frontend must be on http://localhost:5173 or http://127.0.0.1:3000
- Check CORS config in backend

## Test Files

You can create test files:

```bash
# Create test PDF (Linux/Mac)
echo "Test Document" > test.txt
# Convert to PDF using your preferred tool

# Create test image
# Use any image file or download sample

# Create test documents
# Use any DOC, DOCX, XLS, XLSX file
```

## Automated Testing (Future)

Plan for automated tests:
- Unit tests for encryption/decryption
- Integration tests for API endpoints
- End-to-end tests with Cypress/Playwright
- Load testing with k6 or JMeter

## Reporting Issues

When reporting test failures:
1. Screenshot of error
2. Browser console errors
3. Backend logs
4. Exact steps to reproduce
5. Environment details (OS, Node version, etc.)

---

**Good luck testing CloudTab!**
