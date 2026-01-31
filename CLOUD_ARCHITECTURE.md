# CloudTab - Hybrid Cloud Architecture

## 🌐 Architecture Overview

### **Customer Side (Cloud-Hosted)**
- **Frontend:** React app hosted on Vercel/Netlify/Cloudflare
- **URL:** https://cloudtab.yourcompany.com
- **Backend API:** Cloud-hosted (AWS/Railway/Render)
- **Storage:** Cloud database + encrypted file storage

### **Shopkeeper Side (Local Desktop App)**
- **App:** Windows .exe (standalone)
- **Function:** Downloads & prints files from cloud
- **No internet cafe computer setup needed**
- **Secure:** Only fetches, never stores permanently

---

## 📦 What Gets Built

### **1. Customer Portal (Cloud)**
```
cloudtab-customer/
├── React frontend (Vite build)
├── Backend API (Node.js Express)
├── Database (PostgreSQL/MongoDB)
└── File storage (S3/Cloudinary)
```

**Deployed to:** Vercel (frontend) + Railway (backend)

### **2. Shopkeeper Desktop App (.exe)**
```
cloudtab-shopkeeper.exe
├── Electron wrapper
├── Shopkeeper interface (React)
├── API client (connects to cloud)
└── Print handler (local)
```

**Distributed to:** Shopkeepers via download

---

## 🔄 Workflow

### **Customer Journey:**
1. Go to **cloudtab.com**
2. Upload files (encrypted)
3. Get **6-digit session ID**
4. Show ID to shopkeeper

### **Shopkeeper Journey:**
1. Run **CloudTab.exe** on their PC
2. Enter customer's **session ID**
3. Files download (decrypt in memory)
4. View & print
5. Click "Complete" → Files deleted from cloud

---

## 🔐 Security Flow

```
Customer Upload:
  Files → AES-256 Encrypt → S3 Bucket (encrypted)
  
Shopkeeper Fetch:
  API Request + Session ID → Download → Decrypt in RAM → Display → Print → Delete from RAM
  
Cleanup:
  Job Complete → Delete from S3 → Delete session → Local cleanup
```

---

## 🛠️ Build Commands

### **Build Customer Portal (for hosting):**
```bash
npm run build:customer
```
Output: `dist/customer/` → Upload to Vercel

### **Build Shopkeeper App (.exe):**
```bash
npm run build:shopkeeper
```
Output: `dist/cloudtab-shopkeeper.exe` → Share with shopkeepers

---

## 🚀 Deployment

### **Customer Portal:**
```bash
# Deploy frontend
vercel deploy --prod

# Deploy backend
railway up

# Or use Docker
docker-compose up -d
```

### **Shopkeeper App:**
```bash
# Download from your website
https://cloudtab.com/downloads/cloudtab-shopkeeper-setup.exe

# Or from GitHub Releases
https://github.com/yourrepo/releases/latest
```

---

## 🌍 Benefits of This Architecture

### **For Customers:**
✅ Access from anywhere (home, mobile, cafe)
✅ No software installation
✅ Always up-to-date
✅ Works on any device (Windows, Mac, mobile)

### **For Shopkeepers:**
✅ Simple .exe to install
✅ No web server setup needed
✅ Auto-updates available
✅ Works offline for already-downloaded sessions
✅ No port forwarding or networking hassles

### **For You (Developer):**
✅ Single cloud deployment
✅ Easier version control
✅ Centralized user management
✅ Better security (no exposed local backends)
✅ Analytics & monitoring

---

## 📊 Technology Stack

### **Customer Portal:**
- **Frontend:** React + Vite + Tailwind
- **Backend:** Node.js + Express
- **Database:** PostgreSQL (Supabase/Neon)
- **Storage:** AWS S3 or Cloudinary
- **Hosting:** Vercel + Railway/Render

### **Shopkeeper App:**
- **Framework:** Electron
- **UI:** React
- **Packaging:** electron-builder
- **Updates:** electron-updater
- **Security:** CSP, HTTPS only

---

## 🔧 Environment Variables

### **Cloud Backend (.env):**
```env
# Database
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# Storage
AWS_S3_BUCKET=cloudtab-files
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...

# Security
ENCRYPTION_KEY=...
JWT_SECRET=...
SESSION_TIMEOUT=300000

# API
API_URL=https://api.cloudtab.com
FRONTEND_URL=https://cloudtab.com
```

### **Shopkeeper App (.env):**
```env
# API Configuration
API_URL=https://api.cloudtab.com
API_KEY=shopkeeper-secure-key

# Local Settings
AUTO_UPDATE=true
LOG_LEVEL=info
```

---

## 🔐 Security Enhancements

### **Customer Portal:**
- ✅ HTTPS only
- ✅ Rate limiting
- ✅ DDoS protection (Cloudflare)
- ✅ Input validation
- ✅ CSRF tokens
- ✅ XSS protection

### **Shopkeeper App:**
- ✅ HTTPS API calls only
- ✅ Certificate pinning
- ✅ Encrypted local cache
- ✅ Auto-cleanup on exit
- ✅ No file persistence
- ✅ Memory-only decryption

### **File Transfer:**
- ✅ End-to-end encryption
- ✅ Signed URLs (expiring)
- ✅ File integrity checks (SHA-256)
- ✅ Size limits enforced
- ✅ Virus scanning (optional)

---

## 📱 Future Mobile Support

With cloud hosting, you can add:
- **Mobile app** (React Native)
- **iOS app** (Swift)
- **Android app** (Kotlin)

All connecting to the same cloud backend!

---

## 💰 Cost Estimation

### **Free Tier (Testing):**
- Vercel: Free (hobby)
- Supabase: Free (500MB DB)
- Cloudflare: Free CDN
- **Total: $0/month**

### **Production (100 users/day):**
- Vercel: Free or $20/month (Pro)
- Railway: $5/month (starter)
- S3: ~$1/month (1GB storage)
- **Total: ~$6-26/month**

### **Scale (1000 users/day):**
- Railway: $20/month
- S3: ~$10/month
- Database: $25/month (Neon)
- **Total: ~$55/month**

---

## ✅ Implementation Checklist

### **Phase 1: Cloud Backend**
- [ ] Create Express API server
- [ ] Add PostgreSQL database
- [ ] Set up S3 file storage
- [ ] Implement encryption
- [ ] Add authentication
- [ ] Deploy to Railway

### **Phase 2: Customer Portal**
- [ ] Create React upload interface
- [ ] Add session management
- [ ] Build responsive design
- [ ] Add QR code generation
- [ ] Deploy to Vercel

### **Phase 3: Shopkeeper App**
- [ ] Create Electron wrapper
- [ ] Build shopkeeper UI
- [ ] Add API client
- [ ] Implement print handler
- [ ] Package as .exe
- [ ] Add auto-updater

### **Phase 4: Testing**
- [ ] End-to-end testing
- [ ] Security audit
- [ ] Performance testing
- [ ] User acceptance testing

---

**Ready to implement?** This architecture is much more scalable and easier to maintain! 🚀
