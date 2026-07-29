# automation/selenium/pages/login_page.py
"""
Page Object representing the SpinoCare User & Clinician Login Interface.
"""

from selenium.webdriver.common.by import By
from .base_page import BasePage

class LoginPage(BasePage):
    # Locators
    EMAIL_INPUT = (By.ID, "email")
    PASSWORD_INPUT = (By.ID, "password")
    SUBMIT_BTN = (By.ID, "submit-btn")
    ERROR_MSG = (By.CLASS_NAME, "error-banner")
    SIGNUP_LINK = (By.XPATH, "//a[contains(@href, 'signup.html')]")
    FORGOT_PASS_LINK = (By.XPATH, "//a[contains(@href, 'forgot-password.html')]")
    APP_LOGO = (By.CLASS_NAME, "app-logo")

    def __init__(self, driver, base_url="http://localhost:8080"):
        super().__init__(driver)
        self.url = f"{base_url}/login.html"

    def navigate(self):
        self.open_url(self.url)

    def login(self, email, password):
        self.type_text(self.EMAIL_INPUT, email)
        self.type_text(self.PASSWORD_INPUT, password)
        self.click(self.SUBMIT_BTN)

    def get_auth_token_from_storage(self):
        return self.execute_script("return localStorage.getItem('spinocare_auth_token');")

    def is_logo_visible(self):
        return self.is_displayed(self.APP_LOGO)

    def click_signup(self):
        self.click(self.SIGNUP_LINK)

    def click_forgot_password(self):
        self.click(self.FORGOT_PASS_LINK)
