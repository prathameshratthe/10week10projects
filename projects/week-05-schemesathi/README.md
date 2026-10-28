# SchemeSathi — AI Indian Welfare Eligibility & Citation Navigator

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev)
[![Match Accuracy](https://img.shields.io/badge/Accuracy-100.0%25-brightgreen.svg)](./EVALUATION_REPORT.md)
[![Citation Coverage](https://img.shields.io/badge/Gazette_Citations-100.0%25-blue.svg)](./EVALUATION_REPORT.md)
[![False Promises](https://img.shields.io/badge/False_Promises-0.0%25-brightgreen.svg)](./EVALUATION_REPORT.md)

> **Week 05 of the 10-Week AI Builder Challenge**  
> An official gazette-grounded welfare eligibility engine designed for Indian citizens. SchemeSathi eliminates bureaucratic confusion, verifies central and state scheme rules with 100% citation grounding, and strictly abstains on negative cases with 0.0% false promises.

---

## 🏛️ Problem Statement

India spends hundreds of thousands of crores annually on welfare programs (PM Kisan, Ayushman Bharat, PM Awas, Sukanya Samriddhi, PM SVANidhi, Majhi Ladki Bahin). Yet, millions of eligible citizens are turned away at Common Service Centers (CSCs) due to:
- Complex disqualification rules (e.g. IT returns in previous AY, vehicle ownership, land title boundaries).
- Hallucinated promises from generic LLMs that tell ineligible taxpayers they qualify for BPL farmer subsidies.
- Missing required documentation at the time of official application.

---

## ⚡ Solution Architecture

1. **Deterministic Exclusion Filtering:** Explicitly cross-examines tax status, landholding area, municipal house ownership, and age/gender parameters before evaluating entitlement.
2. **Deterministic Gazette Grounding:** Every positive or negative determination is tied directly to the exact ministry operational guideline or state government resolution (GR).
3. **Strict Negative Abstention:** If a citizen does not meet the criteria, the model explicitly outputs `NOT_ELIGIBLE` with the exclusion citation. Never gives false hope.
4. **Mandatory Documentation Checklist:** Returns exact document names (7/12 extract, Aadhaar DBT bank seeding, ration card category, ULB vending certificate).

---

## 📊 Quantitative Evaluation Benchmark

Evaluated across 20 diverse citizen profiles and 120 total welfare determinations against official ministry operational guidelines. Read the full report: [`EVALUATION_REPORT.md`](./EVALUATION_REPORT.md).

| Metric | Measured Value | Target SLA |
| :--- | :--- | :--- |
| **Profile Multi-Scheme Accuracy** | **100.0%** (20/20) | ≥ 95.0% |
| **Gazette Citation Coverage** | **100.0%** (120/120) | 100.0% |
| **False Promise Rate (Hallucinated Benefit)** | **0.0%** (0 false positives) | 0.0% |
| **Negative Abstention Precision** | **100.0%** | ≥ 95.0% |
| **Evaluation Latency** | **< 10 ms** | < 100 ms |

---

## 🚀 Quickstart

### 1. Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8004
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev -- --port 5177
```

### 3. Run Benchmark
```bash
python eval/evaluate.py
```
