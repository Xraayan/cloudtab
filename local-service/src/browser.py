from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import time
import os
from dotenv import load_dotenv

load_dotenv()

class BrowserManager:
    def __init__(self):
        self.driver = None
        self.server_url = os.getenv("CLOUD_SERVER_URL", "http://localhost:5000")
        self.print_detected = False

    def open_session(self, session_id: str):
        """Open an isolated browser session for shopkeeper"""
        try:
            # Configure Chrome options for isolated/incognito mode
            chrome_options = Options()
            chrome_options.add_argument("--incognito")
            chrome_options.add_argument("--start-maximized")
            chrome_options.add_argument("--disable-extensions")
            chrome_options.add_argument("--disable-plugins")
            chrome_options.add_argument("--disable-sync")
            chrome_options.add_argument("--disable-default-apps")
            
            # Disable download prompts
            prefs = {
                "download.prompt_for_download": False,
                "profile.default_content_settings.popups": 0
            }
            chrome_options.add_experimental_option("prefs", prefs)

            # Initialize driver
            self.driver = webdriver.Chrome(options=chrome_options)
            
            # Navigate to session
            session_url = f"{self.server_url}/shopkeeper/{session_id}"
            self.driver.get(session_url)
            
            print(f"✅ Browser opened for session: {session_id}")
            
            # Wait for page to load
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "container"))
            )
            
            return True
        except Exception as e:
            print(f"❌ Error opening session: {str(e)}")
            return False

    def close_session(self):
        """Close the browser session"""
        if self.driver:
            self.driver.quit()
            self.driver = None
            print("✅ Browser session closed")
            return True
        return False

    def monitor_print_job(self):
        """Monitor for print jobs and handle completion"""
        try:
            # Check if "Job Complete" button is clicked
            # This would be detected via window events in production
            print("📊 Monitoring print jobs...")
            return True
        except Exception as e:
            print(f"❌ Error monitoring print: {str(e)}")
            return False

    def wait_for_completion(self, timeout=3600):
        """Wait for user to mark job as complete"""
        try:
            # In production, this would monitor actual browser/window events
            print(f"⏳ Waiting for job completion (timeout: {timeout}s)...")
            time.sleep(timeout)
            return True
        except Exception as e:
            print(f"❌ Error waiting for completion: {str(e)}")
            return False
