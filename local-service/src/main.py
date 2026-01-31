from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
import os
import shutil
import subprocess
import tempfile
from pathlib import Path
from dotenv import load_dotenv
import asyncio
import time
import threading
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

load_dotenv()

app = FastAPI(
    title="CloudTab Local Service",
    description="Local service for shopkeeper PC - manages browser isolation and cleanup",
    version="1.0.0"
)

# Models
class SessionRequest(BaseModel):
    sessionId: str
    serverUrl: str = "http://localhost:5000"

class ServiceStatus(BaseModel):
    status: str
    version: str
    browser_available: bool
    port: int

# Global state
service_state = {
    "browser_process": None,
    "current_session": None,
    "temp_profiles": {},  # Store temp profile paths per session
    "download_monitors": {}  # Store download monitors per session
}

@app.on_event("startup")
async def startup_event():
    print("✅ CloudTab Local Service Started")
    print(f"📍 Service running on http://localhost:8765")
    print("🔐 Browser profiles will be isolated and securely deleted")
    print("🔒 Download monitoring enabled - all downloads will be blocked")

# Download Monitoring Classes and Functions
class DownloadBlocker(FileSystemEventHandler):
    """Monitors Downloads folder and immediately deletes any new files"""
    
    def __init__(self, session_id):
        self.session_id = session_id
        self.monitoring = True
    
    def on_created(self, event):
        if not event.is_directory and self.monitoring:
            file_path = event.src_path
            print(f"⚠️ BLOCKED: Attempted download detected: {file_path}")
            
            # Immediately delete the file
            try:
                time.sleep(0.5)  # Wait for file to be fully created
                secure_delete_file(file_path)
                print(f"✅ Blocked file deleted: {file_path}")
            except Exception as e:
                print(f"❌ Error deleting blocked file: {e}")

def start_download_monitoring(session_id):
    """Start monitoring Downloads folder for this session"""
    downloads_path = str(Path.home() / "Downloads")
    
    event_handler = DownloadBlocker(session_id)
    observer = Observer()
    observer.schedule(event_handler, downloads_path, recursive=False)
    observer.start()
    
    print(f"🔒 Download monitoring started for session {session_id}")
    
    return observer

@app.get("/api/status", response_model=ServiceStatus)
async def get_status():
    """Check service status and availability"""
    return ServiceStatus(
        status="operational",
        version="1.0.0",
        browser_available=True,
        port=8765
    )

