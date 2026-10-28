# Voice2WorkOrder — Multilingual Speech to Commercial Work Orders

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev)
[![Accuracy](https://img.shields.io/badge/Extraction_Accuracy-100.0%25-brightgreen.svg)](./EVALUATION_REPORT.md)
[![Zero Hallucination](https://img.shields.io/badge/Parts_Precision-100.0%25-blue.svg)](./EVALUATION_REPORT.md)

> **Week 04 of the 10-Week AI Builder Challenge**  
> Converts messy, informal technician voice notes and dictations (in Hindi, Hinglish, Marathi, and English) into structured commercial work orders, itemized billable invoices, and printable job cards.

---

## 🔧 Problem Statement

Field service technicians (AC technicians, plumbers, electricians, carpenters, appliance mechanics) rarely type structured tickets on tiny smartphone keyboards while standing in dark stairwells or mechanical rooms. Instead, they record voice notes or take mental notes.

The result:
- Lost billable hours (technicians estimate hours days later from memory).
- Forgotten replacement parts (van stock unbilled, hurting company margins).
- Vague customer invoices leading to payment disputes.

---

## ⚡ Solution Architecture

1. **Multilingual Speech Ingestion:** Accepts speech audio or transcripts in Hindi, Hinglish, Marathi, and English.
2. **Vernacular Idiom Normalization:**
   - Dialectical time expressions (`"dedh ghanta"`, `"dhai ghante"`, `"ardha taas"`, `"2 hours"`) are automatically mapped to precise decimal billable hours (1.5h, 2.5h, 0.5h, 2.0h).
3. **Trade Categorization:** Classifies work into HVAC, Plumbing, Electrical, Appliance Repair, and Carpentry.
4. **Itemized Billing Engine:** Pre-populates catalog rates (e.g. ₹450/hr labor + hardware components like MCBs, capacitors, ball valves, Teflon tape).
5. **Printable Job Card:** Emits clean printable HTML/PDF job cards formatted with timestamps and itemized costs.

---

## 📊 Quantitative Evaluation Benchmark

Evaluated against 20 authentic field technician dictations in Hindi, Hinglish, Marathi, and English. Read the full report: [`EVALUATION_REPORT.md`](./EVALUATION_REPORT.md).

| Metric | Measured Accuracy | Target SLA |
| :--- | :--- | :--- |
| **Trade Classification Accuracy** | **100.0%** (20/20) | ≥ 90.0% |
| **Labor Hours Extraction Accuracy** | **100.0%** (20/20) | ≥ 90.0% |
| **Parts Detection Accuracy (0 Hallucination)** | **100.0%** (20/20) | ≥ 90.0% |
| **Priority Level Accuracy** | **100.0%** (20/20) | ≥ 85.0% |
| **Overall Multi-Field Accuracy** | **100.0%** | ≥ 90.0% |

---

## 🚀 Quickstart

### 1. Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8003
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev -- --port 5176
```

### 3. Run Benchmark
```bash
python eval/evaluate.py
```
