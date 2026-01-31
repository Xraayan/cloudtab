# Security Verification Checklist - Post-Implementation

Complete this checklist after implementing the security fixes to ensure everything is working correctly.

## ✅ Pre-Implementation Verification

### Code Changes
- [ ] Verified `backend/src/routes/shopkeeperRoutes.js` has NO download button
- [ ] Verified `backend/src/controllers/uploadController.js` has `viewFile()` function
- [ ] Verified `backend/src/routes/uploadRoutes.js` has `/view` route (not `/download`)
- [ ] Verified `local-service/src/main.py` has complete cleanup functions
- [ ] Verified all imports are correct
- [ ] No syntax errors in modified files

### Dependencies
- [ ] Backend: `npm install` completed successfully
- [ ] Frontend: `npm install` completed successfully
- [ ] Local Service: `pip install -r requirements.txt` completed successfully

### Configuration
- [ ] Backend `.env` file has valid `ENCRYPTION_KEY`
- [ ] Local service has write permissions to `%TEMP%` directory
- [ ] Administrator access available for print spooler access

---

## ✅ Service Startup Verification

### Backend Service
```bash
cd backend
npm start
```

- [ ] Server starts without errors
- [ ] "✅ Server running on http://localhost:5000" message appears
- [ ] Health check works: `curl http://localhost:5000/health`

### Frontend Service
```bash
cd frontend
npm run dev
```

- [ ] Vite starts successfully
- [ ] "✅ Local: http://localhost:5173" message appears
- [ ] Page loads without errors

### Local Service
```bash
cd local-service
python -m uvicorn src.main:app --host 127.0.0.1 --port 8765
```

- [ ] Service starts without errors
- [ ] "✅ CloudTab Local Service Started" message appears
- [ ] `/api/status` endpoint responds

---

## ✅ Functional Testing

### Upload Workflow
- [ ] Can upload single file from frontend
- [ ] Can upload multiple files
- [ ] File size validation works (reject > 50MB)
- [ ] File type validation works
- [ ] Session ID generated correctly (6 alphanumeric)
- [ ] QR code generated and functional

### Shopkeeper Session Access
- [ ] Can access session via direct URL: `/shopkeeper/{sessionId}`
- [ ] Can see list of uploaded files
- [ ] File names, sizes, and types displayed correctly

### File Viewing (NEW - CRITICAL)
- [ ] Can view PDF files using PDF.js viewer
  - [ ] PDF.js viewer has NO download button
  - [ ] Can navigate pages (Prev/Next buttons work)
  - [ ] Can zoom in/out
- [ ] Can view images using `<img>` tag
  - [ ] Image displays inline in browser
  - [ ] Cannot right-click and "Save As"
- [ ] HTTP headers correct:
  - [ ] `Content-Disposition: inline` (not attachment)
  - [ ] `Cache-Control: no-store, no-cache, must-revalidate`
  - [ ] `Pragma: no-cache`

### Download Button (Should Be GONE)
- [ ] No download button visible in shopkeeper interface ❌
- [ ] Try navigating directly: GET `/api/session/{id}/file/{id}/download`
  - [ ] Returns 403 Forbidden error
  - [ ] Error message indicates download is disabled

### Print Functionality
- [ ] Print button visible and working
- [ ] Browser print dialog opens
- [ ] Can print to physical printer
- [ ] Can print to PDF

### Session Completion
- [ ] "Complete Job" button works
- [ ] Session marked as completed
- [ ] Backend deletes encrypted files
- [ ] Backend calls local service cleanup API

---

## ✅ Security - Cleanup Verification (CRITICAL)

**Run after EVERY session completion to verify zero file persistence**

### Check 1: Downloads Folder Clean
```powershell
Get-ChildItem $env:USERPROFILE\Downloads | Where-Object { $_.Name -like "*ABC123*" }
```

- [ ] **ZERO results** (no session files in Downloads)
- [ ] Folder is clean

### Check 2: Temp Folder Clean
```powershell
Get-ChildItem $env:TEMP | Where-Object { $_.Name -like "cloudtab_profile_ABC123*" }
```

- [ ] **ZERO results** (browser profile deleted)
- [ ] Session ID not found in any temp files