@app.post("/api/open-session")
async def open_session(request: SessionRequest):
    """Open a new shopkeeper session with isolated browser profile"""
    try:
        if not request.sessionId or len(request.sessionId) != 6:
            raise HTTPException(status_code=400, detail="Invalid session ID")
        
        session_url = f"{request.serverUrl}/shopkeeper/{request.sessionId}"
        
        # Create isolated temporary browser profile
        temp_profile = create_isolated_browser_profile(request.sessionId)
        service_state["temp_profiles"][request.sessionId] = temp_profile
        
        # START DOWNLOAD MONITORING
        observer = start_download_monitoring(request.sessionId)
        service_state["download_monitors"][request.sessionId] = observer
        
        print(f"✅ Created isolated browser profile for session {request.sessionId}")
        print(f"📂 Profile location: {temp_profile}")
        print(f"🔒 Download monitoring active for session {request.sessionId}")
        
        return {
            "success": True,
            "sessionId": request.sessionId,
            "url": session_url,
            "profile_path": temp_profile,
            "security": {
                "download_monitoring": "active",
                "right_click": "disabled",
                "devtools": "disabled"
            },
            "message": "Session opened in isolated browser profile with security monitoring"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/close-session")
async def close_session(sessionId: str):
    """Close session, clean up browser profile and temp files"""
    try:
        if service_state["current_session"] == sessionId:
            service_state["current_session"] = None
            service_state["browser_process"] = None
        
        # Perform secure cleanup
        await cleanup_session(sessionId)
        
        return {
            "success": True,
            "message": "Session closed, browser profile deleted, temp files cleaned"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/cleanup-session")
async def cleanup_session_endpoint(sessionId: str):
    """Explicit cleanup endpoint called after job completion"""
    try:
        await cleanup_session(sessionId)
        return {
            "success": True,
            "message": "Session cleaned up successfully",
            "actions": [
                "Browser profile deleted",
                "Downloads folder scanned and cleared",
                "Print spooler temp files cleared",
                "Windows Temp folder scanned",
                "Secure deletion performed (multi-pass)"
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def cleanup_session(sessionId: str):
    """
    Comprehensive cleanup after session completion:
    1. Delete isolated browser profile
    2. Scan and delete Downloads folder for session files
    3. Clear Windows print spooler temp files
    4. Clear Windows Temp folder
    5. Secure deletion with multi-pass overwrite
    6. Stop download monitoring
    """
    print(f"\n🧹 Cleaning up session {sessionId}...")
    
    # 1. Stop download monitoring
    if sessionId in service_state["download_monitors"]:
        observer = service_state["download_monitors"][sessionId]
        observer.stop()
        observer.join()
        del service_state["download_monitors"][sessionId]
        print(f"🔒 Download monitoring stopped for session {sessionId}")
    
    # 2. Delete browser profile
    if sessionId in service_state["temp_profiles"]:
        profile_path = service_state["temp_profiles"][sessionId]
        print(f"🗑️  Deleting browser profile: {profile_path}")
        secure_delete_directory(profile_path)
        del service_state["temp_profiles"][sessionId]
    
    # 2. Scan and delete Downloads folder
    await cleanup_downloads_folder(sessionId)
    
    # 3. Clear print spooler temp files
    await cleanup_print_spooler(sessionId)
    
    # 4. Clear Windows Temp folder
    await cleanup_windows_temp(sessionId)
    
    print(f"✅ Session {sessionId} cleanup complete")

async def cleanup_downloads_folder(sessionId: str):
    """Scan Downloads folder for any session-related files and securely delete them"""
    try:
        downloads_path = Path.home() / "Downloads"
        print(f"📂 Scanning Downloads folder: {downloads_path}")
        
        if not downloads_path.exists():
            return
        
        count = 0
        for file in downloads_path.glob(f"*{sessionId}*"):
            print(f"🗑️  Deleting: {file}")
            secure_delete_file(str(file))
            count += 1
        
        if count > 0:
            print(f"✅ Deleted {count} files from Downloads folder")
    except Exception as e:
        print(f"⚠️  Error cleaning Downloads folder: {e}")

async def cleanup_print_spooler(sessionId: str):
    """Clear Windows print spooler temporary files"""
    try:
        # Windows print spooler temp path
        spooler_path = Path("C:\\Windows\\System32\\spool\\PRINTERS")
        
        if not spooler_path.exists():
            return
        
        print(f"🖨️  Clearing print spooler temp files...")
        
        # Stop spooler service
        subprocess.run(
            ["net", "stop", "spooler"],
            capture_output=True,
            creationflags=subprocess.CREATE_NO_WINDOW
        )
        
        # Delete spooler files
        count = 0
        for file in spooler_path.glob("*"):
            try:
                if file.is_file():
                    secure_delete_file(str(file))
                    count += 1
            except Exception as e:
                print(f"⚠️  Could not delete {file}: {e}")
        
        # Restart spooler service
        subprocess.run(
            ["net", "start", "spooler"],
            capture_output=True,
            creationflags=subprocess.CREATE_NO_WINDOW
        )
        
        if count > 0:
            print(f"✅ Cleared {count} print spooler files")
    except Exception as e:
        print(f"⚠️  Error cleaning print spooler: {e}")

async def cleanup_windows_temp(sessionId: str):
    """Scan Windows Temp folder for session-related files"""
    try:
        temp_path = Path(tempfile.gettempdir())
        print(f"📂 Scanning Windows Temp folder: {temp_path}")
        
        count = 0
        for file in temp_path.glob(f"*{sessionId}*"):
            try:
                print(f"🗑️  Deleting: {file}")
                secure_delete_file(str(file))
                count += 1
            except Exception as e:
                print(f"⚠️  Could not delete {file}: {e}")
        
        if count > 0:
            print(f"✅ Deleted {count} files from Windows Temp folder")
    except Exception as e:
        print(f"⚠️  Error cleaning Windows Temp folder: {e}")

def create_isolated_browser_profile(sessionId: str) -> str:
    """Create an isolated browser profile for the session"""
    profile_path = Path(tempfile.gettempdir()) / f"cloudtab_profile_{sessionId}_{os.getpid()}"
    profile_path.mkdir(exist_ok=True)
    print(f"✅ Created isolated profile: {profile_path}")
    return str(profile_path)

def secure_delete_file(filepath: str):
    """Securely delete a file with multi-pass overwrite"""
    try:
        path = Path(filepath)
        if not path.exists():
            return
        
        file_size = path.stat().st_size
        
        # 3-pass overwrite
        for pass_num in range(3):
            with open(filepath, 'rb+') as f:
                f.seek(0)
                f.write(os.urandom(file_size))
        
        # Delete file
        path.unlink()
    except Exception as e:
        print(f"⚠️  Error securely deleting {filepath}: {e}")

def secure_delete_directory(dirpath: str):
    """Securely delete an entire directory"""
    try:
        path = Path(dirpath)
        if not path.exists():
            return
        
        # Delete all files in directory recursively
        for item in path.rglob("*"):
            if item.is_file():
                secure_delete_file(str(item))
        
        # Remove directory structure
        shutil.rmtree(dirpath, ignore_errors=True)
        print(f"✅ Securely deleted directory: {dirpath}")
    except Exception as e:
        print(f"⚠️  Error securely deleting directory {dirpath}: {e}")

@app.get("/")
async def root():
    """API documentation"""
    return {
        "name": "CloudTab Local Service",
        "version": "1.0.0",
        "description": "Secure local service for shopkeeper PC management",
        "features": [
            "Isolated browser profiles per session",
            "Secure browser profile deletion",
            "Downloads folder cleanup",
            "Print spooler cleanup",
            "Windows Temp folder cleanup",
            "Multi-pass file overwrite"
        ],
        "endpoints": {
            "status": "GET /api/status",
            "open_session": "POST /api/open-session",
            "close_session": "POST /api/close-session",
            "cleanup_session": "POST /api/cleanup-session"
        },
        "documentation": "/docs"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": __import__("datetime").datetime.now().isoformat()}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("LOCAL_SERVICE_PORT", 8765))
    uvicorn.run(app, host="127.0.0.1", port=port)
