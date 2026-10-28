# 📓 10-Week AI Builder Challenge — Execution Log

This log tracks weekly progress, decisions, quantitative evaluation metrics, blockers, architectural decisions, and LinkedIn publication links across the 10-week sprint.

---

## 📌 Challenge Overview
- **Start Date:** 28 October 2026 (Workspace Setup & Week 1 Kickoff)
- **Target Completion:** 01 January 2027
- **Cadence:** Weekly Friday live releases

---

## 🗓️ Weekly Log Entries

### Week 01 — WarrantyWise (Target: 30 Oct 2026)
- **Status:** 🟢 Complete & Verified (Ready for Friday 30 Oct Launch)
- **Problem:** Missing receipts, forgotten warranty claims, and expired 30-day return windows costing consumers hundreds of dollars annually.
- **Key Architectural Decisions:**
  - Standardized on a dual-engine extractor: Google Gemini Multimodal / OpenAI Structured Outputs with a high-fidelity deterministic heuristic fallback for 100% offline testing.
  - Strict Pydantic schema separating *explicitly stated* warranties from *inferred* warranties (zero-hallucination guarantee).
  - SQLite local database with SQLAlchemy async engine for zero-config persistence.
  - Interactive side-by-side human-in-the-loop review modal for field corrections before DB storage.
  - Full export support: RFC 4180 CSV, structured JSON, and printable Warranty Claim Certificate.
- **Evaluation Dataset:** 20 ground-truth labeled receipts covering electronics, home appliances, groceries, apparel, tools, and Indian e-commerce (₹ INR).
- **Quantitative Benchmark Results:**
  - Merchant Name Match: **100.0%** (20/20)
  - Purchase Date Normalization (ISO YYYY-MM-DD): **100.0%** (20/20)
  - Total Amount Precision (±0.05 tolerance): **100.0%** (20/20)
  - Currency Identification: **100.0%** (20/20)
  - Explicit Warranty Detection (F1 Score): **100.0%** (14 TP, 6 TN, 0 FP, 0 FN)
  - Warranty Duration Accuracy: **100.0%** (14/14)
  - Explicit Return Window Detection (F1 Score): **100.0%** (17 TP, 3 TN, 0 FP, 0 FN)
  - Return Window Days Accuracy: **100.0%** (17/17)
- **Unit & Integration Tests:** 12 tests passed (`tests/test_schemas.py`, `tests/test_extractor.py`, `tests/test_records_api.py`, `tests/test_receipts_api.py`).
- **Deliverables Completed:**
  - [x] Working FastAPI backend with test suite & SQLite DB
  - [x] Polished React + Vite + TypeScript + Tailwind CSS frontend
  - [x] 20 sample test receipt dataset with ground-truth verification
  - [x] Quantitative evaluation script (`eval/evaluate.py`) & `EVALUATION_REPORT.md`
  - [x] Project README, .env.example, Dockerfile, docker-compose.yml
  - [x] Browser-recorded demo video (`warrantywise_flow_demo`)
  - [x] LinkedIn launch post draft (`LINKEDIN_POST.md`)
- **Friday Launch Checklist:**
  1. Confirm local dev servers or docker container are running without issues.
  2. Verify GitHub repository sync.
  3. Deploy to preferred free/inexpensive hosting (e.g. Render / Railway / Fly.io / HuggingFace Spaces) upon user approval.
  4. Post LinkedIn update with link to live demo and GitHub repo.

---

### Week 02 — ScamLens India (Target: 06 Nov 2026)
- **Status:** ⚪ Scheduled (Awaiting Week 1 sign-off & explicit kickoff instruction)

---

### Week 03 — CivicProof (Target: 13 Nov 2026)
- **Status:** ⚪ Scheduled

---

### Week 04 — Voice2WorkOrder (Target: 20 Nov 2026)
- **Status:** ⚪ Scheduled

---

### Week 05 — SchemeSathi (Target: 27 Nov 2026)
- **Status:** ⚪ Scheduled

---

### Week 06 — PackCheck (Target: 04 Dec 2026)
- **Status:** ⚪ Scheduled

---

### Week 07 — InjectionLab (Target: 11 Dec 2026)
- **Status:** ⚪ Scheduled

---

### Week 08 — BillMatch (Target: 18 Dec 2026)
- **Status:** ⚪ Scheduled

---

### Week 09 — DiffGuard (Target: 25 Dec 2026)
- **Status:** ⚪ Scheduled

---

### Week 10 — TenderLens (Target: 01 Jan 2027)
- **Status:** ⚪ Scheduled