### Check 3: Browser Profile Deleted
```powershell
Get-ChildItem $env:TEMP | Where-Object { $_.Name -like "*ABC123*" }
```

- [ ] **ZERO results** (all session-related files deleted)

### Check 4: Print Spooler Cleaned
```powershell
Get-ChildItem "C:\Windows\System32\spool\PRINTERS"
```

- [ ] Minimal files present
- [ ] No session-related temporary files

### Check 5: Server Encrypted Files Deleted
```bash
# Check backend directory
ls backend/uploads/encrypted/ABC123/
```

- [ ] Directory empty or doesn't exist
- [ ] Encrypted files deleted

### Check 6: Session File Deleted
```bash
# Check backend directory
ls backend/sessions/ | grep ABC123
```

- [ ] Session file not found
- [ ] Session deleted from server

---

## ✅ Integration Testing

### Complete Flow Test (Must Pass)

1. **Upload Phase**
   - [ ] Navigate to `http://localhost:5173`
   - [ ] Upload test.pdf and test.jpg
   - [ ] Get session ID: ABC123
   - [ ] Session created successfully

2. **Viewing Phase**
   - [ ] Navigate to `http://localhost:5000/shopkeeper/ABC123`
   - [ ] See file list (test.pdf, test.jpg)
   - [ ] Click "View" on test.pdf
     - [ ] PDF.js viewer opens
     - [ ] Can navigate pages
   - [ ] Click "View" on test.jpg
     - [ ] Image displays inline
     - [ ] Can zoom

3. **Printing Phase**
   - [ ] Click [Print] button on PDF
   - [ ] Browser print dialog opens
   - [ ] Select printer or "Print to PDF"
   - [ ] Click Print
   - [ ] Document prints/saves successfully

4. **Completion Phase**
   - [ ] Click [Complete Job]
   - [ ] Confirmation dialog appears
   - [ ] Click confirm
   - [ ] Session completed message

5. **Cleanup Verification** ⚠️ CRITICAL
   - [ ] Check 1: Downloads folder - NO files
   - [ ] Check 2: Temp folder - NO profile
   - [ ] Check 3: Print spooler - cleaned
   - [ ] Check 4: Server encrypted files - deleted
   - [ ] Check 5: Session file - deleted

---

## ✅ Stress Testing

### Multiple Concurrent Sessions
```bash
# Create 3 sessions simultaneously
curl -X POST http://localhost:5000/api/upload -F "files=@test1.txt"  # Session 1
curl -X POST http://localhost:5000/api/upload -F "files=@test2.txt"  # Session 2
curl -X POST http://localhost:5000/api/upload -F "files=@test3.txt"  # Session 3
```

- [ ] All 3 sessions created successfully
- [ ] Each has unique session ID
- [ ] Can view files in each session independently
- [ ] Cleanup of Session 1 doesn't affect Sessions 2 & 3

### Rapid File Views (100 Requests)
```bash
for i in {1..100}; do
  curl "http://localhost:5000/api/session/ABC123/file/{fileId}/view" > /dev/null
done
```

- [ ] All 100 requests succeed
- [ ] No errors in backend logs
- [ ] No memory leaks

### Large File Upload (40MB)
```bash
dd if=/dev/urandom of=large.bin bs=1M count=40
curl -X POST http://localhost:5000/api/upload -F "files=@large.bin"
```

- [ ] File uploads successfully
- [ ] File encrypts correctly
- [ ] Can view without issues
- [ ] Cleanup works properly

---

## ✅ Security Headers Verification

### Using curl
```bash
SESSION_ID="ABC123"
FILE_ID="file-id-here"

curl -I http://localhost:5000/api/session/$SESSION_ID/file/$FILE_ID/view
```

Verify response headers:
- [ ] `Content-Disposition: inline`
- [ ] `Cache-Control: no-store, no-cache, must-revalidate`
- [ ] `Pragma: no-cache`
- [ ] `Expires: 0`

### Using Browser DevTools
1. Open DevTools (F12)
2. Open Network tab
3. View a file
4. Click on request in Network tab
5. Check Response Headers section
   - [ ] All 4 headers present and correct

---

## ✅ Local Service Verification

### API Status Check
```bash
curl http://localhost:8765/api/status
```

