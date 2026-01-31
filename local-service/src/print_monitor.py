import sys
import json
import time
from pathlib import Path

# Add src directory to path
sys.path.insert(0, str(Path(__file__).parent))

from browser import BrowserManager

def main():
    """Main entry point for local service"""
    print("=" * 50)
    print("🏪 CloudTab Local Service - Shopkeeper PC")
    print("=" * 50)
    
    # For MVP, just test browser initialization
    browser = BrowserManager()
    
    # Example: Open a test session
    session_id = "ABC123"
    print(f"\n📂 Opening session: {session_id}")
    
    if browser.open_session(session_id):
        print(f"✅ Session opened successfully")
        print(f"📊 Monitoring print jobs...")
        
        # In production, this would handle actual print monitoring
        # For now, just show it's ready
        print(f"✅ Service ready for print monitoring")
        
        # Wait a bit, then close
        time.sleep(2)
        browser.close_session()
    else:
        print(f"❌ Failed to open session")

if __name__ == "__main__":
    main()
