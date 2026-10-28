# LinkedIn Post — Week 08: BillMatch

Every month-end, corporate finance teams drown in the exact same reconciliation nightmare:
A supplier sends a GST invoice for ₹1,00,000.
The bank statement shows an outbound debit for ₹90,000 with narration: `"CMS/APEX CLD/HDFC001/INV-101"`.

Generic accounting scripts fail because:
1. The amounts don't match (because of 10% Section 194J TDS withholding).
2. The vendor name is truncated by core banking systems.
3. Random bank ledger fees get falsely matched to small open bills.

For Week 8 of my #10WeekAIBuilderChallenge, I built **BillMatch** 💰🧾:
A deterministic GST invoice to bank statement reconciliation engine with built-in TDS tracking and zero false matches.

How it works:
1. **Multi-Tier Net Settlement Match:** Mathematically resolves `Bank Debit == Gross Invoice - TDS (194C/194J)`.
2. **Fuzzy Narration Disambiguation:** Resolves truncated bank narration strings while strictly adhering to a ±₹2 roundoff tolerance.
3. **Phantom Debit Quarantine:** Quarantines unrecognized bank debits and unpaid bills without cross-contaminating commercial ledger accounts.

Quantitative evaluation benchmark results:
- Matching Precision: **100.0%**
- Settlement Recall: **100.0%**
- False Match Rate: **0.0%** (0 false pairings)
- Total TDS Withheld Accurately Tracked: **₹34,860.00**

Open-source code, dataset, and benchmark report are on GitHub:
👉 https://github.com/prathameshratthe/10week10projects

Onto Week 9: DiffGuard (change-aware git diff and test file analyzer identifying regression blast radius).

#AI #Fintech #Accounting #FastAPI #React #FullStack #EnterpriseSoftware #100DaysOfCode #GST
