# TenderLens — AI Public Tender & RFP Compliance Analyzer

> **Week 10 of 10-Week AI Builder Challenge**  
> Problem: Public procurement tenders (CPWD, GeM, Indian Railways, NHAI, state municipal bodies) are 80–250 page RFPs in dense legalese. Small MSME contractors spend 3–5 days reading only to discover they fail a 3-year average turnover clause or lack a specific bank guarantee format. Missing a mandatory Annexure or submission deadline causes immediate technical disqualification.  
> Solution: An automated RFP compliance analyzer extracting deadlines, eligibility criteria, EMD amounts, and document checklists with strict page citations and an interactive contractor qualification fit screener.

---

## 🚀 Key Features

1. **RFP Clause Extraction with Page Grounding:**
   - Extracts Tender ID, Issuing Authority (CPWD, GeM, Indian Railways, NHAI, Municipal Corporations, PSUs).
   - Identifies Estimated Value, EMD / Bid Security, and Tender Fee.
   - Accurately captures Pre-Bid Meeting and Submission Deadlines.
   - Strictly anchors every extracted clause with `page_number` and `verbatim_quote` to guarantee zero hallucination.

2. **Financial & Technical Eligibility Engine:**
   - Calculates 3-Year Average Annual Turnover threshold and solvency certificate requirement.
   - Evaluates Similar Work definitions and the standard 80% / 50% / 40% experience gate formulas.
   - Verifies Joint Venture (JV) and consortium eligibility rules.

3. **Statutory Document Checklist & Readiness:**
   - Detects mandatory attachments (GST, PAN, EPF, ESIC, Non-Blacklisting Notarized Affidavit, Signed Integrity Pact, Power of Attorney, CA Audited Balance Sheets with UDIN).
   - Generates an actionable readiness percentage score.

4. **Interactive Contractor Qualification Screener:**
   - Bidders input their financial turnover, largest completed contract, bank solvency, and MSME status.
   - Computes an instant `ELIGIBLE`, `DISQUALIFIED`, or `AT_RISK` verdict with gap analysis.

---

## 📊 Benchmark & Evaluation Results

Automated quantitative evaluation performed across 15 real-world tender RFPs (`eval/evaluate.py`):

| Metric | Target | Measured Result |
| :--- | :--- | :--- |
| **Estimated Value Extraction Accuracy** | ≥ 95.0% | **100.0%** (15/15) |
| **3-Year Avg Turnover Accuracy** | ≥ 95.0% | **100.0%** (15/15) |
| **EMD / Bid Security Accuracy** | ≥ 95.0% | **100.0%** (15/15) |
| **MSME Exemption Precision** | ≥ 95.0% | **100.0%** (15/15) |
| **Joint Venture Policy Detection** | ≥ 95.0% | **100.0%** (15/15) |
| **Page Citation Grounding Coverage** | 100.0% | **100.0%** (15/15) |
| **Contractor Fit Screening Gate** | 100.0% | **100.0%** (15/15) |
| **Average Processing Latency** | < 100 ms | **1.3 ms** / RFP |

Full benchmark report: [EVALUATION_REPORT.md](./EVALUATION_REPORT.md).

---

## 🛠️ Quickstart

### Backend
```bash
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8009 --reload
```

### Frontend
```bash
cd frontend
npm run dev
```
Open [http://localhost:5182](http://localhost:5182) in your browser.
