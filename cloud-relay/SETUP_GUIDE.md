# Cloud Relay Server - Quick Setup Guide

## 🎯 What This Server Does

Connects customers (uploading files online) with shopkeepers (downloading to their PC).

```
Customer → cloudtab.com → Cloud Relay → WebSocket → Shopkeeper's PC
```

---

## ⚡ Quick Start (3 Steps)

### Step 1: Get PostgreSQL Database

**Option A: Supabase (Easiest - Free)**
1. Go to https://supabase.com
2. Sign up and create a new project
3. Go to Settings → Database
4. Copy connection string (starts with `postgresql://...`)

**Option B: Railway**
```bash
railway login
railway add postgresql
railway variables
# Copy DATABASE_URL
```

### Step 2: Get AWS S3 Bucket

**Option A: AWS S3**
1. Go to AWS Console → S3
2. Create bucket: `cloudtab-temp-files`
3. Go to IAM → Create user with S3 access
4. Copy Access Key ID and Secret Access Key

**Option B: Skip S3 for Testing**
- Comment out S3 code in `services/s3Service.js`
- Store files in memory temporarily (not recommended for production)

### Step 3: Configure & Run

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Edit .env with your credentials
# Add DATABASE_URL and AWS credentials

# 3. Setup database
npm run db:setup

# 4. Start server
npm start
```

**Or use quick start script:**
```bash
.\start-relay.bat
```

---

## 🔑 Environment Variables Explained

```env
# Database (REQUIRED)
DATABASE_URL=postgresql://user:pass@host:5432/cloudtab

# AWS S3 (REQUIRED for file storage)
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG...
AWS_REGION=us-east-1
AWS_S3_BUCKET=cloudtab-temp-files

# Security (Auto-generated is fine)
JWT_SECRET=random-secret-here
ENCRYPTION_KEY=001d50a089ceb0f66ee953135d6299f73c8271bdc62763c650dc5d1a5fc85755

# CORS (Add your deployed frontend URL)
ALLOWED_ORIGINS=https://cloudtab.com,http://localhost:5173
```

---

## 🧪 Testing Locally

### 1. Start the server:
```bash
npm start
```

### 2. Test health check:
```bash
curl http://localhost:5000/health
```

### 3. Create a session:
```bash
curl -X POST http://localhost:5000/api/customer/sessions/create \
  -H "Content-Type: application/json" \
  -d '{"customerName": "Test User"}'
```

### 4. Test WebSocket connection:
```javascript
const ws = new WebSocket('ws://localhost:5000/ws');
ws.onopen = () => console.log('Connected!');
ws.onmessage = (e) => console.log('Message:', e.data);
```

---

## 🚀 Deployment

### Deploy to Railway:

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Initialize project
railway init

# 4. Add PostgreSQL
railway add postgresql

# 5. Set environment variables
railway variables set AWS_ACCESS_KEY_ID=your_key
railway variables set AWS_SECRET_ACCESS_KEY=your_secret
railway variables set AWS_S3_BUCKET=cloudtab-temp-files
railway variables set ALLOWED_ORIGINS=https://cloudtab.com

# 6. Deploy
railway up

# 7. Get your URL
railway domain
# Example: https://cloudtab-relay-production.up.railway.app
```

### Deploy to Render:

1. Connect GitHub repo
2. Create Web Service
3. Add environment variables in dashboard
4. Deploy automatically

---

## 🔧 Database Setup Details

After setting `DATABASE_URL`, run:

```bash
npm run db:setup
```

This creates:
- ✅ `sessions` table - Track upload sessions
- ✅ `files` table - Track uploaded files
- ✅ `shopkeepers` table - Store shopkeeper credentials
- ✅ A test shopkeeper with API key

**Save the API key!** You'll need it for the shopkeeper app.

---

## 📡 API Testing with Postman/Insomnia

### Create Session:
```
POST http://localhost:5000/api/customer/sessions/create
Content-Type: application/json

{
  "customerName": "John Doe"
}
```

### Upload File:
```
POST http://localhost:5000/api/customer/sessions/ABC123/upload
Content-Type: multipart/form-data

files: [select files]
```

### Get Pending Sessions (Shopkeeper):
```
GET http://localhost:5000/api/shopkeeper/sessions/pending
X-API-Key: SHOP_abc123xyz
```

---

## 🛠️ Troubleshooting

### "Database connection failed"
- Check DATABASE_URL is correct
- Ensure database accepts connections from your IP
- For Supabase: Make sure connection pooling is enabled

### "S3 upload failed"
- Verify AWS credentials are correct
- Check bucket name matches
- Ensure IAM user has `s3:PutObject` permission

### "WebSocket not connecting"
- Check firewall settings
- Ensure server is running on correct port
- Try `ws://` for local, `wss://` for production

### Port already in use:
```bash
# Windows - Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <process_id> /F
```

---

## 📊 What Happens Next?

1. ✅ Cloud relay server running
2. ⏭️ **Next:** Update customer frontend to use this server
3. ⏭️ **Then:** Build shopkeeper desktop app
4. ⏭️ **Finally:** Deploy everything!

---

## 🔒 Security Notes

- API keys authenticate shopkeepers
- Files auto-delete after 24 hours
- Sessions expire after 30 minutes
- HTTPS/WSS required in production
- CORS protection enabled
- Helmet.js security headers

---

## 💡 Pro Tips

- Use Supabase free tier for database (500MB free)
- Use Cloudinary instead of S3 (simpler, 25GB free)
- Deploy to Railway (easier than AWS)
- Monitor with `/health` endpoint
- Set up auto-cleanup cron job

---

**Ready to test? Run `npm start` and visit http://localhost:5000**
