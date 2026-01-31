# CloudTab - Getting Started Checklist

Complete this checklist to get CloudTab running on your system.

## ✅ Pre-Installation Checklist

### System Requirements
- [ ] You have Node.js 16+ installed ([Check here](https://nodejs.org/))
- [ ] You have at least 2GB RAM available
- [ ] You have at least 1GB disk space free
- [ ] You have a modern web browser (Chrome, Firefox, Edge, Safari)
- [ ] You're on Windows, macOS, or Linux

**Verify installation:**
```bash
node --version  # Should show v16.0.0 or higher
npm --version   # Should show 7.0.0 or higher
```

### Network
- [ ] You have internet access (for npm packages)
- [ ] Ports 5000 and 5173 are not in use
- [ ] Firewall allows localhost connections

---

## 📦 Installation Checklist

### Step 1: Navigate to Project
```bash
cd c:\Users\adith\Desktop\cloudtab
```
- [ ] You're in the cloudtab directory
- [ ] You see folders: frontend/, backend/, local-service/

### Step 2: Run Setup
**Windows:**
```bash
setup.bat
```
- [ ] Script runs without errors
- [ ] Shows "Setup Complete!"
- [ ] Backend packages installed
- [ ] Frontend packages installed
- [ ] Encryption key generated

**macOS/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```
- [ ] Script runs without errors
- [ ] Shows "Setup Complete!"
- [ ] Backend packages installed
- [ ] Frontend packages installed
- [ ] Encryption key generated

---

## 🚀 Starting Services Checklist

### Option A: Automatic Start

**Windows:**
```bash
start.bat
```

**macOS/Linux:**
```bash
chmod +x start.sh
./start.sh
```

- [ ] Two new terminal windows/tabs open
- [ ] Backend output shows "✅ CloudTab Backend running on http://localhost:5000"
- [ ] Frontend output shows "✓ ready in XXXms"
- [ ] No error messages in either terminal

### Option B: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```
- [ ] Output shows "✅ CloudTab Backend running on http://localhost:5000"
- [ ] Shows "📤 Upload endpoint: POST http://localhost:5000/api/upload"
- [ ] Shows "🏪 Shopkeeper login: http://localhost:5000/shopkeeper-login"

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
- [ ] Output shows "✓ ready in XXXms"
- [ ] Shows "Local: http://localhost:5173"
- [ ] No build errors

---

## 🌐 Browser Access Checklist

### Test Connectivity

**API Health Check:**
- [ ] Open http://localhost:5000/api/health in browser
- [ ] See JSON response: `{"status":"ok","timestamp":"..."}`

**Home Page:**
- [ ] Open http://localhost:5000/ in browser
- [ ] See CloudTab home page with buttons
- [ ] See "Upload Files" button
- [ ] See "Shopkeeper Login" button

**Frontend (Customer Portal):**
- [ ] Open http://localhost:5173 in browser
- [ ] See "Upload Files" page
- [ ] See drag-and-drop zone
- [ ] See feature cards

**Shopkeeper Login:**
- [ ] Open http://localhost:5000/shopkeeper-login in browser
- [ ] See login form with session ID input
- [ ] See input field labeled "Session ID"

---

## 🧪 Basic Testing Checklist

### Test 1: Upload Files

**Customer Side:**
- [ ] Open http://localhost:5173
- [ ] Click "Upload Files" or drag onto drop zone
- [ ] Select a test file (PDF, JPG, or any supported type)
- [ ] Click "🚀 Upload Files"
- [ ] Wait for upload to complete

**Success Screen:**
- [ ] See "✅ Upload Successful!" message
- [ ] See session ID displayed (6 characters like "ABC123")
- [ ] See QR code on screen
- [ ] See file listed with name and size
- [ ] See "120 minutes" expiration time
- [ ] See print button

**Session ID:**
- [ ] Copy the 6-digit session ID
- [ ] Note it down for next test

### Test 2: Shopkeeper Access

**Login:**
- [ ] Go to http://localhost:5000/shopkeeper-login
- [ ] Enter the session ID from Test 1
- [ ] Click "Access Session"

**Session Page:**
- [ ] See session details (ID, file count, expiration)
- [ ] See uploaded file(s) displayed
- [ ] See file names match what you uploaded
- [ ] See 3 buttons: 🖨️ Print, ⬇️ Download, ✓ Complete

### Test 3: Complete Job

**Job Completion:**
- [ ] Click "✓ Job Complete" button
- [ ] Confirm in popup dialog
- [ ] See "Session completed" message
- [ ] Redirected to home page

**Verify Deletion:**
- [ ] Try accessing the same session again
- [ ] Go to http://localhost:5000/shopkeeper-login
- [ ] Enter the same session ID
- [ ] Should see "Session not found or expired"
- [ ] Files successfully deleted

---

## 🔐 Security Verification Checklist

### Encryption Verification

**Check Backend:**
- [ ] Open `backend/uploads/` folder
- [ ] See encrypted files with `.enc` extension
- [ ] Files show encrypted binary data (not readable)
- [ ] Original text/image not visible

**Check Session:**
- [ ] Open `backend/sessions/` folder
- [ ] See session JSON files
- [ ] Session contains file metadata
- [ ] Session contains encryption key reference

### Session Isolation

**Test Multiple Sessions:**
- [ ] Upload files for Session A (get ID "ABC123")
- [ ] Upload files for Session B (get ID "XYZ789")
- [ ] Access Session A - should show only A's files
- [ ] Access Session B - should show only B's files
- [ ] Sessions don't interfere with each other

### File Validation

**Test Invalid Files:**
- [ ] Try uploading a .zip file - ❌ Should be rejected
- [ ] Try uploading a .exe file - ❌ Should be rejected
- [ ] Try uploading a 100MB file - ❌ Should be rejected
- [ ] Upload a PDF - ✅ Should succeed

---

## 📊 Performance Checklist

### Response Times
- [ ] Upload completes in <2 minutes (for 50MB)
- [ ] Session page loads in <1 second
- [ ] API endpoints respond in <100ms

### Browser Performance
- [ ] No console errors (F12 to check)
- [ ] No network errors in Network tab
- [ ] UI is responsive (no freezing)
- [ ] Drag-and-drop works smoothly

### Memory Usage
- [ ] Backend process uses <200MB RAM
- [ ] Frontend process uses <100MB RAM
- [ ] No memory leaks after 1 hour of use

---

## 🎯 Feature Checklist

### Upload Features
- [ ] Drag-and-drop upload works
- [ ] Browse button works
- [ ] Multiple file selection works
- [ ] Progress bar shows percentage
- [ ] File list shows selected files
- [ ] Remove button deletes from list
- [ ] Error messages are clear

### Session Features
- [ ] Session ID is 6 characters
- [ ] Session ID is unique each time
- [ ] QR code is generated and scannable
- [ ] Session expiration time shown (120 min)
- [ ] Session data persists across page reload

### Shopkeeper Features
- [ ] Session lookup works with ID
- [ ] Files display correctly
- [ ] File icons match type (PDF, image, etc.)
- [ ] File sizes shown in KB/MB
- [ ] Print button opens print dialog
- [ ] Download button accessible
- [ ] Job Complete triggers deletion
- [ ] Expiration timer updates

### Security Features
- [ ] Files are encrypted (binary .enc files)
- [ ] Files deleted after job completion
- [ ] Sessions expire after 2 hours
- [ ] Invalid session IDs show error
- [ ] Path traversal prevented
- [ ] File type validation works

---

## 📱 Responsive Design Checklist

### Desktop (1920x1080)
- [ ] All elements visible
- [ ] Buttons clickable
- [ ] Text readable
- [ ] Layout proper spacing

### Tablet (768x1024)
- [ ] Content scales properly
- [ ] No horizontal scroll needed
- [ ] Buttons easily tappable
- [ ] Layout adapts to width

### Mobile (375x667)
- [ ] Single column layout
- [ ] All content visible
- [ ] Buttons are large enough
- [ ] No layout issues

---

## 🆘 Troubleshooting Checklist

### If Backend Won't Start
- [ ] Check Node.js installed: `node --version`
- [ ] Check dependencies: `npm list` in backend folder
- [ ] Check port 5000 free: `lsof -i :5000` (Mac) or Task Manager (Win)
- [ ] Kill process on 5000: `kill -9 <PID>`
- [ ] Try `npm install` again
- [ ] Check .env file exists

### If Frontend Won't Start
- [ ] Check Node.js installed
- [ ] Check dependencies installed
- [ ] Check port 5173 free
- [ ] Clear npm cache: `npm cache clean --force`
- [ ] Delete node_modules: `rm -rf node_modules`
- [ ] Reinstall: `npm install`

### If Upload Fails
- [ ] Check file size <50MB
- [ ] Check file type supported
- [ ] Check backend is running
- [ ] Check browser console for errors (F12)
- [ ] Check network in DevTools
- [ ] Try different file type
- [ ] Clear browser cache

### If Session Not Found
- [ ] Check session ID is exactly 6 characters
- [ ] Check ID is alphanumeric (0-9, A-Z)
- [ ] Check session not older than 2 hours
- [ ] Check spelling of session ID
- [ ] Check backend is running

---

## 📋 Final Verification

### All Systems Go ✅
- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] Upload works (Test 1 passed)
- [ ] Shopkeeper access works (Test 2 passed)
- [ ] File deletion works (Test 3 passed)
- [ ] No errors in console
- [ ] No errors in terminal
- [ ] Security verified
- [ ] Responsive design working

### You're Ready! 🎉
If all boxes are checked, CloudTab is fully operational.

---

## 🚀 Next Steps

### Try Advanced Features
- [ ] Test with multiple files
- [ ] Test with different file types
- [ ] Test concurrent uploads
- [ ] Test on different browsers
- [ ] Test on mobile device (via network)

### Customize
- [ ] Change colors in `frontend/src/App.css`
- [ ] Modify timeout in `backend/.env`
- [ ] Update file size limit
- [ ] Add your branding/logo

### Deploy
- [ ] Review [README.md](./README.md) for deployment
- [ ] Set up HTTPS/SSL
- [ ] Configure for production
- [ ] Deploy to cloud (AWS, Azure, etc.)

### Extend
- [ ] Review [IMPLEMENTATION.md](./IMPLEMENTATION.md)
- [ ] Plan Phase 2 (local service)
- [ ] Start browser automation
- [ ] Add authentication

---

## 📞 Getting Help

If something doesn't work:

1. **Check Documentation:**
   - [QUICKSTART.md](./QUICKSTART.md) - Quick start
   - [README.md](./README.md) - Full guide
   - [TESTING.md](./TESTING.md) - Testing guide
   - [API.md](./API.md) - API reference

2. **Check Logs:**
   - Backend terminal output
   - Browser console (F12)
   - Network tab in DevTools

3. **Check Troubleshooting:**
   - See [QUICKSTART.md](./QUICKSTART.md) troubleshooting section
   - Check if ports are in use
   - Check if dependencies installed

4. **Ask for Help:**
   - Create GitHub issue with:
     - Error message
     - Steps to reproduce
     - Environment (OS, Node version, etc.)
   - Include screenshots if helpful

---

## ✅ Completion

When all checks are done:
- Print this checklist
- Check off completed items
- Keep for reference
- Share with team members

You've successfully set up CloudTab! 🎉

**Congratulations!** Your secure file handling system is now running and tested.

---

**Checklist Date:** January 31, 2024
**CloudTab Version:** 1.0.0
**Status:** Ready for Use ✅
