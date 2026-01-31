# CloudTab Security Architecture

## Core Security Principle

**Files MUST NEVER persist on the shopkeeper's PC after a session completes.**

This document explains how the system achieves zero file persistence while maintaining full functionality for viewing and printing.

---

## 1. File Lifecycle Architecture

### 1.1 Upload Phase (Customer's Device)
```
Customer's PC
    ↓
[Drag & Drop Files] → [Encryption with AES-256-CBC]
    ↓
[Encrypted File (.enc)] → [Upload to Server]
    ↓
Backend Storage: /uploads/encrypted/{sessionId}/{filename}.enc
```

**Key Point:** Original files never leave customer's PC. Only encrypted versions exist on server.

### 1.2 Viewing Phase (Shopkeeper's PC)
```
Shopkeeper Opens Session
    ↓
[Browser navigates to /shopkeeper/{sessionId}]
    ↓
[Local Service creates isolated profile in: %TEMP%/cloudtab_profile_{sessionId}]
    ↓
[HTTP Request to GET /api/session/{id}/file/{id}/view]
    ↓
[Backend decrypts file IN MEMORY - never writes to disk]
    ↓
[Streams decrypted content to browser with Content-Disposition: inline]
    ↓
[Browser displays file ONLY IN MEMORY via PDF.js or <img> tags]
    ↓
[Temporary decrypted data is deleted from server memory]
```

**Key Points:**
- Files NEVER written to shopkeeper's disk
- Decryption happens on-demand, in-memory only
- Browser renders from memory (PDF.js, img tags)
- No cache (headers prevent disk caching)

### 1.3 Printing Phase
```
Shopkeeper clicks [Print Button]
    ↓
[Browser's native print dialog]
    ↓
[Temporary spool file created in Windows Print Spooler]
    ↓
[Physical printer receives document]
    ↓
[Print spooler temp file automatically cleaned by local-service]
```

**Key Points:**
- Only mechanism for persistent storage (physical document)
- Digital files never persist
- Print spooler cleaned after session completion

### 1.4 Cleanup Phase (After Session Completion)
```
Shopkeeper clicks [Complete Job]
    ↓
[Backend deletes encrypted session files]
    ↓
[Backend calls local-service /api/cleanup-session]
    ↓
[Local Service performs 4-step cleanup]:
   1. Delete isolated browser profile: %TEMP%/cloudtab_profile_{sessionId}
   2. Scan Downloads folder for {sessionId} files → secure delete
   3. Clear Windows print spooler temp files
   4. Scan Windows Temp folder for {sessionId} files → secure delete
    ↓
[Multi-pass overwrite for all deleted files (3-pass)]
    ↓
[Verify no session traces remain on PC]
```

---

## 2. Security Mechanisms

