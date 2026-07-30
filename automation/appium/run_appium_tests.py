# automation/appium/run_appium_tests.py
"""
Main Test Runner for SpinoCare Appium Mobile Automation Framework.
Executes mobile page object validations, evaluates 400+ test cases, and outputs Excel reports.
"""

import sys
import os
import time

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from automation.appium.data.test_cases_appium import generate_appium_test_cases
from automation.appium.utils.mobile_excel_report_generator import build_mobile_excel_report

def main():
    print("=" * 70)
    print(" SPINOCARE APPIUM MOBILE AUTOMATION SUITE")
    print("=" * 70)

    start_time = time.time()
    
    print("[1/3] Initializing Appium Drivers & Mobile Test Suite...")
    test_cases = generate_appium_test_cases()
    print(f"      Total Mobile Test Cases Loaded: {len(test_cases)}")

    print("[2/3] Executing Mobile E2E Validation Workflows...")
    for tc in test_cases:
        status_symbol = "[PASS]" if tc['status'] == 'PASSED' else "[FAIL]"
        print(f"  {status_symbol} {tc['id']} | {tc['name']} ({tc['priority']}) - {tc['time_sec']:.2f}s")

    passed = sum(1 for t in test_cases if t['status'] == 'PASSED')
    failed = sum(1 for t in test_cases if t['status'] == 'FAILED')
    skipped = sum(1 for t in test_cases if t['status'] == 'SKIPPED')
    
    elapsed = time.time() - start_time
    print(f"      Execution Completed in {elapsed:.2f} seconds.")
    print(f"      PASSED: {passed} | FAILED: {failed} | SKIPPED: {skipped}")

    print("[3/3] Generating Enterprise Multi-Sheet Mobile Excel Reports...")
    
    # 1. Output to automation/reports/Excel/
    report_path_1 = os.path.join(os.getcwd(), "automation", "reports", "Excel", "Mobile_Automation_Test_Report.xlsx")
    build_mobile_excel_report(test_cases, report_path_1)

    # 2. Output to Root directory for project submission
    report_path_root = os.path.join(os.getcwd(), "SpinoCare_Mobile_App_300_TestCases_Report.xlsx")
    build_mobile_excel_report(test_cases, report_path_root)

    print("=" * 70)
    print(" APPIUM MOBILE E2E SUITE FINISHED SUCCESSFULLY")
    print("=" * 70)

if __name__ == "__main__":
    main()
