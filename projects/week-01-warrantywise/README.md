# 🛡️ WarrantyWise — Intelligent Receipt & Warranty Protection Vault

> **10-Week AI Builder Challenge** | Week 01 of 10  
> **Challenge Release Date:** 30 October 2026  
> **Status:** 🟢 Deployed MVP (Verified & Tested)  
> **Evaluation Accuracy:** **100.0%** Field-Level Accuracy across 20 Ground-Truth Test Receipts  
> **Unit & Integration Tests:** **12 Passed / 0 Failed**

---

## 📌 The Real-World Problem
Consumers lose physical receipts and misplace digital invoices, routinely forgetting return deadlines and warranty claim windows. An estimated billions of dollars in eligible warranty repairs and 30-day consumer return refunds are forfeited every year simply because buyers can't find proof of purchase or don't realize their coverage has expired.

Existing generic document scanning apps store static images without understanding critical business terms. They fail to:
1. Distinguish **explicitly stated warranty terms** from nonexistent warranties.
2. Calculate return policy deadlines based on purchase date and retailer policies.
3. Provide an interactive correction interface for optical or textual extraction errors before persistence.

---

## 💡 Solution: WarrantyWise
**WarrantyWise** is an intelligent purchase record keeper and warranty expiration tracker:
- **Upload Any Receipt:** Drag and drop PDF invoices, physical store receipts, photos, or TXT slips.
- **Zero Hallucination Extraction:** Powered by a dual-engine architecture (Google Gemini 2.0 Multimodal Vision / OpenAI structured outputs with a deterministic heuristic fallback). The system strictly enforces that `has_explicit_warranty` is marked `True` **only** if the text explicitly states a warranty period.
- **Interactive Human-in-the-Loop Review:** Side-by-side verification modal allowing users to inspect raw OCR text, correct merchant names, update line items, and adjust duration months or return days.
- **Smart Countdown Vault:** Real-time countdowns (`133 days remaining`, `Expiring in 7 days!`), visual progress bars, and urgency alerts.
- **Printable Claim Proof:** One-click generation of an official Warranty Claim Certificate with complete item breakdowns and proof metadata.
- **Universal Data Export:** RFC 4180 compliant CSV export and structured JSON download.

---

## 🛠️ Architecture & System Design

```
┌────────────────────────────────────────────────────────┐
│              Client (React + Vite + TS)                │
│  - Tailwind CSS glassmorphic dark theme                │
│  - Drag-and-drop uploader with sample receipt presets  │
│  - Side-by-side human review modal                     │
│  - Live countdown cards & dense table toggle           │
└───────────────────────────┬────────────────────────────┘
                            │ REST API / JSON
                            ▼
┌────────────────────────────────────────────────────────┐
│             FastAPI Application Gateway                │
│  - Pydantic v2 strict schemas & input sanitization     │
│  - File type validation (PDF, JPG, PNG, WEBP, TXT)     │
│  - Static receipt mount & CORS middleware              │
└──────────────┬──────────────────────────┬──────────────┘
               │                          │
               ▼                          ▼
┌──────────────────────────────┐ ┌───────────────────────┐
│     AI Extractor Engine      │ │  SQLite Database &    │
│ - Google Gemini 2.0 Flash    │ │  SQLAlchemy ORM       │
│ - OpenAI Structured Output   │ │ - PurchaseRecord      │
│ - Deterministic Regex Parser │ │ - ReceiptItem         │
│ - Zero-Fabrication Auditing  │ │ - CSV / JSON Exporters│
└──────────────────────────────┘ └───────────────────────┘
```

---

## 🧪 Quantitative Evaluation & Benchmarks

The extraction pipeline was benchmarked against **20 curated, ground-truth labeled receipts** spanning electronics, home appliances, groceries, apparel, tools, and Indian e-commerce (INR ₹).

See full report: **[EVALUATION_REPORT.md](./EVALUATION_REPORT.md)**

| Evaluated Field | Ground Truth Size | Measured Result | Status |
| :--- | :---: | :---: | :---: |
| **Merchant Name Accuracy** | 20 / 20 | **100.0%** | 🟢 PASS |
| **Purchase Date Normalization (ISO YYYY-MM-DD)** | 20 / 20 | **100.0%** | 🟢 PASS |
| **Total Amount Precision (±0.05 tolerance)** | 20 / 20 | **100.0%** | 🟢 PASS |
| **Currency Identification (₹, $, €, £)** | 20 / 20 | **100.0%** | 🟢 PASS |
| **Explicit Warranty Classification (F1 Score)** | 20 / 20 | **100.0%** | 🟢 PASS |
| **Warranty Duration (Months) Accuracy** | 14 / 14 | **100.0%** | 🟢 PASS |
| **Explicit Return Window Detection (F1 Score)** | 20 / 20 | **100.0%** | 🟢 PASS |
| **Return Window Days Accuracy** | 17 / 17 | **100.0%** | 🟢 PASS |

### Zero Hallucination Standard
All receipts lacking a warranty statement (e.g. Trader Joe's groceries, Starbucks coffee, McDonald's meal) correctly resulted in `has_explicit_warranty = False` and `0` false positives.

To reproduce the benchmark:
```bash
cd projects/week-01-warrantywise/backend
.venv\Scripts\python ..\eval\evaluate.py
```

---

## 🚀 Quickstart & Setup

### Prerequisites
- Python 3.12+ (tested on Python 3.13)
- Node.js 20+

### Option A: Local Development

#### 1. Backend Setup
```bash
cd projects/week-01-warrantywise/backend
python -m venv .venv

# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```
API Documentation will be live at `http://127.0.0.1:8000/docs`.

#### 2. Frontend Setup
```bash
cd projects/week-01-warrantywise/frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

### Option B: Docker Compose
```bash
cd projects/week-01-warrantywise
docker-compose up --build
```
Access the application on `http://localhost:8000`.

---

## 🧪 Automated Test Suite
WarrantyWise includes 12 comprehensive unit and integration tests covering Pydantic validation, schema boundaries, edge cases, extraction zero-hallucination rules, and full API CRUD endpoints.

```bash
cd projects/week-01-warrantywise/backend
.venv\Scripts\pytest -v
```
Output:
```
============================= 12 passed in 2.10s ==============================
```

---

## ⚠️ Known Limitations & Failure Modes
1. **Low-Contrast Physical Thermal Receipts:** Thermal receipts degraded by sunlight or friction require pre-processing (gamma/contrast equalization) for optimal optical reading.
2. **Tiered Component Warranties:** Items with split clauses (e.g. "1 year unit, 5 years compressor") extract the primary base warranty; users can inspect and refine multi-part warranties in the review modal.
3. **Statutory Implied Warranties:** WarrantyWise does not infer statutory implied legal guarantees (e.g., EU 2-year statutory consumer conformity) unless explicitly printed on the physical receipt.

---

## 📜 Deliverables Checklist
- [x] Working, fully functional web application with React + Vite + Tailwind CSS
- [x] FastAPI modular backend with SQLite persistence
- [x] Provider-agnostic AI extraction (Gemini / OpenAI / Deterministic rule fallback)
- [x] Zero-hallucination warranty auditing
- [x] Human review and field correction modal
- [x] RFC 4180 CSV & structured JSON data exports
- [x] Printable Warranty Claim Certificate
- [x] 20 sample test receipt dataset with ground-truth verification
- [x] Automated evaluation script & detailed `EVALUATION_REPORT.md`
- [x] 12 unit and integration tests passing (`pytest`)
- [x] Dockerfile and `docker-compose.yml`
- [x] Complete README, `.env.example`, and LinkedIn launch post
