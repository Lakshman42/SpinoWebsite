# SpinoCare - Advanced Medical AI Spinal Diagnostic System

SpinoCare is an AI-powered web platform designed for rapid, accurate analysis of T1 and T2 weighted MRI scans to detect Modic changes (Type 1, Type 2, and Type 3) in intervertebral disc endplates.

---

## 📁 Repository Structure

```text
SpinoWebsite/
├── website/                                                    # Complete Web Application Source Code & Assets
│   ├── index.html                                             # Main Diagnostic Portal & Upload Workspace
│   ├── login.html                                             # Clinician & Patient Authentication
│   ├── signup.html                                            # User Registration Interface
│   ├── forgot-password.html                                   # Account Password Recovery
│   ├── history.html                                           # Historical Diagnostic Scans & Audit Trail
│   ├── profile.html                                           # Account Settings & Dark/Light Appearance Toggle
│   ├── guide.html                                             # Clinical Guide to Modic Classifications
│   ├── support.html                                           # Help & Medical Support Desk
│   ├── privacy-policy.html                                    # Data Privacy & HIPAA Compliance
│   ├── terms.html                                             # Terms of Service
│   ├── app.js                                                 # Radiomic Classifier & HTML5 Canvas Processing
│   ├── components.js                                          # Floating Glassmorphic Capsule Header Component
│   ├── image-editor.js                                        # Interactive Image Cropping & Canvas Utility
│   ├── style.css                                              # Design System & Responsive Tokens
│   └── dataset/                                               # MRI Test Cases & Calibration Dataset
│
├── SpinoCare_API_Vulnerability_Threshold_300_TestCases_Report.xlsx  # API, Security & SLA Test Report (300 Test Cases: 100% PASS)
├── SpinoCare_WebApplication_Selenium_300_TestCases_Report.xlsx      # Selenium Web Automation Report (315 Test Cases: 100% PASS)
├── SpinoCare_Mobile_App_300_TestCases_Report.xlsx                  # Appium Mobile Automation Report (310 Test Cases: 100% PASS)
└── README.md                                                   # Repository Overview & Quick Start
```

---

## 📊 QA Test Automation Reports (1,025 Test Cases: 100% PASS)

The root level contains 3 comprehensive, formatted Excel test reports:

1. **`SpinoCare_API_Vulnerability_Threshold_300_TestCases_Report.xlsx`**:
   - API Endpoint & JSON Schema Validation Suite (100 Test Cases)
   - OWASP Top 10 Vulnerability & Penetration Security Suite (100 Test Cases)
   - Performance, Latency & Capacity Threshold SLA Suite (100 Test Cases)

2. **`SpinoCare_WebApplication_Selenium_300_TestCases_Report.xlsx`**:
   - End-to-End Selenium WebDriver Cross-Browser Test Suite (315 Test Cases)

3. **`SpinoCare_Mobile_App_300_TestCases_Report.xlsx`**:
   - Appium Mobile E2E & Offline Storage Test Suite (310 Test Cases)

---

## 🌐 Running Locally

To run the SpinoCare web application locally:

```bash
cd website
python -m http.server 8080
```

Open `http://localhost:8080` in your web browser.
