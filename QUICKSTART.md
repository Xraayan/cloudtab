# CloudTab Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Prerequisites Check

Ensure you have:
- **Node.js 16+** - Download from https://nodejs.org/
- **Windows, macOS, or Linux** - Should work on any OS
- **2GB RAM minimum** - For development

Verify installation:
```bash
node --version
npm --version
```

### Step 2: Setup (2 minutes)

**On Windows:**
```bash
cd cloudtab
setup.bat
```

**On macOS/Linux:**
```bash
cd cloudtab
chmod +x setup.sh
./setup.sh
```

This installs all dependencies for frontend and backend.

### Step 3: Start Services (1 minute)

**Option A: Automatic (Recommended)**

Windows:
```bash
start.bat
```

macOS/Linux:
```bash
chmod +x start.sh
./start.sh
```

**Option B: Manual Start**

Terminal 1 (Backend):
```bash
cd backend
npm start
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

### Step 4: Open in Browser

Once both services start, open:
- **Customer Upload**: http://localhost:5173
- **Shopkeeper Login**: http://localhost:5000/shopkeeper-login
- **API Status**: http://localhost:5000/api/health

### Step 5: Test Upload Flow

1. **Customer Side:**
   - Go to http://localhost:5173
   - Click "📤 Upload Files" 
   - Drag & drop or select files (PDF, JPG, PNG, DOC, etc.)
   - Click "🚀 Upload Files"

2. **Get Session ID:**
   - Copy the 6-digit Session ID shown
   - Or scan the QR code

3. **Shopkeeper Side:**
   - Go to http://localhost:5000/shopkeeper-login
   - Enter the 6-digit Session ID
   - Click "Access Session"
   - View and print files
   - Click "✓ Job Complete" when done

### ✅ Success!

When you see:
- ✅ Files upload successfully
- ✅ Session ID displayed
- ✅ QR code generated
- ✅ Shopkeeper can access files
- ✅ Print button works

...you're all set! 🎉

---

## 📚 Next Steps

### Configuration

Edit environment variables:

**Backend** - `backend/.env`:
```env
PORT=5000
NODE_ENV=development
SESSION_TIMEOUT=7200000
MAX_FILE_SIZE=52428800
ENCRYPTION_KEY=your-256-bit-key-here
```

**Frontend** - Already configured to connect to `http://localhost:5000`

### Testing

Check [TESTING.md](./TESTING.md) for:
- Comprehensive test scenarios
- API testing with curl
- File validation tests
- Security verification
- Performance tests

### Customization

**Change Session Timeout:**
```javascript
// backend/.env
SESSION_TIMEOUT=3600000  // 1 hour instead of 2
```

**Change Max File Size:**
```javascript
// backend/.env
MAX_FILE_SIZE=104857600  // 100MB instead of 50MB
```

**Customize Styling:**
```javascript
// frontend/src/App.css
// Edit colors, fonts, spacing, etc.
```

---

## 🆘 Troubleshooting

### "Port 5000 already in use"
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

### "Module not found"
```bash
# Reinstall dependencies
cd backend && rm -rf node_modules package-lock.json && npm install
cd ../frontend && rm -rf node_modules package-lock.json && npm install
```

### "CORS error in console"
- Make sure backend is on `http://localhost:5000`
- Make sure frontend is on `http://localhost:5173`
- Check `backend/src/server.js` CORS configuration

### "Files not encrypting"
- Check `backend/.env` has ENCRYPTION_KEY set
- Key must be exactly 64 hexadecimal characters
- Generate one: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### "Session not found"
- Check session ID is exactly 6 characters (uppercase)
- Session expires after 2 hours
- Backend must be running

---

## 📁 Project Structure Quick Reference

```
cloudtab/
├── frontend/              # React upload portal (port 5173)
│   └── src/App.jsx       # Main React component
├── backend/              # Node.js API server (port 5000)
│   ├── src/server.js     # Express server
│   └── uploads/          # Encrypted files (auto-created)
├── local-service/        # Python service (Phase 2)
├── README.md             # Full documentation
├── TESTING.md            # Testing guide
├── setup.bat/setup.sh    # Setup script
├── start.bat/start.sh    # Quick start script
└── QUICKSTART.md         # This file
```

---

## 🔐 Security Note

This is a **working prototype** with these security features:

✅ **AES-256 Encryption** - All files encrypted at rest
✅ **Secure Deletion** - Files overwritten before deletion  
✅ **Session Isolation** - Each session independent
✅ **File Validation** - Type and size checking
✅ **Auto-Expiration** - Sessions expire after 2 hours

For production use, also add:
- [ ] HTTPS/SSL certificates
- [ ] Authentication/login
- [ ] Database instead of JSON files
- [ ] Rate limiting
- [ ] Audit logging
- [ ] Backup and recovery

---

## 🛠️ Development

### Adding Features

**New API Endpoint:**
1. Add route to `backend/src/routes/`
2. Add controller logic to `backend/src/controllers/`
3. Test with curl or Thunder Client

**New UI Component:**
1. Create component in `frontend/src/components/`
2. Import in `App.jsx`
3. Style in `App.css`

**See examples:**
- Routes: `backend/src/routes/uploadRoutes.js`
- Components: `frontend/src/components/FileUpload.jsx`

### Running in Production

```bash
# Build frontend
cd frontend
npm run build

# Start backend
cd ../backend
NODE_ENV=production npm start
```

Backend will serve frontend from `backend/public/` folder.

---

## 📞 Support

- **Documentation**: See [README.md](./README.md)
- **Testing**: See [TESTING.md](./TESTING.md)
- **API**: http://localhost:5000/docs (when Swagger added)
- **Issues**: Check GitHub issues or create new one

---

## 🎉 You're Ready!

Your CloudTab secure file handling system is now running!

**Try:**
1. Upload a PDF
2. Get the session ID
3. Login as shopkeeper
4. Print the file
5. Mark job complete

Enjoy! 🚀

---

**Next Phase:** Python local service for automated browser control and print monitoring

See `local-service/README.md` for Phase 2 setup.
