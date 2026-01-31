# 🚀 CloudTab Deployment Guide

## 📦 Architecture

**Customer Portal (Cloud):** https://cloudtab.com → Users upload files
**Backend API (Cloud):** https://api.cloudtab.com → File storage & sessions  
**Shopkeeper App (Desktop):** CloudTab.exe → Download & print files

---

## Part 1: Deploy Customer Portal & Backend

### **Step 1: Prepare Cloud Backend**

1. **Create account on Railway:**
   - Go to https://railway.app
   - Sign up with GitHub
   - Create new project

2. **Deploy backend:**
```bash
cd cloudtab
railway login
railway init
railway up
```

3. **Set environment variables:**
```bash
railway variables set DATABASE_URL=postgresql://...
railway variables set ENCRYPTION_KEY=your-key-here
railway variables set AWS_S3_BUCKET=cloudtab-files
```

4. **Get your backend URL:**
```
https://your-app.railway.app
```

---

### **Step 2: Deploy Customer Frontend**

1. **Update API URL in frontend:**
```javascript
// frontend/src/services/api.js
const API_BASE = 'https://your-app.railway.app/api';
```

2. **Build frontend:**
```bash
cd frontend
npm run build
```

3. **Deploy to Vercel:**
```bash
npm install -g vercel
vercel login
vercel --prod
```

4. **Your customer portal is now live:**
```
https://cloudtab.vercel.app
```

---

## Part 2: Build Shopkeeper Desktop App

### **Step 1: Configure API endpoint**

Edit `shopkeeper-app/electron/main.js`:
```javascript
const CLOUD_API_URL = 'https://your-app.railway.app';
```

### **Step 2: Build the .exe**

```bash
# Install dependencies
cd shopkeeper-app
npm install

# Build Windows executable
npm run package:win
```

**Output:** `shopkeeper-app/dist/CloudTab-Shopkeeper-Setup.exe`

### **Step 3: Distribute to Shopkeepers**

**Option A: Direct Download**
- Upload to your website
- Share link: https://yoursite.com/downloads/cloudtab-setup.exe

**Option B: GitHub Releases**
```bash
# Create release
git tag -a v1.0.0 -m "Initial release"
git push origin v1.0.0

# Upload .exe to GitHub Releases page
```

**Option C: Cloud Storage**
- Upload to Google Drive / Dropbox
- Share public link

---

## Part 3: Database Setup

### **Option A: Supabase (Recommended - Free)**

1. Go to https://supabase.com
2. Create new project
3. Run migration:
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(6) UNIQUE NOT NULL,
  files JSONB,
  status VARCHAR(20),
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(6) REFERENCES sessions(session_id),
  file_name VARCHAR(255),
  file_type VARCHAR(100),
  file_size BIGINT,
  s3_key VARCHAR(500),
  encrypted BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

4. Get connection string:
```
postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
```

### **Option B: Railway PostgreSQL**
```bash
railway add postgresql
```

### **Option C: Neon (Serverless)**
- Go to https://neon.tech
- Create database
- Copy connection string

---

## Part 4: File Storage Setup

### **Option A: AWS S3**

1. Create S3 bucket:
```bash
aws s3 mb s3://cloudtab-files
```

2. Set CORS policy:
```json
{
  "CORSRules": [{
    "AllowedOrigins": ["https://cloudtab.vercel.app"],
    "AllowedMethods": ["GET", "POST", "PUT"],
    "AllowedHeaders": ["*"]
  }]
}
```

3. Create IAM user with S3 access
4. Get credentials:
```env
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=cloudtab-files
AWS_REGION=us-east-1
```

### **Option B: Cloudinary (Easier)**

1. Go to https://cloudinary.com
2. Sign up (free tier: 25GB storage)
3. Get credentials:
```env
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

---

## Part 5: Full Environment Variables

### **Backend (.env):**
```env
# Server
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL=postgresql://...

# File Storage (choose one)
AWS_S3_BUCKET=cloudtab-files
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1

# OR Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Security
ENCRYPTION_KEY=your-64-char-hex-key
JWT_SECRET=your-jwt-secret
SESSION_TIMEOUT=300000

# URLs
FRONTEND_URL=https://cloudtab.vercel.app
API_URL=https://your-app.railway.app
```

### **Shopkeeper App (config.json):**
```json
{
  "apiUrl": "https://your-app.railway.app",
  "autoUpdate": true,
  "updateUrl": "https://github.com/yourrepo/releases/latest"
}
```

---

## Part 6: Testing

### **Test Customer Flow:**
1. Go to https://cloudtab.vercel.app
2. Upload a test file
3. Get session ID (e.g., ABC123)

### **Test Shopkeeper App:**
1. Run CloudTab-Shopkeeper.exe
2. Enter session ID: ABC123
3. Files should download
4. View and print
5. Click "Complete" → Files deleted

---

## Part 7: Custom Domain (Optional)

### **For Customer Portal:**
```bash
# In Vercel dashboard
vercel domains add cloudtab.com
```

### **For Backend API:**
```bash
# In Railway dashboard
railway domain add api.cloudtab.com
```

---

## Part 8: Monitoring & Analytics

### **Add Sentry (Error Tracking):**
```bash
npm install @sentry/node @sentry/react
```

### **Add Google Analytics:**
```javascript
// frontend/index.html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
```

### **Add Uptime Monitoring:**
- Use https://uptimerobot.com
- Monitor: https://api.cloudtab.com/health

---

## 📊 Cost Summary

### **Free Tier (Good for 100 users/day):**
- Railway: $5/month (starter)
- Vercel: Free (hobby)
- Supabase: Free (500MB)
- Cloudinary: Free (25GB)
- **Total: $5/month**

### **Production (1000+ users/day):**
- Railway: $20/month
- Vercel: Free (hobby OK)
- Supabase: $25/month (Pro)
- S3: $10/month
- **Total: $55/month**

---

## ✅ Deployment Checklist

- [ ] Backend deployed to Railway
- [ ] Database setup (Supabase/Railway)
- [ ] S3/Cloudinary configured
- [ ] Environment variables set
- [ ] Customer frontend deployed to Vercel
- [ ] Custom domain configured (optional)
- [ ] Shopkeeper app built (.exe)
- [ ] Shopkeeper app tested
- [ ] Auto-updates configured
- [ ] Monitoring setup
- [ ] Backup strategy configured
- [ ] Security audit done
- [ ] Load testing done

---

## 🚀 Go Live!

1. **Announce to customers:**
   - "Upload files at cloudtab.com"
   
2. **Distribute to shopkeepers:**
   - "Download CloudTab app from: https://cloudtab.com/downloads"

3. **Support:**
   - Add help docs
   - Create FAQ
   - Set up support email

---

**Your CloudTab is now cloud-hosted and production-ready!** 🎉
