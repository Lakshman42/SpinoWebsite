# automation/selenium/pages/signup_page.py
"""
Page Object representing the SpinoCare User Registration Interface.
"""

from selenium.webdriver.common.by import By
from .base_page import BasePage

class SignupPage(BasePage):
    FULLNAME_INPUT = (By.ID, "fullname")
    EMAIL_INPUT = (By.ID, "email")
    PASSWORD_INPUT = (By.ID, "password")
    CONFIRM_PASSWORD_INPUT = (By.ID, "confirm_password")
    ROLE_SELECT = (By.ID, "role")
    TERMS_CHECKBOX = (By.ID, "terms_agree")
    REGISTER_BTN = (By.ID, "register-btn")
    LOGIN_LINK = (By.XPATH, "//a[contains(@href, 'login.html')]")

    def __init__(self, driver, base_url="http://localhost:8080"):
        super().__init__(driver)
        self.url = f"{base_url}/signup.html"

    def navigate(self):
        self.open_url(self.url)

    def register_user(self, name, email, password, role="clinician"):
        self.type_text(self.FULLNAME_INPUT, name)
        self.type_text(self.EMAIL_INPUT, email)
        self.type_text(self.PASSWORD_INPUT, password)
        self.type_text(self.CONFIRM_PASSWORD_INPUT, password)
        if self.is_displayed(self.TERMS_CHECKBOX):
            self.click(self.TERMS_CHECKBOX)
        if self.is_displayed(self.REGISTER_BTN):
            self.click(self.REGISTER_BTN)
