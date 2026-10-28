# Week 08 — BillMatch

> **10-Week AI Builder Challenge** | Week 08 of 10  
> **Target Release Date:** 18 December 2026  
> **Status:** ⚪ Scheduled (Awaiting kickoff instruction)

---

## 📌 Problem Statement
Small businesses and accountants spend countless manual hours cross-referencing supplier GST tax invoices with bank statements to catch mismatches, TDS deductions, round-offs, partial payments, and duplicate billings.

## 💡 Planned Build
- **Input:** Supplier GST invoices (PDFs) + Bank statement CSV files.
- **AI/Analysis Pipeline:** High-precision deterministic matching first (GSTIN, invoice number, exact amount/dates). LLM used exclusively to rank and explain ambiguous/fuzzy matches (e.g. slight name variations or split payments).
- **Output:** Interactive reconciliation ledger (Exact Matches, Ambiguous Candidates, Partial Payments, Unmatched Records) requiring human approval before finalization.
- **Evaluation Plan:** Test synthetic labeled transaction sets measuring precision, recall, F1, and false-match rates.
