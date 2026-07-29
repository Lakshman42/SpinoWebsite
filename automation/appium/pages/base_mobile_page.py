# automation/appium/pages/base_mobile_page.py
"""
Base Mobile Page Object class providing foundational Appium driver interactions,
accessibility ID lookups, touch gestures, and device screenshot utilities.
"""

import os
from datetime import datetime

class BaseMobilePage:
    def __init__(self, driver, timeout=10):
        self.driver = driver
        self.timeout = timeout

    def find_by_accessibility_id(self, acc_id):
        if not self.driver:
            return None
        return self.driver.find_element("accessibility id", acc_id)

    def click(self, acc_id):
        element = self.find_by_accessibility_id(acc_id)
        if element:
            element.click()

    def type_text(self, acc_id, text):
        element = self.find_by_accessibility_id(acc_id)
        if element:
            element.clear()
            element.send_keys(text)

    def capture_device_screenshot(self, name_prefix="mobile_screenshot"):
        screenshots_dir = os.path.join(os.getcwd(), "automation", "reports", "Screenshots")
        os.makedirs(screenshots_dir, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filepath = os.path.join(screenshots_dir, f"{name_prefix}_{timestamp}.png")
        if self.driver:
            self.driver.save_screenshot(filepath)
        return filepath
