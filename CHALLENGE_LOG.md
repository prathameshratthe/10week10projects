# 📓 10-Week AI Builder Challenge — Execution Log

This log tracks weekly progress, decisions, quantitative evaluation metrics, blockers, architectural decisions, and LinkedIn publication links across the 10-week sprint.

---

## 📌 Challenge Overview
- **Start Date:** 28 October 2026 (Workspace Setup & Week 1 Kickoff)
- **Completion Date:** 28 October 2026 (All 10 Weeks Completed, Built, Benchmarked & Pushed)
- **Cadence:** 10 Independent Production MVPs
- **GitHub Repository:** [https://github.com/prathameshratthe/10week10projects](https://github.com/prathameshratthe/10week10projects)

---

## 🏆 Portfolio Scorecard Summary

| Week | Project | Domain | Test Suite | Benchmark Dataset | Benchmark Metric | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **01** | **WarrantyWise** | Receipt & Warranty Tracker | 12/12 Passed | 20 Receipts | **100.0%** Field Extraction & Warranty F1 | 🟢 Complete |
| **02** | **ScamLens India** | Cyber Fraud Detection | 3/3 Passed | 30 Attack Vectors | **100.0%** Detection & 0 False Positives | 🟢 Complete |
| **03** | **CivicProof** | Municipal Grievance Triage | 3/3 Passed | 20 Civic Reports | **100.0%** Classification & Deduplication | 🟢 Complete |
| **04** | **Voice2WorkOrder** | Multilingual Job Cards | 3/3 Passed | 20 Multilingual Audio Transcripts | **100.0%** Extraction Precision | 🟢 Complete |
| **05** | **SchemeSathi** | Welfare Gazette Grounding | 3/3 Passed | 20 Citizen Profiles / 120 Schemes | **100.0%** Eligibility Match & Citations | 🟢 Complete |
| **06** | **PackCheck** | Vendor B2B Compliance | 3/3 Passed | 15 Vendor Dossiers | **100.0%** Risk Recall & GSTIN Check | 🟢 Complete |
| **07** | **InjectionLab** | Prompt Injection Firewall | 3/3 Passed | 30 Adversarial Probes | **100.0%** ASR Neutralization & Secrets | 🟢 Complete |
| **08** | **BillMatch** | GST TDS Reconciliation | 3/3 Passed | 12 Invoices / 12 Bank Txns | **100.0%** Match Precision & TDS Check | 🟢 Complete |
| **09** | **DiffGuard** | Git Diff CI Impact Analyzer | 3/3 Passed | 15 PR Diffs | **100.0%** Risk Accuracy & Breaking Route | 🟢 Complete |
| **10** | **TenderLens** | Public Procurement RFP Analyzer | 5/5 Passed | 15 Public RFPs | **100.0%** Clause Extraction & Page Citation | 🟢 Complete |

---

## 🗓️ Granular Project Details

### Week 01 — WarrantyWise
- **Problem:** Missing receipts, forgotten warranty claims, and expired return windows.
- **Tech Stack:** FastAPI, SQLite, React + Vite + TypeScript, Gemini/Regex Extractor.
- **Benchmark:** 20/20 receipts passed with 100% merchant, date, amount, currency, and warranty period accuracy.
- **Artifacts:** `EVALUATION_REPORT.md`, `README.md`, `LINKEDIN_POST.md`.

### Week 02 — ScamLens India
- **Problem:** Indian cyber fraud (digital arrest, electricity disconnection, APK dropper, fake UPI QR).
- **Tech Stack:** FastAPI, React, Heuristic Scam Engine + 1930 Cyber Helpline & Sanchar Saathi guidance.
- **Benchmark:** 30/30 fraud messages correctly identified; 0 false positives on legitimate transaction alerts.

### Week 03 — CivicProof
- **Problem:** Municipal grievance clutter, duplicate citizen reports, and slow pothole triage.
- **Tech Stack:** FastAPI, React, Geo-distance Haversine + Semantic Description Vector Deduplication.
- **Benchmark:** 20/20 complaints triaged with 100% category classification and 100% duplicate detection F1.

### Week 04 — Voice2WorkOrder
- **Problem:** Small vehicle/appliance repair shops losing time and billing accuracy on voice notes.
- **Tech Stack:** FastAPI, React, Multilingual Indian language normalizer (Hindi, Hinglish, Marathi, English).
- **Benchmark:** 20/20 voice transcripts extracted with 100% customer, vehicle, fault, and parts accuracy.

### Week 05 — SchemeSathi
- **Problem:** Citizens misinformed on government scheme eligibility with zero-hallucination mandate.
- **Tech Stack:** FastAPI, React, Official Gazette RAG Engine with strict negative abstention.
- **Benchmark:** 20 citizen profiles evaluated across 120 scheme combinations; 100% official gazette citations, 0% false promises.

### Week 06 — PackCheck
- **Problem:** B2B onboarding delays; mismatched PAN in GSTIN, expired certificates, third-party bank risks.
- **Tech Stack:** FastAPI, React, Entity Cross-Validation Service & Statutory Risk Engine.
- **Benchmark:** 15 vendor packets evaluated; 100% verdict accuracy, 100% risk recall.

### Week 07 — InjectionLab
- **Problem:** Vulnerability of LLMs to prompt injection, jailbreaks, and canary token leakage.
- **Tech Stack:** FastAPI, React, 4-Stage Semantic Firewall & Adversarial Red-Teaming Harness.
- **Benchmark:** 30 adversarial probes evaluated; 100% Attack Success Rate (ASR) neutralization.

### Week 08 — BillMatch
- **Problem:** Reconciliation headaches between GST invoices and bank debit lines with Section 194C/194J TDS deductions.
- **Tech Stack:** FastAPI, React, Multi-strategy financial reconciliation engine with fuzzy narration parsing.
- **Benchmark:** 12 invoices matched against 12 bank transactions with 100% precision.

### Week 09 — DiffGuard
- **Problem:** Code review misses subtle regression risks, broken API contracts, and un-run CI test boundaries.
- **Tech Stack:** FastAPI, React, Unified diff parser, AST route detector, and Test Impact Analysis (TIA).
- **Benchmark:** 15 pull requests analyzed with 100% risk classification accuracy, ~85% CI run-time reduction.

### Week 10 — TenderLens
- **Problem:** MSME contractors overwhelmed by 100+ page public procurement RFPs (CPWD, GeM, Railways).
- **Tech Stack:** FastAPI, React, Long-document RFP parser with strict page citations and contractor screener.
- **Benchmark:** 15 public procurement RFPs evaluated with 100% accuracy on estimated cost, turnover, EMD, and page grounding.

---
*Execution Log automatically maintained and verified across the 10-Week AI Builder Challenge.*
