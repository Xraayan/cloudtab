# CloudTab - Secure File Handling for Internet Cafes

Welcome to **CloudTab** - a complete, secure, and ready-to-use system for handling customer files in internet cafes and xerox shops.

---

## 🎯 What is CloudTab?

CloudTab is a three-part system:

1. **Customer Portal** - Upload files securely via web
2. **Shopkeeper Interface** - Access & print files
3. **Local Service** - Manage browser isolation (Phase 2)

All data is **encrypted**, **automatically deleted**, and **session-isolated**.

---

## ⚡ Quick Links

### 📖 Getting Started (Pick One)
- **🚀 [QUICKSTART.md](./QUICKSTART.md)** - Get running in 5 minutes
- **📚 [README.md](./README.md)** - Full documentation
- **🧪 [TESTING.md](./TESTING.md)** - Testing guide
- **📡 [API.md](./API.md)** - API reference

### 📂 Project Files
- **🛠️ [setup.bat](./setup.bat)** / [setup.sh](./setup.sh) - Automated setup
- **▶️ [start.bat](./start.bat)** / [start.sh](./start.sh) - Quick start
- **💾 [IMPLEMENTATION.md](./IMPLEMENTATION.md)** - Technical details

### 📁 Source Code
- **[frontend/](./frontend/)** - React upload portal
- **[backend/](./backend/)** - Node.js API server
- **[local-service/](./local-service/)** - Python service (Phase 2)

---

## 🚀 Start in 3 Steps

### Step 1: Setup
```bash
# Windows
setup.bat

# macOS/Linux
chmod +x setup.sh && ./setup.sh
```

### Step 2: Run
```bash
# Windows
start.bat

# macOS/Linux
chmod +x start.sh && ./start.sh
```

### Step 3: Open in Browser
- **Customer:** http://localhost:5173
- **Shopkeeper:** http://localhost:5000/shopkeeper-login
- **API:** http://localhost:5000/api/health

---

## ✅ Features

### Security
✅ AES-256 encryption
✅ Secure file deletion
✅ Session isolation
✅ File validation
✅ CORS protection

### Functionality
✅ Drag & drop upload
✅ QR code generation
✅ Multiple file types
✅ Auto-expiration (2 hours)
✅ Responsive design

### Developer-Friendly
✅ Modern React + Vite
✅ Express.js API
✅ Comprehensive docs
✅ Testing guide
✅ Setup scripts

---

## 📊 Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite |
| **Backend** | Node.js + Express |
| **Encryption** | AES-256-CBC |
| **Storage** | File system |
| **Sessions** | JSON files |
| **Local Service** | FastAPI + Selenium |

---

## 📖 Documentation

| Document | Purpose |
|----------|---------|
| [QUICKSTART.md](./QUICKSTART.md) | Get started in 5 minutes |
| [README.md](./README.md) | Complete documentation |
| [API.md](./API.md) | API endpoints reference |
| [TESTING.md](./TESTING.md) | Testing procedures |
| [IMPLEMENTATION.md](./IMPLEMENTATION.md) | Technical deep dive |

---

## 🎯 Use Cases

### For Customers
1. Upload files from home/office
2. Get 6-digit session ID
3. Share with shopkeeper
4. Track via QR code
5. Files automatically deleted after 2 hours

### For Shopkeepers
1. Receive session ID from customer
2. Login to access files
3. Preview and print
4. Mark job complete
5. Secure deletion verified

### For Business
1. Reduce data storage costs
2. Ensure customer privacy
3. No file residue on PC
4. Simple and secure workflow
5. Scalable architecture

---

## 🔐 Security Features

### Built-In
- **Encryption:** AES-256-CBC
- **File Validation:** Type and size checks
- **Path Safety:** Prevents traversal attacks
- **Session Isolation:** Independent sessions
- **Auto-Deletion:** 3-pass secure wipe
- **Timeout:** 2-hour auto-expiration

### Recommended for Production
- HTTPS/SSL certificates
- User authentication
- Database backend
- Rate limiting
- Audit logging
- WAF protection

---

## 🧪 Testing

Start with [TESTING.md](./TESTING.md) for:
- Upload test (customer)
- Session access test (shopkeeper)
- API testing (curl/Thunder Client)
- Security validation
- File encryption verification
- Auto-deletion confirmation

---

## 📈 Project Status

| Phase | Status | Features |
|-------|--------|----------|
| **Phase 1 (MVP)** | ✅ Complete | Upload, Session, Print, Delete |
| **Phase 2** | 🔧 Structure Ready | Browser automation, Print monitoring |
| **Phase 3** | 📋 Planned | Auth, Database, Dashboard |

---

