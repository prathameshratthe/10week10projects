# BillMatch — GST Tax Invoice to Bank Statement Reconciliation

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev)
[![Precision](https://img.shields.io/badge/Precision-100.0%25-brightgreen.svg)](./EVALUATION_REPORT.md)
[![False Matches](https://img.shields.io/badge/False_Matches-0.0%25-brightgreen.svg)](./EVALUATION_REPORT.md)

> **Week 08 of the 10-Week AI Builder Challenge**  
> An automated accounts payable reconciliation engine for Indian enterprise finance teams. Matches GST purchase invoices against core banking statement debits, automatically tracks Section 194C / 194J TDS withholding deductions, resolves truncated bank narrations, and isolates phantom debits with zero false matches.

---

## 📊 Problem Statement

Accounts Payable teams face tedious month-end reconciliation bottlenecks:
- **TDS Withholding Variances:** A ₹1,00,000 vendor invoice is legally paid out as ₹90,000 (after 10% 194J TDS) or ₹98,000 (after 2% 194C TDS). Naive accounting matching algorithms fail on amount mismatch.
- **Truncated Bank Narrations:** Corporate core banking feeds truncate supplier names (e.g. `NEFT/CMS/APEX CLD/HDFC001/INV-101`).
- **Phantom Bank Debits:** Bank maintenance fees and unauthorized debit entries must be quarantined without falsely pairing to open vendor bills.

---

## ⚡ Solution Architecture

1. **Deterministic Multi-Tier Matching:**
   - **Tier 1 (Exact Net TDS Settlement):** Verifies `Debit Amount == Gross Amount - TDS` with embedded invoice/UTR references in bank narration.
   - **Tier 2 (Exact Gross Settlement):** Matches full value payments with zero TDS.
   - **Tier 3 (Fuzzy Narration Matching):** Resolves truncated supplier names with ±₹2 bank round-off tolerance.
   - **Tier 4 (Discrepancy Quarantine):** Unmatched invoices are flagged as `UNPAID_INVOICE`, and unrecognized bank debits as `UNMATCHED_BANK_TXN`.
2. **Statutory Tax Ledger:** Automatically tallies TDS withheld for Form 26Q and quarterly filing compliance.

---

## 📊 Quantitative Evaluation Benchmark

Evaluated across corporate GST purchase invoices and core banking statements. Read the full report: [`EVALUATION_REPORT.md`](./EVALUATION_REPORT.md).

| Metric | Measured Score | Target SLA | Status |
| :--- | :--- | :--- | :--- |
| **Matching Precision** | **100.0%** | 100.0% | PASS |
| **Matching Recall** | **100.0%** | ≥ 95.0% | PASS |
| **False Match Rate (False Positives)** | **0.0%** (0 false pairings) | 0.0% | PASS |
| **Matching F1-Score** | **100.0%** | ≥ 95.0% | PASS |
| **Reconciliation Latency** | **< 10 ms** | < 100 ms | PASS |

---

## 🚀 Quickstart

### 1. Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8007
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev -- --port 5180
```

### 3. Run Benchmark
```bash
python eval/evaluate.py
```
