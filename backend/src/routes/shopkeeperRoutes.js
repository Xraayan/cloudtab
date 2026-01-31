import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { getSession } from '../utils/sessionManager.js';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Shopkeeper interface - view session and files
router.get('/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = getSession(sessionId);

    if (!session) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Session Not Found</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f5f5f5; }
            .container { background: white; padding: 40px; border-radius: 8px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #d32f2f; }
            p { color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Session Not Found</h1>
            <p>The session ID is invalid or has expired.</p>
            <p><a href="/">Back to Home</a></p>
          </div>
        </body>
        </html>
      `);
    }

    const filesHtml = session.files.map(file => `
      <div class="file-item" onclick="viewFile('${file.id}', '${file.name}', '${file.type}')">
        <div class="file-icon">${getFileIcon(file.category)}</div>
        <div class="file-info">
          <div class="file-name">${file.name}</div>
          <div class="file-size">${formatFileSize(file.size)}</div>
        </div>
        <div style="font-size: 12px; color: #667eea; margin-top: 10px;">👆 Click to view</div>
      </div>
    `).join('');

    const expiresIn = Math.floor((session.expiresAt - Date.now()) / 1000 / 60);

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>CloudTab - Shopkeeper Interface</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
          }
          .container {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            font-size: 28px;
            margin-bottom: 10px;
          }
          .session-info {
            display: flex;
            justify-content: space-around;
            flex-wrap: wrap;
            gap: 20px;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid rgba(255,255,255,0.3);
          }
          .info-item {
            text-align: center;
          }
          .info-label {
            font-size: 12px;
            opacity: 0.9;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .info-value {
            font-size: 18px;
            font-weight: bold;
            margin-top: 5px;
          }
          .content {
            padding: 30px;
          }
          .section-title {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 20px;
            color: #333;
            display: flex;
            align-items: center;
          }
          .section-title:before {
            content: '';
            width: 4px;
            height: 24px;
            background: #667eea;
            border-radius: 2px;
            margin-right: 12px;
          }
          .files-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
          }
          .file-item {
            background: #f9f9f9;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            transition: all 0.3s ease;
            cursor: pointer;
          }
          .file-item:hover {
            border-color: #667eea;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
            transform: translateY(-2px);
            background: #f0e6ff;
          }
          .file-item.active {
            border-color: #667eea;
            background: #f0e6ff;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
          }
          .file-icon {
            font-size: 40px;
            margin-bottom: 10px;
          }
          .file-name {
            font-weight: 600;
            color: #333;
            margin-bottom: 8px;
            word-break: break-word;
            font-size: 14px;
          }
          .file-size {
            color: #999;
            font-size: 12px;
          }
          .actions {
            display: flex;
            gap: 10px;
            margin-top: 30px;
            flex-wrap: wrap;
            justify-content: center;
          }
          button {
            padding: 12px 30px;
            border: none;
            border-radius: 6px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .btn-primary {
            background: #667eea;
            color: white;
          }
          .btn-primary:hover {
            background: #5568d3;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          }
          .btn-success {
            background: #4caf50;
            color: white;
          }
          .btn-success:hover {
            background: #45a049;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
          }
          .btn-danger {
            background: #f44336;
            color: white;
          }
          .btn-danger:hover {
            background: #da190b;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(244, 67, 54, 0.4);
          }
          .warning {
            background: #fff3cd;
            border: 1px solid #ffc107;
            color: #856404;
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 20px;
          }
          .timer {
            font-weight: bold;
            color: #d32f2f;
          }
          @media print {
            /* Hide everything except the viewer content */
            body {
              background: white !important;
              padding: 0 !important;
              margin: 0 !important;
            }
            .container {
              box-shadow: none !important;
              border-radius: 0 !important;
              background: white !important;
            }
            .header,
            .warning,
            .section-title,
            .files-grid,
            .actions,
            button {
              display: none !important;
            }
            .content {
              padding: 0 !important;
            }
            #viewer-container {
              display: block !important;
              border: none !important;
              padding: 0 !important;
              margin: 0 !important;
              background: white !important;
              min-height: auto !important;
              width: 100% !important;
              height: 100% !important;
              position: relative !important;
            }
            #pdf-viewer {
              display: block !important;
              width: 100% !important;
              height: 100vh !important;
              border: none !important;
            }
            #image-viewer {
              display: block !important;
              max-width: 100% !important;
              max-height: none !important;
              width: auto !important;
              height: auto !important;
              margin: 0 auto !important;
            }
            #viewer-loading {
              display: none !important;
            }
            /* Watermark for security */
            #viewer-container::after {
              content: 'Session: ${session.sessionId} - DO NOT SAVE';
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 48px;
              color: rgba(255, 0, 0, 0.08);
              pointer-events: none;
              z-index: 9999;
              white-space: nowrap;
            }
          }
          /* Prevent text selection to make copy-paste harder */
          #viewer-container {
            user-select: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
          }
          @media (max-width: 600px) {
            .header { padding: 20px; }
            .header h1 { font-size: 20px; }
            .session-info {
              grid-template-columns: 1fr;
              gap: 10px;
            }
            .content { padding: 20px; }
            .files-grid {
              grid-template-columns: 1fr;
            }
            .actions {
              flex-direction: column;
            }
            button { width: 100%; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📄 CloudTab - Shopkeeper</h1>
            <div class="session-info">
              <div class="info-item">
                <div class="info-label">Session ID</div>
                <div class="info-value">${session.sessionId}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Files</div>
                <div class="info-value">${session.files.length}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Expires in</div>
                <div class="info-value"><span class="timer">${expiresIn} min</span></div>
              </div>
            </div>
          </div>

          <div class="content">
            <div class="warning">
              ⏰ Session expires in <strong>${expiresIn} minutes</strong>. All files will be automatically deleted after session expires.
            </div>

            <div class="section-title">Uploaded Files</div>
            <div class="files-grid">
              ${filesHtml || '<p style="color: #999;">No files uploaded yet</p>'}
            </div>

            <div class="section-title">File Viewer</div>
            <div id="viewer-container" style="width: 100%; border: 1px solid #e0e0e0; border-radius: 8px; background: #f9f9f9; padding: 20px; min-height: 400px; display: none;" oncontextmenu="return false;">
              <!-- PDF canvas viewer - NO iframe, full control -->
              <div id="pdf-canvas-container" style="display: none; overflow-y: auto; max-height: 600px;" oncontextmenu="return false;"></div>
              <!-- Image viewer will load here -->
              <img id="image-viewer" style="max-width: 100%; max-height: 600px; display: none; border-radius: 4px;" oncontextmenu="return false;" draggable="false">
              <p id="viewer-loading" style="text-align: center; color: #666;">Select a file to view</p>
            </div>

            <div class="actions">
              <button class="btn-primary" onclick="printFile()">🖨️ Print</button>
              <button class="btn-danger" onclick="completeSession()">✓ Job Complete</button>
            </div>
          </div>
        </div>

        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
        <script>
          // Set PDF.js worker
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

          const sessionId = '${session.sessionId}';
          let currentFile = null;
          let currentFileUrl = null; // Store the blob URL for printing

          // SECURITY: Disable right-click context menu on entire page
          document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }, true);

          // SECURITY: Block right-click on viewer container and all children
          document.getElementById('viewer-container').addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }, true);

          // SECURITY: Block right-click on PDF canvas container
          document.getElementById('pdf-canvas-container').addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }, true);

          // SECURITY: Block right-click on image viewer
          document.getElementById('image-viewer').addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }, true);

          // SECURITY: Disable keyboard shortcuts for saving
          document.addEventListener('keydown', (e) => {
            // Disable Ctrl+S (Save)
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
              e.preventDefault();
              alert('⚠️ Saving files is disabled for security');
              return false;
            }
            
            // Disable F12 (DevTools)
            if (e.key === 'F12') {
              e.preventDefault();
              alert('⚠️ Developer tools are disabled');
              return false;
            }

            // Disable Ctrl+Shift+I (DevTools)
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I') {
              e.preventDefault();
              return false;
            }

            // Disable Ctrl+U (View Source)
            if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
              e.preventDefault();
              return false;
            }
          });

          // File item click handler
          function viewFile(fileId, fileName, fileType) {
            currentFile = { fileId, fileName, fileType };
            
            // Update UI - highlight selected file
            document.querySelectorAll('.file-item').forEach(item => {
              item.classList.remove('active');
            });
            event.currentTarget.classList.add('active');
            
            const viewerContainer = document.getElementById('viewer-container');
            const pdfCanvasContainer = document.getElementById('pdf-canvas-container');
            const imageViewer = document.getElementById('image-viewer');
            const viewerLoading = document.getElementById('viewer-loading');
            
            viewerContainer.style.display = 'block';
            pdfCanvasContainer.style.display = 'none';
            pdfCanvasContainer.innerHTML = ''; // Clear previous canvases
            imageViewer.style.display = 'none';
            viewerLoading.style.display = 'block';
            viewerLoading.textContent = 'Loading...';
            
            // Fetch decrypted file for viewing
            fetch(\`/api/session/\${sessionId}/file/\${fileId}/view\`)
              .then(response => response.blob())
              .then(blob => {
                const url = URL.createObjectURL(blob);
                currentFileUrl = url; // Store for printing
                
                if (fileType.includes('pdf')) {
                  // PDF viewing using Canvas - NO iframe, fully secure
                  const loadingTask = pdfjsLib.getDocument(url);
                  loadingTask.promise.then(async pdf => {
                    pdfCanvasContainer.innerHTML = '';
                    pdfCanvasContainer.style.display = 'block';
                    viewerLoading.style.display = 'none';
                    
                    // Render all pages to canvas
                    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                      const page = await pdf.getPage(pageNum);
                      const scale = 1.5;
                      const viewport = page.getViewport({ scale });
                      
                      const canvas = document.createElement('canvas');
                      canvas.style.display = 'block';
                      canvas.style.margin = '10px auto';
                      canvas.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
                      canvas.width = viewport.width;
                      canvas.height = viewport.height;
                      canvas.oncontextmenu = () => false; // Block right-click per canvas
                      
                      pdfCanvasContainer.appendChild(canvas);
                      
                      const context = canvas.getContext('2d');
                      await page.render({ canvasContext: context, viewport }).promise;
                    }
                  }).catch(err => {
                    viewerLoading.textContent = 'Error loading PDF';
                    console.error(err);
                  });
                } else if (fileType.includes('image')) {
                  // Image viewing with img tag
                  imageViewer.src = url;
                  imageViewer.style.display = 'block';
                  viewerLoading.style.display = 'none';
                } else {
                  viewerLoading.textContent = 'File type not viewable in browser. Use print to save.';
                }
              })
              .catch(error => {
                viewerLoading.textContent = 'Error loading file';
                console.error('Error:', error);
              });
          }

          function printFile() {
            if (!currentFile || !currentFileUrl) {
              alert('⚠️ Please select and view a file first, then click Print.');
              return;
            }
            
            const viewerContainer = document.getElementById('viewer-container');
            if (viewerContainer.style.display === 'none') {
              alert('⚠️ Please view a file first before printing.');
              return;
            }
            
            // SECURE PRINTING: Print the canvas-rendered content
            if (currentFile.fileType.includes('pdf')) {
              // Get all canvas elements and print them
              const canvases = document.querySelectorAll('#pdf-canvas-container canvas');
              if (canvases.length === 0) {
                alert('⚠️ Please wait for PDF to load completely.');
                return;
              }
              
              // Create hidden iframe for secure printing
              const printFrame = document.createElement('iframe');
              printFrame.style.position = 'fixed';
              printFrame.style.right = '0';
              printFrame.style.bottom = '0';
              printFrame.style.width = '0';
              printFrame.style.height = '0';
              printFrame.style.border = 'none';
              printFrame.style.visibility = 'hidden';
              document.body.appendChild(printFrame);
              
              const doc = printFrame.contentWindow.document;
              doc.open();
              doc.write(\`
                <!DOCTYPE html>
                <html>
                <head>
                  <title>Print</title>
                  <style>
                    body { margin: 0; padding: 0; }
                    img { display: block; width: 100%; page-break-after: always; }
                    img:last-child { page-break-after: avoid; }
                    @media print { body { margin: 0; } }
                  </style>
                </head>
                <body>
              \`);
              
              // Convert each canvas to image and add to print document
              canvases.forEach((canvas, index) => {
                const imgData = canvas.toDataURL('image/png');
                doc.write(\`<img src="\${imgData}">\`);
              });
              
              doc.write('</body></html>');
              doc.close();
              
              printFrame.contentWindow.onload = function() {
                setTimeout(() => {
                  printFrame.contentWindow.print();
                  setTimeout(() => {
                    document.body.removeChild(printFrame);
                  }, 1000);
                }, 300);
              };
            } else if (currentFile.fileType.includes('image')) {
              // For images, use hidden iframe with the image
              const printFrame = document.createElement('iframe');
              printFrame.style.position = 'fixed';
              printFrame.style.right = '0';
              printFrame.style.bottom = '0';
              printFrame.style.width = '0';
              printFrame.style.height = '0';
              printFrame.style.border = 'none';
              printFrame.style.visibility = 'hidden';
              document.body.appendChild(printFrame);
              
              const doc = printFrame.contentWindow.document;
              doc.open();
              doc.write(\`
                <!DOCTYPE html>
                <html>
                <head>
                  <title>Print</title>
                  <style>
                    body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                    img { max-width: 100%; max-height: 100%; }
                    @media print { body { margin: 0; } img { max-width: 100%; } }
                  </style>
                </head>
                <body>
                  <img src="\${currentFileUrl}" onload="window.print();">
                </body>
                </html>
              \`);
              doc.close();
              
              // Remove iframe after print
              setTimeout(() => {
                document.body.removeChild(printFrame);
              }, 5000);
            } else {
              alert('This file type cannot be printed directly.');
            }
          }

          function downloadAll() {
            alert('⚠️ Download feature disabled for security. Files are encrypted and cannot be saved to disk.\\n\\nUse Print button to save as PDF instead.');
          }

          async function completeSession() {
            try {
              const response = await fetch(\`/api/session/\${sessionId}/complete\`, {
                method: 'POST'
              });

              if (response.ok) {
                // Show completion message box
                document.querySelector('.container').innerHTML = \`
                  <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80vh; text-align: center; padding: 40px;">
                    <div style="font-size: 80px; margin-bottom: 20px;">✅</div>
                    <h1 style="color: #4caf50; font-size: 32px; margin-bottom: 20px;">Session Completed</h1>
                    <p style="font-size: 18px; color: #666; margin-bottom: 40px;">All files have been securely deleted.</p>
                    <button onclick="window.location.href='/'" style="background: #667eea; color: white; border: none; padding: 15px 50px; font-size: 18px; border-radius: 8px; cursor: pointer; font-weight: 600;">Done</button>
                  </div>
                \`;
              } else {
                console.error('Error completing session');
              }
            } catch (error) {
              console.error('Error:', error.message);
            }
          }

          // Update timer every minute
          setInterval(() => {
            location.reload();
          }, 60000);
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Shopkeeper interface error:', error);
    res.status(500).send('Error loading session');
  }
});

function getFileIcon(category) {
  const icons = {
    'pdf': '📄',
    'image': '🖼️',
    'document': '📋',
    'spreadsheet': '📊',
    'file': '📎'
  };
  return icons[category] || '📎';
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

export default router;
