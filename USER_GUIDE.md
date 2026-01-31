# 🚀 CloudTab Quick Start Guide for Users

## 📥 Installation

### **Option 1: Portable ZIP (Easiest)**

1. **Download** `cloudtab-portable.zip`
2. **Extract** to any folder (e.g., Desktop, Documents)
3. **Open** the extracted folder
4. **Double-click** `start-cloudtab.bat`
5. **Wait** for browser to open (takes 5-10 seconds)
6. **Done!** Start uploading files

### **Option 2: Installer (.exe)**

1. **Download** `cloudtab-setup.exe`
2. **Run** installer
3. **Choose** installation location
4. **Finish** - CloudTab appears in Start Menu
5. **Launch** from Start Menu or Desktop icon
6. **Done!** Browser opens automatically

---

## 💡 How to Use

### **For Customers (Upload Files)**

1. Open CloudTab (browser opens to http://localhost:5173)
2. Drag & drop files OR click "Browse Files"
3. Click "🚀 Upload Files"
4. **Get your 6-digit Session ID** (e.g., ABC123)
5. **Show Session ID** to shopkeeper (or scan QR code)
6. Wait for shopkeeper to complete job
7. Done! Files auto-delete after 5 minutes

### **For Shopkeepers (Print Files)**

1. Customer gives you **Session ID**
2. Go to http://localhost:5000/shopkeeper-login
3. Enter the **6-digit Session ID**
4. View and print files
5. Click "✓ Job Complete" when done
6. Files automatically deleted

---

## 🖥️ System Requirements

- **Operating System:** Windows 10/11 (64-bit)
- **RAM:** 4GB minimum
- **Disk Space:** 500MB free
- **Internet:** Not required (works offline)
- **Software:** **No Node.js needed!**

---

## ⚙️ Configuration

### **Change Ports (if needed)**

If ports 5000 or 5173 are already in use:

1. Open `.env` file in CloudTab folder
2. Edit:
```env
PORT=5000           # Backend (change if needed)
FRONTEND_PORT=5173  # Frontend (change if needed)
```
3. Restart CloudTab

### **Auto-Start on Boot**

**Windows:**
1. Press `Win + R`
2. Type: `shell:startup`
3. Copy `start-cloudtab.bat` to this folder
4. CloudTab now starts automatically

---

## 🛑 Stopping CloudTab

### **Method 1: Close Windows**
- Close all CloudTab windows

### **Method 2: Stop Script**
- Double-click `stop-cloudtab.bat`

### **Method 3: Task Manager**
- Press `Ctrl + Shift + Esc`
- End "CloudTab Backend" and "CloudTab Frontend" tasks

---

## ❓ Troubleshooting

### **Browser doesn't open?**
- Manually go to http://localhost:5173
- Check if backend is running (look for window)

### **Upload fails?**
- Check backend window for errors
- Verify port 5000 is not blocked
- Try restarting CloudTab

### **"Port already in use" error?**
- Close other apps using ports 5000/5173
- Or change ports in `.env` file
- Run `stop-cloudtab.bat` first

### **Antivirus blocks?**
- Add CloudTab folder to antivirus exceptions
- CloudTab is safe - it's a false positive

### **Slow performance?**
- Close unused applications
- Check if 4GB RAM minimum is met
- Reduce number of uploaded files

---

## 🔒 Security Features

✅ **End-to-end encryption** (AES-256-CBC)
✅ **No file downloads** - Print only
✅ **Auto-delete** after 5 minutes
✅ **Session-based access** - Unique IDs
✅ **Right-click disabled** - Can't save files
✅ **No file persistence** on shopkeeper PC
✅ **Secure cleanup** - Multi-pass deletion

---

## 📞 Support

### **Need Help?**
- **Documentation:** See included `.md` files
- **Issues:** https://github.com/Xraayan/cloudtab/issues
- **Email:** support@yourcompany.com

### **Found a Bug?**
- Report at: https://github.com/Xraayan/cloudtab/issues
- Include: Error message, steps to reproduce

---

## 📝 Tips & Best Practices

### **For Maximum Security:**
- Always click "Job Complete" after printing
- Don't share session IDs publicly
- Clear browser cache regularly
- Use on trusted networks only

### **For Best Performance:**
- Keep CloudTab folder on SSD if possible
- Don't upload extremely large files (>50MB each)
- Limit to 10 files per session
- Restart CloudTab daily for fresh session

---

## 🎉 You're All Set!

CloudTab is now ready to use. Just:
1. Double-click `start-cloudtab.bat`
2. Upload files
3. Print securely
4. Files auto-delete

**Enjoy secure file handling!** 🚀

---

## 📋 Quick Reference

| Action | URL |
|--------|-----|
| **Upload Files** | http://localhost:5173 |
| **Shopkeeper Login** | http://localhost:5000/shopkeeper-login |
| **Backend API** | http://localhost:5000/api |
| **Health Check** | http://localhost:5000/api/health |

| File | Purpose |
|------|---------|
| `start-cloudtab.bat` | Start CloudTab |
| `stop-cloudtab.bat` | Stop all services |
| `.env` | Configuration |
| `README.txt` | Basic info |

---

**Version:** 1.0.0  
**Last Updated:** January 2026  
**License:** Proprietary