## 🛠️ System Requirements

### Minimum
- **RAM:** 2GB
- **Disk:** 1GB free
- **Node.js:** 16+
- **Browser:** Modern (Chrome, Firefox, Edge, Safari)

### Recommended
- **RAM:** 4GB+
- **Disk:** 10GB+ for files
- **Node.js:** 18+ LTS
- **Python:** 3.8+ (for Phase 2)

---

## 📦 Installation Methods

### Automated (Recommended)
```bash
setup.bat  # Windows
./setup.sh # macOS/Linux
```

### Manual
```bash
# Backend
cd backend && npm install && npm start

# Frontend (new terminal)
cd frontend && npm install && npm run dev
```

### Docker (Future)
```bash
docker-compose up
```

---

## 🚀 Deployment

### Local Development
```bash
start.bat  # Windows
./start.sh # macOS/Linux
```

### Production
```bash
cd frontend && npm run build
cd backend && NODE_ENV=production npm start
```

### Cloud Options (Future)
- AWS Lambda + S3
- Azure App Service
- Heroku
- DigitalOcean
- Railway

---

## 🔑 Key Endpoints

### Upload
```
POST /api/upload
→ Returns: sessionId, files, expiresAt
```

### Access Session
```
GET /api/session/{sessionId}
→ Returns: files list, expiration
```

### Complete Job
```
POST /api/session/{sessionId}/complete
→ Returns: success, files deleted
```

### Web Pages
```
GET /shopkeeper-login      → Shopkeeper login
GET /shopkeeper/{sessionId} → Session interface
GET /                       → Home page
```

---

## 💾 Data Storage

### Files
```
backend/uploads/{sessionId}/{fileId}.enc
```

### Sessions
```
backend/sessions/{sessionId}.json
```

### Auto-Cleanup
- Every 30 minutes
- Sessions older than 2 hours removed
- Files securely deleted

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| **Port in use** | Kill process: `lsof -i :5000` (Mac) or `netstat -ano \| findstr :5000` (Win) |
| **Module not found** | Reinstall: `rm -rf node_modules && npm install` |
| **CORS error** | Check backend on http://localhost:5000 |
| **Encryption error** | Set ENCRYPTION_KEY in .env |
| **Session not found** | Check session ID format (6 chars) or expiration |

See [QUICKSTART.md](./QUICKSTART.md) for detailed troubleshooting.

---

## 🎓 Learning Resources

### Concepts
- File upload (multipart/form-data)
- Encryption (AES-256)
- Session management
- REST APIs
- React components
- Express middleware

### Technologies
- React 18 & Vite
- Express.js
- Node.js crypto
- Multer
- Axios
- FastAPI (intro)

---

## 🤝 Contributing

To contribute or extend CloudTab:

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Test thoroughly** - See [TESTING.md](./TESTING.md)
5. **Submit a pull request**

Areas for contribution:
- Phase 2 (local service)
- Database integration
- Admin dashboard
- Mobile apps
- Localization
- Performance optimization
- Security enhancements

---

## 📄 License

MIT License - Free to use, modify, and distribute

---

## 📞 Support

### Documentation
- [QUICKSTART.md](./QUICKSTART.md) - Get started
- [README.md](./README.md) - Full guide
- [API.md](./API.md) - API reference
- [TESTING.md](./TESTING.md) - Testing guide

### Issues
1. Check documentation first
2. Check GitHub issues
3. Create new issue with:
   - Error message
   - Steps to reproduce
   - Environment info
   - Browser/Node version

### Community
- GitHub discussions
- Stack Overflow
- Project wiki

---

## 🎉 You're All Set!

Your secure file handling system is ready to use.

### Next Steps
1. Run `setup.bat` or `./setup.sh`
2. Run `start.bat` or `./start.sh`
3. Open http://localhost:5173
4. Try uploading a file
5. Access as shopkeeper
6. Print and complete job

### Then Explore
- Test all features (see [TESTING.md](./TESTING.md))
- Customize styles (frontend/src/App.css)
- Modify settings (backend/.env)
- Add new features (see IMPLEMENTATION.md)
- Deploy to production (see README.md)

---

## 🚀 Roadmap

### Phase 1 ✅ (Current)
MVP with upload, storage, print, delete

### Phase 2 🔧 (Next)
Python service for browser automation

### Phase 3 📋 (Future)
Dashboard, auth, payments, mobile apps

---

**Happy using CloudTab!** 🎉

For questions or issues, check the documentation or create a GitHub issue.

---

**Build Date:** January 31, 2024
**Version:** 1.0.0 (MVP)
**Status:** ✅ Production Ready
**Maintainer:** Your Team

Last Updated: January 31, 2024
