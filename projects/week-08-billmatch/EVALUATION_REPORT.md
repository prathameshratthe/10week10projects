# BillMatch — GST Invoice to Bank Reconciliation Benchmark Report

**Project:** Week 08 — BillMatch (10-Week AI Builder Challenge)  
**Evaluation Date:** December 2026  
**Evaluator:** Automated Multi-Tier Accounts Payable Reconciliation Engine  
**Dataset Size:** 12 Corporate GST Invoices & 12 Bank Statement Debits  

---

## 1. Executive Summary

Enterprise finance teams face significant month-end reconciliation challenges:
- **TDS Withholding Variances:** Invoices for ₹1,00,000 appear on bank statements as ₹90,000 debits (due to Section 194J 10% TDS) or ₹98,000 (Section 194C 2% TDS).
- **Truncated Bank Narrations:** Corporate core banking systems truncate supplier names (`"NEFT/CMS/APEX CLD/HDFC001"`).
- **Phantom Bank Debits & Unpaid Invoices:** Bank ledger fees and unauthorized debits must be flagged without falsely pairing them to open vendor bills.

BillMatch executes deterministic multi-tier reconciliation with zero false matches.

---

## 2. Quantitative Performance Metrics

| Metric | Measured Score | Target SLA | Status |
| :--- | :--- | :--- | :--- |
| **Matching Precision** | **100.0%** | 100.0% | PASS |
| **Matching Recall** | **100.0%** | ≥ 95.0% | PASS |
| **False Match Rate (False Positives)** | **0.0%** (0 false pairings) | 0.0% | PASS |
| **Matching F1-Score** | **100.0%** | ≥ 95.0% | PASS |
| **Reconciliation Latency** | **< 10 ms** | < 100 ms | PASS |

---

## 3. Discrepancy & Reconciliation Ledger

| Invoice Ref | Bank Txn | Vendor Name | Status | Invoice Gross (₹) | Bank Debit (₹) | TDS Tracked (₹) | Audit Reasoning |
|---|---|---|---|---|---|---|---|
| `INV-2026-101` | `TXN-8801` | Apex Cloud Infotech Pvt Ltd | `MATCHED_TDS` | ₹100,000.00 | ₹90,000.00 | ₹10,000.00 | Exact Reference & Amount Match: Invoice #INV-2026-101 matched against UTR/Narration with 10.0% TDS deduction. |
| `INV-2026-102` | `TXN-8802` | BlueStar Facilities LLP | `MATCHED_TDS` | ₹50,000.00 | ₹49,000.00 | ₹1,000.00 | Exact Reference & Amount Match: Invoice #INV-2026-102 matched against UTR/Narration with 2.0% TDS deduction. |
| `INV-2026-103` | `TXN-8803` | QuickFix Logistics Pvt Ltd | `MATCHED_TDS` | ₹35,000.00 | ₹34,300.00 | ₹700.00 | Exact Reference & Amount Match: Invoice #INV-2026-103 matched against UTR/Narration with 2.0% TDS deduction. |
| `INV-2026-104` | `TXN-8804` | Falcon Security Services LLP | `MATCHED_TDS` | ₹75,000.00 | ₹73,500.00 | ₹1,500.00 | Exact Reference & Amount Match: Invoice #INV-2026-104 matched against UTR/Narration with 2.0% TDS deduction. |
| `INV-2026-105` | `TXN-8805` | Metro Printworks Pvt Ltd | `MATCHED_EXACT` | ₹18,500.00 | ₹18,500.00 | ₹0.00 | Exact Reference & Amount Match: Invoice #INV-2026-105 matched against UTR/Narration with 0.0% TDS deduction. |
| `INV-2026-106` | `TXN-8806` | GreenLeaf Packaging Solutions | `MATCHED_TDS` | ₹42,000.00 | ₹41,160.00 | ₹840.00 | Exact Reference & Amount Match: Invoice #INV-2026-106 matched against UTR/Narration with 2.0% TDS deduction. |
| `INV-2026-107` | `TXN-8807` | Prime Cabs Transport Pvt Ltd | `MATCHED_TDS` | ₹28,000.00 | ₹27,440.00 | ₹560.00 | Exact Reference & Amount Match: Invoice #INV-2026-107 matched against UTR/Narration with 2.0% TDS deduction. |
| `INV-2026-108` | `TXN-8808` | Vanguard Security Solutions | `MATCHED_TDS` | ₹88,000.00 | ₹86,240.00 | ₹1,760.00 | Exact Reference & Amount Match: Invoice #INV-2026-108 matched against UTR/Narration with 2.0% TDS deduction. |
| `INV-2026-109` | `TXN-8809` | Trident Engineering Works | `MATCHED_TDS` | ₹125,000.00 | ₹112,500.00 | ₹12,500.00 | Exact Reference & Amount Match: Invoice #INV-2026-109 matched against UTR/Narration with 10.0% TDS deduction. |
| `INV-2026-110` | `TXN-8810` | Aura Consulting LLP | `MATCHED_TDS` | ₹60,000.00 | ₹54,000.00 | ₹6,000.00 | Exact Reference & Amount Match: Invoice #INV-2026-110 matched against UTR/Narration with 10.0% TDS deduction. |
| `INV-2026-111` | `None` | Unpaid Pending Supplier Corp | `UNMATCHED_INVOICE` | ₹95,000.00 | ₹0.00 | ₹0.00 | Unpaid Invoice: No matching bank debit found for #INV-2026-111 (Unpaid Pending Supplier Corp). |
| `INV-2026-112` | `None` | Disputed Hardware Vendor | `UNMATCHED_INVOICE` | ₹24,000.00 | ₹0.00 | ₹0.00 | Unpaid Invoice: No matching bank debit found for #INV-2026-112 (Disputed Hardware Vendor). |
| `None` | `TXN-8898` | Unidentified Beneficiary | `UNMATCHED_BANK_TXN` | ₹0.00 | ₹1,180.00 | ₹0.00 | Unreconciled Bank Debit: Transaction 'BANK MONTHLY LEDGER MAINTENANCE CHARGE' has no matching approved purchase invoice. |
| `None` | `TXN-8899` | Unidentified Beneficiary | `UNMATCHED_BANK_TXN` | ₹0.00 | ₹50,000.00 | ₹0.00 | Unreconciled Bank Debit: Transaction 'UNIDENTIFIED DIRECTOR DRAWINGS CASH DEBIT' has no matching approved purchase invoice. |

---

## 4. Key Financial Takeaways
- **Total Invoices Value:** ₹740,500.00
- **Total Settled Bank Debits:** ₹586,640.00
- **Total TDS Legally Withheld:** ₹34,860.00
- **Phantom Debit Isolation:** Unmatched bank debits (`TXN-8898` monthly charge & `TXN-8899` cash withdrawal) were strictly quarantined as `UNMATCHED_BANK_TXN` without contaminating commercial accounts payable.
