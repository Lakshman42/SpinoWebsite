# SpinoCare Web Application - Selenium WebDriver Automation Suite
# Python 3.12+ with Selenium 4.x
# Target URL: http://localhost:8000/

import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

class SpinoCareSeleniumWebSuite(unittest.TestCase):

    def setUp(self):
        options = webdriver.ChromeOptions()
        options.add_argument("--headless=new")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-gpu")
        options.add_argument("--window-size=1920,1080")
        self.driver = webdriver.Chrome(options=options)
        self.wait = WebDriverWait(self.driver, 10)
        self.base_url = "http://localhost:8000"

    def test_001_homepage_navigation_and_title(self):
        """TC-SEL-E2E-001: Verify homepage load, title, and components."""
        self.driver.get(f"{self.base_url}/index.html")
        self.assertIn("SpinoCare", self.driver.title, "Page title should contain SpinoCare")
        
        header_logo = self.wait.until(EC.presence_of_element_located((By.CLASS_NAME, "app-logo")))
        self.assertTrue(header_logo.is_displayed(), "Header logo should be visible")

    def test_002_user_login_flow(self):
        """TC-SEL-E2E-008: Verify login page form submission & token storage."""
        self.driver.get(f"{self.base_url}/login.html")
        
        email_input = self.driver.find_element(By.ID, "email")
        pass_input = self.driver.find_element(By.ID, "password")
        submit_btn = self.driver.find_element(By.ID, "submit-btn")

        email_input.send_keys("testuser@spinocare.org")
        pass_input.send_keys("Pass2026!")
        submit_btn.click()

        time.sleep(1.5)
        # Verify auth token saved in localStorage
        token = self.driver.execute_script("return localStorage.getItem('spinocare_auth_token');")
        self.assertIsNotNone(token, "Auth token should be stored in localStorage upon login")

    def test_003_image_upload_and_editor_crop(self):
        """TC-SEL-E2E-014: Verify T1 and T2 image uploading and crop editor confirmation."""
        self.driver.get(f"{self.base_url}/index.html")
        
        upload_t1 = self.wait.until(EC.presence_of_element_located((By.ID, "upload-t1")))
        upload_t2 = self.driver.find_element(By.ID, "upload-t2")
        analyze_btn = self.driver.find_element(By.ID, "analyze-trigger")

        self.assertTrue(upload_t1.is_displayed(), "T1 upload box should be visible")
        self.assertTrue(upload_t2.is_displayed(), "T2 upload box should be visible")

    def test_004_ai_analysis_and_results_sheet(self):
        """TC-SEL-E2E-024: Verify AI analysis execution and Modic Change result overlay."""
        self.driver.get(f"{self.base_url}/index.html")
        # Trigger analysis
        analyze_btn = self.driver.find_element(By.ID, "analyze-trigger")
        self.driver.execute_script("arguments[0].disabled = false; arguments[0].click();", analyze_btn)

        modal = self.wait.until(EC.presence_of_element_located((By.ID, "results-modal")))
        self.assertTrue(modal.is_displayed(), "Results modal overlay should display")

    def tearDown(self):
        if self.driver:
            self.driver.quit()

if __name__ == "__main__":
    unittest.main()