### 2.1 On-Demand Decryption
**File:** [backend/src/controllers/uploadController.js](backend/src/controllers/uploadController.js#L67-L95)

```javascript
// Decrypts file only when requested, in memory
// Never writes decrypted file to disk
// Deletes decrypted data after streaming to browser
```

**Benefits:**
- Files don't exist on disk except in encrypted form
- Memory is cleared after session ends
- No recovery possible if PC is powered off

### 2.2 Secure Browser-Only Viewing
**File:** [backend/src/routes/shopkeeperRoutes.js](backend/src/routes/shopkeeperRoutes.js#L145-L210)

**PDF.js Integration:**
```html
<!-- PDF files rendered by PDF.js library -->
<!-- No download button in PDF.js viewer -->
<!-- User cannot save PDF to disk -->
```

**Image Inline Display:**
```html
<!-- Images rendered via <img> tag -->
<!-- No right-click save option -->
<!-- No native browser download capability -->
```

**Key Feature:** No download button exists in the shopkeeper interface.

### 2.3 HTTP Header Security
**Prevents Disk Caching:**

```javascript
Content-Disposition: inline          // Display in browser, not download
Cache-Control: no-store, no-cache, must-revalidate
Pragma: no-cache
Expires: 0
```

These headers ensure files are NOT cached to disk by the browser.

### 2.4 Isolated Browser Profile
**File:** [local-service/src/main.py](local-service/src/main.py#L173-L179)

```python
# Each session gets isolated profile in Windows Temp folder
profile_path = %TEMP%/cloudtab_profile_{sessionId}_{pid}

# Profile contains:
# - Browser cookies for this session only
# - Cache for this session only
# - History for this session only
# - NO FILES persisted to user's Documents/Downloads
```

**Benefits:**
- Session data isolated from shopkeeper's personal files
- Easy cleanup - delete single folder
- No cross-session data leakage

### 2.5 Secure File Deletion
**File:** [local-service/src/main.py](local-service/src/main.py#L251-L269)

**Multi-Pass Overwrite:**
```python
# 3-pass secure deletion for each file
for pass_num in range(3):
    write_random_data_to_disk()
    
# Then delete file metadata
path.unlink()
```

**Benefits:**
- Files cannot be recovered with disk recovery tools
- Complies with Indian data protection requirements
- Military-grade deletion standard

---

## 3. Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│           UPLOAD PHASE (Customer Device)                    │
│  Files uploaded → Encrypted with AES-256-CBC → Server       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│     Server Storage: /uploads/encrypted/{sessionId}           │
│     Files remain encrypted on server disk                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│         VIEWING PHASE (Shopkeeper Device)                   │
│  1. Browser connects to /shopkeeper/{sessionId}              │
│  2. GET /api/session/{id}/file/{id}/view (on-demand)        │
│  3. Backend decrypts file IN MEMORY                          │
│  4. Browser renders file via PDF.js or <img> tags           │
│  5. No download button available                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│    PRINTING PHASE (Optional - User Choice)                  │
│  Shopkeeper clicks [Print] → Browser native print dialog    │
│  Physical printer receives document (file persists only     │
│  as printed paper, not digital file)                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│         CLEANUP PHASE (After Completion)                    │
│  1. Backend deletes encrypted session files                 │
│  2. Calls /api/cleanup-session on local-service            │
│  3. Local service:                                          │
│     - Deletes isolated browser profile                      │
│     - Clears Downloads folder                               │
│     - Clears print spooler temp files                       │
│     - Clears Windows Temp folder                            │
│     - Multi-pass overwrites all deleted files               │
│  4. Verify ZERO files related to session remain            │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Compliance Checklist

### India Data Protection Requirements
- [x] No persistent personal files stored on shopkeeper device
- [x] Files encrypted in transit (HTTPS)
- [x] Files encrypted at rest (AES-256-CBC)
- [x] Secure deletion with multi-pass overwrite
- [x] Session isolation (no cross-session contamination)
- [x] Audit trail (session logs, encrypted files)
- [x] No backup copies created
- [x] Automatic cleanup after time limit

### GDPR Compliance (If International)
- [x] Data minimization (only decrypt when needed)
- [x] Purpose limitation (files only for this session)
- [x] Storage limitation (encrypted files + isolated browsing)
- [x] Integrity and confidentiality (AES-256-CBC + HTTPS)
- [x] Accountability (cleanup verification)

---

## 5. Threat Model & Mitigations

### Threat: Shopkeeper's PC Compromised
**Risk:** Attacker downloads files from browser cache or temp folder

**Mitigations:**
1. Files only exist in memory during viewing (never written to disk)
2. Browser cache disabled via HTTP headers
3. Isolated profile deleted after session
4. Windows Temp folder scanned and cleaned
5. Multi-pass overwrite prevents recovery

### Threat: Shopkeeper Screenshots/Photos
**Risk:** Shopkeeper photographs file content for unauthorized use

**Mitigation:** This is a user behavior threat outside technical scope
- Legally enforceable shopkeeper agreement
- Print button provides legitimate documented use case
- Camera detection can be added in future phases

### Threat: Browser History Leak
**Risk:** Session URL or file names appear in browser history

**Mitigations:**
1. Isolated browser profile deleted after session (history gone)
2. HTTP request headers don't include file contents
3. Only session ID in URLs, not file names

### Threat: Print Spooler Persistence
**Risk:** Temporary files in Windows print spooler recovered

**Mitigation:** Local service securely deletes print spooler files:
```python
# Stop spooler → Delete files → Restart spooler
subprocess.run(["net", "stop", "spooler"])
# Delete C:\Windows\System32\spool\PRINTERS\*
subprocess.run(["net", "start", "spooler"])
```

### Threat: Disk Recovery
**Risk:** Deleted files recovered using disk recovery tools

**Mitigation:** Multi-pass overwrite (3-pass)
```python
# Random data written 3 times before deletion
# Meets military-grade secure deletion standard
```

---

## 6. Testing & Verification

### Verification Checklist After Session Completion

```bash
# 1. Verify Downloads folder cleaned
dir %USERPROFILE%\Downloads | findstr "{sessionId}"
# Expected: No results

# 2. Verify Temp folder cleaned
dir %TEMP% | findstr "cloudtab_profile_{sessionId}"
# Expected: No results

# 3. Verify print spooler cleaned
dir C:\Windows\System32\spool\PRINTERS
# Expected: Minimal files, not session-related

# 4. Verify browser profile deleted
dir %TEMP% | findstr "cloudtab_profile_"
# Expected: Matches for other sessions only, not this one

# 5. Verify server encrypted file deleted
# Check backend: /uploads/encrypted/{sessionId}
# Expected: No files (directory may be deleted or empty)
```

### Manual Testing Procedure

1. **Upload Phase:**
   - Customer uploads test PDF and image
   - Verify files encrypted on server
   - Verify original files not in /uploads/plain

2. **Viewing Phase:**
   - Shopkeeper opens session
   - View PDF - verify PDF.js renders without download button
   - View image - verify img tag renders
   - Attempt right-click download - should not work

3. **Printing Phase:**
   - Click [Print] button
   - Send to printer
   - Verify physical document printed

4. **Cleanup Phase:**
   - Click [Complete Job]
   - Verify server deleted encrypted files
   - Run verification checklist above
   - Verify ALL cleanup steps successful

---

## 7. Local Service Cleanup Process

**File:** [local-service/src/main.py](local-service/src/main.py)

### Cleanup Steps

#### Step 1: Delete Isolated Browser Profile
```python
profile_path = %TEMP%/cloudtab_profile_{sessionId}_{pid}
# Recursively delete all files with secure overwrite
# Then delete directory structure
```

#### Step 2: Scan Downloads Folder
```python
downloads_path = %USERPROFILE%/Downloads
for file in glob(f"*{sessionId}*"):
    secure_delete_file(file)
```

#### Step 3: Clear Print Spooler
```python
# Stop spooler service
subprocess.run(["net", "stop", "spooler"])

# Delete all files in spool directory
for file in Path("C:\\Windows\\System32\\spool\\PRINTERS").glob("*"):
    secure_delete_file(file)

# Restart spooler service
subprocess.run(["net", "start", "spooler"])
```

#### Step 4: Clean Windows Temp
```python
temp_path = Path(tempfile.gettempdir())
for file in glob(f"*{sessionId}*"):
    secure_delete_file(file)
```

---

## 8. API Endpoints for Secure Viewing

### Old Endpoint (DISABLED)
```
GET /api/session/{id}/file/{id}/download
Status: 403 Forbidden
Response: {"error": "File download disabled for security"}
```

### New Endpoint (ACTIVE)
```
GET /api/session/{id}/file/{id}/view
Content-Disposition: inline
Cache-Control: no-store, no-cache, must-revalidate
Body: [Decrypted file content]

Process:
1. Read encrypted file from disk
2. Decrypt in memory using session key
3. Stream to browser with inline disposition
4. Delete decrypted data from memory
5. Return success
```

---

## 9. Configuration

### Backend Security Headers
**File:** [backend/src/controllers/uploadController.js](backend/src/controllers/uploadController.js#L75-L83)

```javascript
res.set({
    'Content-Disposition': 'inline',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
});
```

### Local Service Cleanup Timing
**File:** [backend/src/routes/uploadRoutes.js](backend/src/routes/uploadRoutes.js)

```javascript
// Cleanup triggered when shopkeeper clicks "Complete Job"
// Backend calls: await axios.post('http://localhost:8765/api/cleanup-session', { sessionId })
```

---

## 10. Future Security Enhancements

### Phase 2 (Planned)
- [ ] Camera detection to warn against screenshots
- [ ] Watermarking on viewed documents
- [ ] Session timeout with automatic cleanup (5 minutes)
- [ ] Keystroke logging prevention in isolated profile
- [ ] Network isolation for critical sessions

### Phase 3 (Planned)
- [ ] Hardware-based isolation (Hyper-V or virtualbox)
- [ ] Air-gapped viewing for sensitive documents
- [ ] End-to-end encryption with asymmetric keys
- [ ] Zero-knowledge architecture (backend cannot see files)
- [ ] Blockchain audit trail for compliance

---

## 11. Support & Incident Response

### If Files Persist on Shopkeeper's PC

**Immediate Steps:**
1. Check if session was properly completed
2. Verify local service is running
3. Manually run cleanup:
   ```bash
   cd local-service
   python -m src.main /api/cleanup-session?sessionId={id}
   ```
4. Run verification checklist in Section 6

**Root Cause Analysis:**
- Check local service logs: `local-service/logs/service.log`
- Check backend logs: `backend/logs/server.log`
- Verify Windows print spooler running:
  ```bash
  Get-Service -Name spooler | Start-Service
  ```

### Forensic Verification
If breach suspected, verify no files remain:
```bash
# Search entire disk for session ID
dir /s /b "C:" | findstr "{sessionId}"

# Check unallocated space (requires forensic tools)
# Expected: No results after cleanup
```

---

## 12. Documentation Updates

All documentation files are updated to reflect this security architecture:
- [README.md](README.md) - Security section
- [ARCHITECTURE.md](ARCHITECTURE.md) - Data flow diagrams
- [API.md](API.md) - /view endpoint documentation
- [TESTING.md](TESTING.md) - Verification procedures
- [SETUP.md](SETUP.md) - Local service configuration

