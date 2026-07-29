# automation/selenium/utils/driver_factory.py
"""
Driver Factory utility for instantiating headless Chrome & Edge WebDrivers configured
with --no-sandbox, --disable-dev-shm-usage, and --headless for CI/CD compatibility.
"""

from selenium import webdriver

class DriverFactory:
    @staticmethod
    def get_chrome_driver(headless=True):
        options = webdriver.ChromeOptions()
        if headless:
            options.add_argument("--headless=new")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-gpu")
        options.add_argument("--window-size=1920,1080")
        return webdriver.Chrome(options=options)
