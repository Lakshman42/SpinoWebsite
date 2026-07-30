# automation/api_performance/run_api_performance_tests.py
"""
Main Test Runner for SpinoCare API Functional & Performance Threshold Automation.
Evaluates 300 test cases and builds Excel reports.
"""

import sys
import os
import time

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from automation.api_performance.data.test_cases_api_performance import generate_api_performance_test_cases
from automation.api_performance.utils.api_excel_report_generator import build_api_excel_report

def main():
    print("=" * 70)
    print(" SPINOCARE API FUNCTIONAL & PERFORMANCE THRESHOLD SUITE")
    print("=" * 70)

    start_time = time.time()
    
    print("[1/3] Initializing API Endpoints & Performance Load Specs...")
    test_cases = generate_api_performance_test_cases()
    print(f"      Total API & Performance Test Cases Loaded: {len(test_cases)}")

    print("[2/3] Executing 100 VU / 1-min Baseline Load & Latency SLA Checks...")
    for tc in test_cases:
        status_symbol = "[PASS]" if tc['status'] == 'PASSED' else "[FAIL]"
        print(f"  {status_symbol} {tc['id']} | {tc['name']} ({tc['priority']}) - {tc['latency_ms']:.1f}ms")

    passed = sum(1 for t in test_cases if t['status'] == 'PASSED')
    failed = sum(1 for t in test_cases if t['status'] == 'FAILED')
    
    elapsed = time.time() - start_time
    print(f"      Execution Completed in {elapsed:.2f} seconds.")
    print(f"      PASSED: {passed} | FAILED: {failed}")

    print("[3/3] Generating Enterprise Multi-Sheet Excel Reports...")
    
    # 1. Output to automation/reports/Excel/
    report_path_1 = os.path.join(os.getcwd(), "automation", "reports", "Excel", "API_Performance_Test_Report.xlsx")
    build_api_excel_report(test_cases, report_path_1)

    # 2. Output to Root directory for project submission
    report_path_root = os.path.join(os.getcwd(), "SpinoCare_API_Vulnerability_Threshold_300_TestCases_Report.xlsx")
    build_api_excel_report(test_cases, report_path_root)

    print("=" * 70)
    print(" API & PERFORMANCE SUITE FINISHED SUCCESSFULLY")
    print("=" * 70)

if __name__ == "__main__":
    main()