Expected response:
```json
{
  "status": "operational",
  "version": "1.0.0",
  "browser_available": true,
  "port": 8765
}
```

- [ ] Status returns operational

### Cleanup API Test
```bash
curl -X POST http://localhost:8765/api/cleanup-session \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"ABC123"}'
```

Expected response:
```json
{
  "success": true,
  "message": "Session cleaned up successfully",
  "actions": [...]
}
```

- [ ] Cleanup API returns success
- [ ] All actions listed in response

### Logs Check
```bash
# Check if logs directory exists
ls local-service/logs/

# View logs
cat local-service/logs/service.log | tail -50
```

- [ ] Logs show cleanup activities
- [ ] No errors in logs
- [ ] Timestamps match session completion time

---

## ✅ Documentation Verification

### Files Created/Updated
- [ ] `SECURITY_ARCHITECTURE.md` exists and is comprehensive
- [ ] `SECURITY_FIX_SUMMARY.md` created with implementation details
- [ ] `SHOPKEEPER_GUIDE.md` created with user instructions
- [ ] `README.md` updated with security section
- [ ] `TESTING.md` updated with verification procedures

### Documentation Quality
- [ ] All file paths correct and up-to-date
- [ ] All code examples syntactically correct
- [ ] All instructions clear and testable
- [ ] Includes troubleshooting section

---

## ✅ Error Handling

### Test Error Scenarios

**Invalid Session ID**
```bash
curl http://localhost:5000/api/session/INVALID/file/123/view
```
- [ ] Returns appropriate error (404 or similar)
- [ ] No server crash

**Invalid File ID**
```bash
curl http://localhost:5000/api/session/ABC123/file/INVALID/view
```
- [ ] Returns appropriate error
- [ ] No server crash

**Expired Session**
- [ ] Create session, wait 2 hours (or modify timeout to 5 minutes)
- [ ] Try to access
- [ ] Returns 410 Gone or similar
- [ ] No error in logs

**Download Attempt**
```bash
curl http://localhost:5000/api/session/ABC123/file/123/download
```
- [ ] Returns 403 Forbidden
- [ ] Error message explains why download is disabled
- [ ] No file served

---

## ✅ Performance Metrics

### Measure and Document
- [ ] File upload speed: ___ MB/s
- [ ] File view response time: ___ ms
- [ ] Cleanup time per session: ___ seconds
- [ ] Server memory usage peak: ___ MB
- [ ] CPU usage during stress test: ___ %

### Expected Ranges
- Upload speed: > 1 MB/s
- View response: < 500 ms
- Cleanup time: < 10 seconds
- Memory peak: < 500 MB
- CPU usage: < 30%

---

## ✅ Browser Compatibility

### Test on Multiple Browsers
- [ ] Chrome/Edge (PDF.js test)
- [ ] Firefox (PDF.js test)
- [ ] Safari (if available)

For each browser:
- [ ] PDF.js viewer works
- [ ] Image display works
- [ ] Print functionality works
- [ ] No console errors

---

## ✅ Final Sign-Off

### All Checks Complete?
- [ ] All 80+ checkboxes above checked
- [ ] No failures or warnings
- [ ] Zero files persist after session cleanup
- [ ] All documentation updated
- [ ] All team members trained

### Security Certification
- [ ] **SIGNED OFF:** This implementation provides zero file persistence
- [ ] **VERIFIED:** No files remain on shopkeeper PC after job completion
- [ ] **COMPLIANT:** Meets Indian data protection requirements

---

## Issues Found During Verification

List any issues found:

1. **Issue:** [Describe]
   - **Fix:** [Applied fix or status]
   - **Verification:** [How verified it's fixed]

2. [Continue as needed]

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Developer | [Name] | [Date] | ✓ |
| QA/Tester | [Name] | [Date] | ✓ |
| Security | [Name] | [Date] | ✓ |
| Product | [Name] | [Date] | ✓ |

---

## Deployment Approval

- [ ] All checklist items verified
- [ ] Issues documented and resolved
- [ ] Team sign-off complete
- [ ] **APPROVED FOR PRODUCTION DEPLOYMENT**

Deployment Date: _______________

---

**Note:** This checklist must be completed before any production deployment. Keep a copy for audit and compliance records.

