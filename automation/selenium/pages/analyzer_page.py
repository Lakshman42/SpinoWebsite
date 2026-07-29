# automation/selenium/pages/analyzer_page.py
"""
Page Object representing the SpinoCare Main Diagnostic Portal & MRI Crop Editor Interface.
"""

from selenium.webdriver.common.by import By
from .base_page import BasePage

class AnalyzerPage(BasePage):
    APP_LOGO = (By.CLASS_NAME, "app-logo")
    UPLOAD_T1_BOX = (By.ID, "upload-t1")
    UPLOAD_T2_BOX = (By.ID, "upload-t2")
    ANALYZE_TRIGGER = (By.ID, "analyze-trigger")
    RESULTS_MODAL = (By.ID, "results-modal")
    MODIC_CHANGE_RESULT = (By.ID, "modic-result-label")
    CONFIDENCE_SCORE = (By.ID, "confidence-score")
    CROP_CONFIRM_BTN = (By.ID, "crop-confirm-btn")

    def __init__(self, driver, base_url="http://localhost:8080"):
        super().__init__(driver)
        self.url = f"{base_url}/index.html"

    def navigate(self):
        self.open_url(self.url)

    def is_analyzer_visible(self):
        return self.is_displayed(self.APP_LOGO)

    def trigger_analysis(self):
        # Force enable analyze trigger via JS if needed and click
        self.execute_script("const btn = document.getElementById('analyze-trigger'); if(btn) { btn.disabled = false; btn.click(); }")

    def is_results_modal_open(self):
        return self.is_displayed(self.RESULTS_MODAL)
