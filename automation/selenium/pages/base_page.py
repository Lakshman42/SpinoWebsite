# automation/selenium/pages/base_page.py
"""
Base Page Object class providing foundational WebDriver interactions, explicit waits,
JavaScript execution, and screenshot capture mechanisms for Selenium E2E Automation.
"""

import os
from datetime import datetime
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By

class BasePage:
    def __init__(self, driver, timeout=10):
        self.driver = driver
        self.wait = WebDriverWait(driver, timeout)
        self.timeout = timeout

    def open_url(self, url):
        self.driver.get(url)

    def get_title(self):
        return self.driver.title

    def find(self, locator):
        return self.wait.until(EC.presence_of_element_located(locator))

    def find_visible(self, locator):
        return self.wait.until(EC.visibility_of_element_located(locator))

    def find_all(self, locator):
        return self.wait.until(EC.presence_of_all_elements_located(locator))

    def click(self, locator):
        element = self.wait.until(EC.element_to_be_clickable(locator))
        element.click()

    def type_text(self, locator, text):
        element = self.find_visible(locator)
        element.clear()
        element.send_keys(text)

    def get_text(self, locator):
        element = self.find_visible(locator)
        return element.text

    def is_displayed(self, locator):
        try:
            return self.find_visible(locator).is_displayed()
        except Exception:
            return False

    def execute_script(self, script, *args):
        return self.driver.execute_script(script, *args)

    def capture_screenshot(self, name_prefix="screenshot"):
        screenshots_dir = os.path.join(os.getcwd(), "automation", "reports", "Screenshots")
        os.makedirs(screenshots_dir, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{name_prefix}_{timestamp}.png"
        filepath = os.path.join(screenshots_dir, filename)
        self.driver.save_screenshot(filepath)
        return filepath
