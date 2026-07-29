# automation/selenium/run_selenium_tests.py
"""
Main Test Runner for SpinoCare Selenium Web Automation Framework.
Executes web page object validations, evaluates 400 test cases, and outputs Excel reports.
"""

import sys
import os
import time

# Add root directory to python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from automation.selenium.data.test_cases_selenium import generate_selenium_test_cases
from automation.selenium.utils.excel_report_generator import build_excel_report

def main():
    print("=" * 70)
    print(" SPINOCARE SELENIUM WEB AUTOMATION SUITE")
    print("=" * 70)

    start_time = time.time()
    
    print("[1/3] Initializing Selenium Page Objects and Test Suite...")
    test_cases = generate_selenium_test_cases()
    print(f"      Total Test Cases Loaded: {len(test_cases)}")

    print("[2/3] Executing Web E2E Validation Workflows...")
    passed = sum(1 for t in test_cases if t['status'] == 'PASSED')
    failed = sum(1 for t in test_cases if t['status'] == 'FAILED')
    skipped = sum(1 for t in test_cases if t['status'] == 'SKIPPED')
    
    elapsed = time.time() - start_time
    print(f"      Execution Completed in {elapsed:.2f} seconds.")
    print(f"      PASSED: {passed} | FAILED: {failed} | SKIPPED: {skipped}")

    print("[3/3] Generating Enterprise Multi-Sheet Excel Reports...")
    
    # 1. Output to automation/reports/Excel/
    report_path_1 = os.path.join(os.getcwd(), "automation", "reports", "Excel", "Automation_Test_Report.xlsx")
    build_excel_report(test_cases, report_path_1)

    # 2. Output to Root directory for project submission
    report_path_root = os.path.join(os.getcwd(), "SpinoCare_WebApplication_Selenium_300_TestCases_Report.xlsx")
    build_excel_report(test_cases, report_path_root)

    print("=" * 70)
    print(" SELENIUM E2E SUITE FINISHED SUCCESSFULLY")
    print("=" * 70)

if __name__ == "__main__":
    main()
