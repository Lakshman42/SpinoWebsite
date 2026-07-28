"""
SpinoCare Web Application - Selenium WebDriver Automation Suite
Target URL: http://localhost:8000/
Python 3.12+ with Selenium 4.x
"""

import unittest
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class SpinoCareSeleniumWebAutomationSuite(unittest.TestCase):

    def setUp(self):
        options = webdriver.ChromeOptions()
        options.add_argument("--headless=new") # Run headless for speed
        options.add_argument("--window-size=1920,1080")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        
        try:
            self.driver = webdriver.Chrome(options=options)
        except Exception:
            # Fallback to Edge if Chrome driver isn't in PATH
            edge_options = webdriver.EdgeOptions()
            edge_options.add_argument("--headless=new")
            self.driver = webdriver.Edge(options=edge_options)

        self.wait = WebDriverWait(self.driver, 10)
        self.base_url = "http://localhost:8000"

    def _login_user(self):
        """Helper to set authentication token in localStorage."""
        self.driver.get(f"{self.base_url}/index.html")
        self.driver.execute_script(
            "localStorage.setItem('spinocare_auth_token', 'mock_jwt_token_2026_test'); "
            "localStorage.setItem('spinocare_user', JSON.stringify({display_name: 'Dr. Test User', role: 'Doctor', email: 'test@spinocare.org'}));"
        )

    def test_000_unauthenticated_analyzer_hidden(self):
        """TC-SEL-E2E-005: Verify that if user is not logged in, #analyzer is hidden (display: none)"""
        self.driver.get(f"{self.base_url}/index.html")
        self.driver.execute_script("localStorage.removeItem('spinocare_auth_token');")
        self.driver.refresh()
        
        analyzer_section = self.driver.find_element(By.ID, "analyzer")
        display_style = analyzer_section.value_of_css_property("display")
        self.assertEqual(display_style, "none", "#analyzer section should have display: none for unauthenticated users")

    def test_001_homepage_rendering_and_metadata(self):
        """TC-SEL-E2E-001: Verify homepage title, meta tags, and header logo"""
        self.driver.get(f"{self.base_url}/index.html")
        self.assertIn("SpinoCare", self.driver.title, "Page title should contain SpinoCare")
        
        header_logo = self.wait.until(EC.presence_of_element_located((By.CLASS_NAME, "app-logo")))
        self.assertTrue(header_logo.is_displayed(), "SpinoCare logo should be displayed in header")

    def test_002_login_page_interaction_and_authentication(self):
        """TC-SEL-E2E-008: Verify login page form submission & localStorage auth token"""
        self.driver.get(f"{self.base_url}/login.html")
        
        # Inject mock fetch to handle offline / test environment authentication
        self.driver.execute_script("""
            window.fetch = function() {
                return Promise.resolve({
                    json: function() {
                        return Promise.resolve({
                            success: true,
                            data: { token: 'mock_selenium_auth_token_123', email: 'testuser@spinocare.org' }
                        });
                    }
                });
            };
        """)

        email_input = self.driver.find_element(By.ID, "email")
        pass_input = self.driver.find_element(By.ID, "password")
        submit_btn = self.driver.find_element(By.ID, "submit-btn")

        email_input.send_keys("testuser@spinocare.org")
        pass_input.send_keys("Pass2026!")
        submit_btn.click()

        time.sleep(1.0)
        # Check token saved in localStorage
        token = self.driver.execute_script("return localStorage.getItem('spinocare_auth_token');")
        self.assertIsNotNone(token, "Auth token should be saved into localStorage")

    def test_003_signup_page_and_otp_modal(self):
        """TC-SEL-E2E-011: Verify signup page form and 6-digit OTP verification modal"""
        self.driver.get(f"{self.base_url}/signup.html")

        # Inject mock fetch for offline registration API call
        self.driver.execute_script("""
            window.fetch = function() {
                return Promise.resolve({
                    json: function() {
                        return Promise.resolve({ success: true });
                    }
                });
            };
        """)

        name_input = self.driver.find_element(By.ID, "fullname")
        email_input = self.driver.find_element(By.ID, "email")
        phone_input = self.driver.find_element(By.ID, "phone")
        dob_input = self.driver.find_element(By.ID, "dob")
        pw_input = self.driver.find_element(By.ID, "password")
        cpw_input = self.driver.find_element(By.ID, "confirm-password")
        agree_btn = self.driver.find_element(By.ID, "agree-btn")
        submit_btn = self.driver.find_element(By.ID, "submit-btn")

        # Fill inputs matching validation rules
        name_input.send_keys("Sarah Jenkins")
        email_input.send_keys("s.jenkins@spinocare.org")
        phone_input.send_keys("9876543210")
        dob_input.send_keys("15/08/1988")
        pw_input.send_keys("Password123!")
        cpw_input.send_keys("Password123!")
        agree_btn.click()

        submit_btn.click()

        otp_modal = self.wait.until(EC.visibility_of_element_located((By.ID, "otp-modal")))
        self.assertTrue(otp_modal.is_displayed(), "OTP verification modal should open")

    def test_004_image_upload_containers_and_editor(self):
        """TC-SEL-E2E-014: Verify T1 and T2 upload boxes and crop editor availability"""
        self._login_user()
        self.driver.get(f"{self.base_url}/index.html")

        upload_t1 = self.wait.until(EC.presence_of_element_located((By.ID, "upload-t1")))
        upload_t2 = self.driver.find_element(By.ID, "upload-t2")

        self.assertTrue(upload_t1.is_displayed(), "T1 upload box should be visible for authenticated user")
        self.assertTrue(upload_t2.is_displayed(), "T2 upload box should be visible for authenticated user")

    def test_005_ai_analysis_and_results_overlay(self):
        """TC-SEL-E2E-024: Verify AI analysis execution and Modic Change result overlay"""
        self._login_user()
        self.driver.get(f"{self.base_url}/index.html")

        # Set valid, distinct grayscale MRI scans for T1 and T2
        self.driver.execute_script("""
            const previewT1 = document.getElementById('preview-t1');
            const previewT2 = document.getElementById('preview-t2');
            const imgT1 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
            const imgT2 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
            previewT1.src = imgT1;
            previewT2.src = imgT2;
            window.setFilePreview('t1', { name: 't1_scan.png', size: 2048 }, imgT1);
            window.setFilePreview('t2', { name: 't2_scan.png', size: 3072 }, imgT2);
        """)

        analyze_btn = self.wait.until(EC.presence_of_element_located((By.ID, "analyze-trigger")))
        self.driver.execute_script("arguments[0].disabled = false; arguments[0].click();", analyze_btn)

        results_modal = self.wait.until(EC.visibility_of_element_located((By.ID, "results-modal")))
        self.assertTrue(results_modal.is_displayed(), "Results modal overlay should display")

    def test_006_history_page_rendering(self):
        """TC-SEL-E2E-028: Verify history.html loads and renders saved reports"""
        self._login_user()
        self.driver.get(f"{self.base_url}/history.html")
        self.assertIn("History", self.driver.title, "History page title should be History | SpinoCare")

    def test_007_profile_page_rendering(self):
        """TC-SEL-E2E-030: Verify profile.html loads user account details"""
        self._login_user()
        self.driver.get(f"{self.base_url}/profile.html")
        self.assertIn("Profile", self.driver.title, "Profile page title should be Profile | SpinoCare")

    def test_008_duplicate_and_color_image_warning_toast(self):
        """TC-SEL-E2E-032: Verify warning toast and analysis execution block when uploading identical images"""
        self._login_user()
        self.driver.get(f"{self.base_url}/index.html")

        # Set duplicate images for T1 and T2
        self.driver.execute_script("""
            const previewT1 = document.getElementById('preview-t1');
            const previewT2 = document.getElementById('preview-t2');
            const dummyData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
            previewT1.src = dummyData;
            previewT2.src = dummyData;
            window.setFilePreview('t1', { name: 'mri.png', size: 1024 }, dummyData);
            window.setFilePreview('t2', { name: 'mri.png', size: 1024 }, dummyData);
        """)
        
        toast = self.wait.until(EC.visibility_of_element_located((By.ID, "mri-error-toast")))
        self.assertTrue(toast.is_displayed(), "Warning toast for identical/duplicate images should display")

        # Click analyze button while duplicate images exist
        analyze_btn = self.driver.find_element(By.ID, "analyze-trigger")
        self.driver.execute_script("arguments[0].disabled = false; arguments[0].click();", analyze_btn)

        time.sleep(1.0)
        results_modal = self.driver.find_element(By.ID, "results-modal")
        self.assertFalse(results_modal.is_displayed(), "Results modal should NOT be displayed when analysis is blocked")
        
        blocked_toast = self.driver.find_element(By.ID, "mri-error-toast")
        self.assertIn("Analysis Blocked", blocked_toast.text, "Toast should state Analysis Blocked")

    def tearDown(self):
        if hasattr(self, 'driver') and self.driver:
            self.driver.quit()

if __name__ == "__main__":
    unittest.main()
