# PackCheck — B2B Vendor Compliance & Document Verification Engine

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev)
[![Verdict Accuracy](https://img.shields.io/badge/Accuracy-100.0%25-brightgreen.svg)](./EVALUATION_REPORT.md)
[![Risk Catch Rate](https://img.shields.io/badge/Risk_Recall-100.0%25-blue.svg)](./EVALUATION_REPORT.md)

> **Week 06 of the 10-Week AI Builder Challenge**  
> An automated enterprise vendor onboarding verification engine. Cross-reconciles statutory tax documents (GSTIN vs PAN characters 3-12), detects third-party beneficiary payout risks, flags lapsed certifications (ISO/MSME), and generates audit-ready compliance scorecards.

---

## 🏢 Problem Statement

Enterprise accounts payable and procurement teams spend 45+ minutes manually scrutinizing PDF document packs for each supplier:
- **Tax Contradictions:** A vendor provides a genuine PAN card, but enters a GSTIN belonging to a different sister firm or individual (synthetic identity fraud).
- **Embezzlement Exposure:** An invoice quotes a corporate vendor name, but the attached cancelled cheque belongs to an individual personal savings account.
- **Lapsed Statutory Credentials:** Vendors submit expired ISO 9001 quality certificates or obsolete Udyog Aadhaar filings.

---

## ⚡ Solution Architecture

1. **Mandatory Baseline Verification:** Verifies mandatory presence of GST Certificate, PAN Card, and Cancelled Corporate Cheque.
2. **PAN-in-GSTIN Substring Alignment:** Characters 3 through 12 of India's 15-character GSTIN represent the PAN of the legal entity. Immediate hard rejection triggers if standalone PAN differs.
3. **Third-Party Payment Safeguard:** Performs token similarity analysis between registered corporate entity name and bank cheque account title.
4. **Credential Expiry Tracking:** Identifies lapsed certifications against current temporal anchors.
5. **Audit-Ready Scorecard:** Computes 0-100 compliance health score and emits an unambiguous onboarding decision: `APPROVED`, `CONDITIONAL_APPROVAL`, or `REJECTED`.

---

## 📊 Quantitative Evaluation Benchmark

Evaluated across 15 real-world vendor onboarding dossiers featuring authentic edge cases. Read the full report: [`EVALUATION_REPORT.md`](./EVALUATION_REPORT.md).

| Metric | Measured Value | Target SLA |
| :--- | :--- | :--- |
| **Onboarding Verdict Accuracy** | **100.0%** (15/15) | ≥ 90.0% |
| **Risk Flag Catch Recall** | **100.0%** | ≥ 95.0% |
| **Risk Flag Precision** | **100.0%** | ≥ 95.0% |
| **Risk Flag F1-Score** | **100.0%** | ≥ 95.0% |
| **Verification Latency** | **< 15 ms** | < 200 ms |

---

## 🚀 Quickstart

### 1. Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8005
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev -- --port 5178
```

### 3. Run Benchmark
```bash
python eval/evaluate.py
```
