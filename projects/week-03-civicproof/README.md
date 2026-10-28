# CivicProof — AI Civic Grievance Triage & Deduplication Engine

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev)
[![Benchmark](https://img.shields.io/badge/Accuracy-100.0%25-brightgreen.svg)](./EVALUATION_REPORT.md)
[![Deduplication F1](https://img.shields.io/badge/Deduplication_F1-100.0%25-blue.svg)](./EVALUATION_REPORT.md)

> **Week 03 of the 10-Week AI Builder Challenge**  
> An automated civic triage and deduplication system designed for Indian municipal corporations (PMC, BBMP, BMC). CivicProof parses unstructured citizen complaints, routes them to the correct municipal engineering department, tags safety severity levels, and clusters duplicate complaints to eliminate redundant field dispatches.

---

## 🏛️ Problem Statement

Every monsoon and festive season, municipal portals receive tens of thousands of duplicate complaints:
- 15 citizens report the same uncovered manhole or deep pothole on a busy arterial junction.
- Redundant inspection crews get dispatched while unaddressed complaints languish.
- High-severity life-safety hazards (e.g. open manholes on unlit roads) get buried behind cosmetic complaints.

---

## ⚡ Solution Architecture

1. **Category Classification:** Categorizes complaints into 6 core domains:
   - `POTHOLE` → Roads & Traffic Infrastructure
   - `GARBAGE_DUMP` → Solid Waste Management & Sanitation
   - `BROKEN_STREETLIGHT` → Municipal Electrical Department
   - `WATER_LEAK` → Water Supply & Sewerage Board
   - `OPEN_MANHOLE` → Stormwater Drainage & Disaster Safety (Auto-escalated to `CRITICAL`)
   - `FALLEN_TREE` → Horticulture & Emergency Clearance
2. **Spatial & Semantic Deduplication:** Cross-analyzes category, landmark keywords, and incident descriptions. High confidence duplicates (>50% token overlap) are linked to existing tickets so citizens can upvote rather than trigger redundant work orders.
3. **Automated Triage Output:** Generates clean, actionable ticket titles and department assignments.

---

## 📊 Quantitative Evaluation Benchmark

Evaluated against 20 ground-truth municipal incidents across Indian urban civic domains. Read the full report: [`EVALUATION_REPORT.md`](./EVALUATION_REPORT.md).

| Metric | Measured Score | Target SLA |
| :--- | :--- | :--- |
| **Category Classification Accuracy** | **100.0%** (20/20) | ≥ 90.0% |
| **Duplicate Detection Recall** | **100.0%** | ≥ 85.0% |
| **Duplicate Detection Precision** | **100.0%** | ≥ 85.0% |
| **Duplicate Detection F1-Score** | **100.0%** | ≥ 85.0% |
| **Inference Latency** | **< 15 ms** | < 200 ms |

---

## 🚀 Quickstart

### 1. Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8002
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev -- --port 5175
```

### 3. Run Benchmark
```bash
python eval/evaluate.py
```
