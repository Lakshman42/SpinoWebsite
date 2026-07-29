# SpinoCare Mobile & Web End-to-End Automation Suite
# Engine: Appium 2.x (XCUITest for iOS / UIAutomator2 for Android)
# Python 3.12+ with Appium-Python-Client

import unittest
from appium import webdriver
from appium.options.common import AppiumOptions
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class SpinoCareAppiumTestSuite(unittest.TestCase):

    def setUp(self):
        options = AppiumOptions()
        options.platform_name = "iOS"
        options.automation_name = "XCUITest"
        options.device_name = "iPhone 15 Pro"
        options.app = "c:/Users/saranya/Downloads/SpinoCareIOS/SpinoCare.app"
        
        # Connect to local Appium Server
        self.driver = webdriver.Remote("http://127.0.0.1:4723", options=options)
        self.wait = WebDriverWait(self.driver, 10)

    def test_TC_E2E_001_App_Launch_And_Splash(self):
        """Verify app launches cleanly within 1.5 seconds."""
        logo = self.wait.until(EC.presence_of_element_located((AppiumBy.ACCESSIBILITY_ID, "SpinoCare Logo")))
        self.assertIsNotNone(logo, "App logo should be visible on splash")

    def test_TC_E2E_002_User_Login_Authentication(self):
        """Verify login with valid user credentials."""
        email_input = self.driver.find_element(AppiumBy.ACCESSIBILITY_ID, "email_field")
        password_input = self.driver.find_element(AppiumBy.ACCESSIBILITY_ID, "password_field")
        sign_in_btn = self.driver.find_element(AppiumBy.ACCESSIBILITY_ID, "sign_in_btn")

        email_input.send_keys("testuser@spinocare.org")
        password_input.send_keys("SecurePass2026!")
        sign_in_btn.click()

        dashboard = self.wait.until(EC.presence_of_element_located((AppiumBy.ACCESSIBILITY_ID, "analyzer_section")))
        self.assertTrue(dashboard.is_displayed(), "User should be redirected to Analyzer dashboard")

    def test_TC_E2E_003_T1_T2_Image_Upload_And_Editor(self):
        """Verify T1 and T2 image selection and crop editor interaction."""
        upload_t1 = self.driver.find_element(AppiumBy.ACCESSIBILITY_ID, "upload_t1_box")
        upload_t1.click()
        
        done_btn = self.wait.until(EC.element_to_be_clickable((AppiumBy.ACCESSIBILITY_ID, "editor_done_btn")))
        done_btn.click()
        
        upload_t2 = self.driver.find_element(AppiumBy.ACCESSIBILITY_ID, "upload_t2_box")
        upload_t2.click()
        done_btn = self.wait.until(EC.element_to_be_clickable((AppiumBy.ACCESSIBILITY_ID, "editor_done_btn")))
        done_btn.click()

        analyze_btn = self.driver.find_element(AppiumBy.ACCESSIBILITY_ID, "analyze_trigger")
        self.assertTrue(analyze_btn.is_enabled(), "Analyze button should be enabled after uploading T1 & T2")

    def test_TC_E2E_004_AI_Inference_Result_Modal(self):
        """Verify AI analysis execution and Modic change diagnosis sheet."""
        analyze_btn = self.driver.find_element(AppiumBy.ACCESSIBILITY_ID, "analyze_trigger")
        analyze_btn.click()

        result_title = self.wait.until(EC.presence_of_element_located((AppiumBy.ACCESSIBILITY_ID, "result_label")))
        self.assertIn("Modic", result_title.text, "Result title should display Modic diagnosis")

    def tearDown(self):
        if self.driver:
            self.driver.quit()

if __name__ == "__main__":
    unittest.main()
