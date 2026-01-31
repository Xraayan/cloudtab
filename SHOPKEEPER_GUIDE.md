# Shopkeeper Quick Reference Guide

## Session Access

### How to Open a Session
1. Get the 6-digit **Session ID** from customer
   - Customer provides it verbally, or
   - Customer shows QR code on their screen

2. **Option A: Direct URL**
   - Go to: `http://localhost:5000/shopkeeper/{SESSION_ID}`
   - Example: `http://localhost:5000/shopkeeper/ABC123`

3. **Option B: QR Code**
   - Scan the QR code shown on customer's screen
   - It automatically opens your session

---

## Viewing Files (IMPORTANT - NEW SECURITY FEATURE)

### ⚠️ CRITICAL: Files Do NOT Download to Your PC

Files are shown **only in your browser** and **never saved to your disk**.

- ✅ You can VIEW files
- ✅ You can PRINT files
- ❌ You CANNOT DOWNLOAD files (not possible)
- ❌ Files are NOT saved to Downloads folder
- ❌ Files are NOT saved to your PC anywhere

### Viewing a PDF
1. Click **[👁️ View]** button next to the PDF file
2. PDF opens in your browser with PDF viewer
3. Use controls to navigate pages:
   - **← Prev** - Previous page
   - **Next →** - Next page
   - Page counter shows current page

**Note:** There is NO download button. The PDF cannot be downloaded.

### Viewing an Image
1. Click **[👁️ View]** button next to the image file
2. Image displays in your browser
3. You can zoom using browser zoom (Ctrl + Mouse Wheel)

**Note:** You cannot right-click and "Save As" - this is by design.

### Viewing Other Files
1. Click **[👁️ View]** button
2. File opens in browser if supported
3. Otherwise, opens in default application (if safe)

---

## Printing Files (Only Way to Keep Copies)

### How to Print
1. View the file (see above)
2. Click **[🖨️ Print]** button
3. Browser print dialog opens
4. Select printer or "Print to PDF"
5. Click Print

**This is the ONLY way to keep a copy** - as a printed document (physical paper or PDF file on your disk, per your choice).

---

## Session Expiration

Sessions expire after **2 hours** of creation.

**Remaining Time:** Check the countdown timer on the page.

If session expires:
- All files are automatically deleted
- Cannot access session anymore
- Customer must create new session

---

## Completing a Job

### Final Step: Complete the Job
When done with all files:

1. Click **[✅ Complete Job]** button
2. Confirm: "Yes, complete this job"
3. System will:
   - Delete encrypted files from server
   - Clean temporary files from your PC
   - Clear printer queue temp files
   - Confirm completion

**After completion:** ZERO files from this session remain on your PC.

---

## File Security Features

### Why Can't I Download Files?
- Security requirement for internet cafes
- Files only exist in your browser memory
- Prevents files from persisting on your PC
- Automatic cleanup happens after job completion

### Browser Viewer (PDF.js) for PDFs
- Modern PDF viewer built into browser
- Cannot be bypassed
- No download option available
- View-only mode

### Image Inline Display
- Images displayed in browser using `<img>` tag
- Cannot right-click and download
- View-only mode

---

## After Job Completion

### What Gets Cleaned Up?
When you complete a job:

1. ✅ Encrypted files deleted from server
2. ✅ Temp browser files deleted from your PC
3. ✅ Printer queue temporary files deleted
4. ✅ Windows temporary files cleaned
5. ✅ NO trace of the session remains

### Verification
- Check Downloads folder - EMPTY (no session files)
- Check Temp folder - EMPTY (no session files)
- Printer queue - EMPTY

---

## Troubleshooting

### Q: I can't open the PDF viewer
**A:** Make sure you clicked [👁️ View] not [🖨️ Print]

### Q: The file won't load
**A:** 
- Check internet connection to backend
- Try refreshing the page
- Try viewing a different file

### Q: My session expired
**A:**
- Sessions last 2 hours
- Ask customer to create new session
- Restart the job

### Q: Files are still on my PC after completing job
**A:** (This should NOT happen)
- Local service may not have started
- Check that cleanup ran without errors
- Contact admin to manually trigger cleanup

### Q: Can I download the file another way?
**A:** No. Download is disabled for security. Only options are:
- Print to physical printer
- Print to PDF (then save PDF as needed)

### Q: Can I use Print to PDF to save files?
**A:** Yes! This is the intended way:
1. Click [🖨️ Print]
2. Select "Microsoft Print to PDF"
3. Save the PDF where you want

---

## Security Tips

### ✅ DO
- ✅ View files through the browser viewer
- ✅ Print files to physical printer
- ✅ Print to PDF if you need a copy
- ✅ Complete jobs when finished
- ✅ Keep session IDs confidential

### ❌ DON'T
- ❌ Try to download files (won't work)
- ❌ Take screenshots for permanent storage
- ❌ Share session IDs with others
- ❌ Keep browser window open after job completion
- ❌ Try to recover deleted files (security features prevent this)

---

## Your Responsibilities

### Customer Privacy
- Keep session IDs private
- Don't access sessions you're not authorized for
- Don't view unnecessary files
- Complete jobs promptly

### File Security
- Files are deleted automatically after 2 hours
- Files are securely overwritten before deletion
- Cannot be recovered after deletion
- Your job is to handle them carefully during viewing

### PC Security
- This system ensures NO files persist on your PC
- Cleanup is automatic
- Your PC remains clean and secure

---

## Contact & Support

If you have issues:

1. **Check this guide** - Most questions answered here
2. **Check the timer** - Session might have expired
3. **Restart backend** - Sometimes services need restart
4. **Contact admin** - For technical issues

---

## Keyboard Shortcuts (PDF Viewer)

| Key | Action |
|-----|--------|
| `→` or Space | Next page |
| `←` or Backspace | Previous page |
| `+` | Zoom in |
| `-` | Zoom out |
| `0` | Reset zoom |
| `f` | Fullscreen |
| `Ctrl + P` | Print |

---

## Remember

### Core Principle
**This system is designed to:**
- ✅ Keep customer files secure
- ✅ Prevent files from being stored on your PC permanently
- ✅ Allow you to view and print files normally
- ✅ Automatically clean everything when done

### Privacy
- Your download folder stays clean
- No hidden files saved
- No cache created
- No permanent residue

---

## Example Session Flow

```
1. Customer says: "Session is ABC123"
2. You navigate to: http://localhost:5000/shopkeeper/ABC123
3. You see 3 files: proposal.pdf, invoice.jpg, contract.docx
4. You click [View] on proposal.pdf → Opens in PDF.js viewer
5. You click [Print] → Prints to printer
6. You click [View] on invoice.jpg → Shows image in browser
7. You click [View] on contract.docx → Opens in browser
8. You click [Print] on contract.docx → Sends to printer
9. You click [✅ Complete Job] → Session ends, files deleted
10. You check Downloads folder → EMPTY ✅
11. All temporary files cleaned by system → DONE ✅
```

---

**Last Updated:** January 2025

**Status:** Current & Accurate

