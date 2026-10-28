# LinkedIn Post — Week 06: PackCheck

In enterprise procurement, the most expensive mistake isn't paying a vendor 2 days late — it's **onboarding a vendor with contradictory tax records**.

Every quarter, internal audit teams find the exact same risks:
- Vendor submits a valid PAN card, but quotes a GSTIN registered under another entity's PAN.
- A corporate supplier provides a cancelled cheque pointing to an individual director's personal savings account rather than the corporate current account.
- Vendors submit expired ISO quality certificates or outdated Udyog Aadhaar filings.

Manual compliance review takes 45 minutes per dossier and is prone to human oversight.

For Week 6 of my #10WeekAIBuilderChallenge, I built **PackCheck** 🏢🔍:
An automated B2B vendor onboarding document verification and cross-entity reconciliation engine.

How it protects enterprise accounts payable:
1. **PAN-in-GSTIN Substring Alignment:** Mathematically verifies that characters 3 to 12 of a 15-digit GSTIN match the standalone PAN card. If there's a divergence, it flags synthetic identity fraud immediately.
2. **Third-Party Payout Protection:** Scrutinizes bank account beneficiary titles against corporate legal names to prevent embezzlement.
3. **Automated Compliance Scorecard:** Audits dossiers against mandatory checklists and credential expiration rules, outputting `APPROVED`, `CONDITIONAL`, or `REJECTED` in <15ms.

Quantitative benchmark results across 15 real-world supplier dossiers:
- Onboarding Verdict Accuracy: **100.0%** (15/15)
- Fraud & Risk Flag Recall: **100.0%** (0 missed violations)
- Risk Flag Precision: **100.0%**
- Risk F1-Score: **100.0%**

Open-source code, dataset, and benchmark report are on GitHub:
👉 https://github.com/prathameshratthe/10week10projects

Onto Week 7: InjectionLab (automated prompt injection security evaluation harness for LLMs).

#AI #FastAPI #React #FullStack #Procurement #Fintech #EnterpriseAI #100DaysOfCode #B2B
