# automation/appium/pages/mobile_login_page.py
"""
Mobile Page Object representing the SpinoCare Mobile App Authentication View.
"""

from .base_mobile_page import BaseMobilePage

class MobileLoginPage(BaseMobilePage):
    EMAIL_FIELD = "email_field"
    PASSWORD_FIELD = "password_field"
    SIGN_IN_BTN = "sign_in_btn"
    SPINO_LOGO = "SpinoCare Logo"

    def login_mobile(self, email, password):
        self.type_text(self.EMAIL_FIELD, email)
        self.type_text(self.PASSWORD_FIELD, password)
        self.click(self.SIGN_IN_BTN)
