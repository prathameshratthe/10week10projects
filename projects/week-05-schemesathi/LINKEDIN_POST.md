# LinkedIn Post — Week 05: SchemeSathi

If you ask ChatGPT: *"I am an engineer making ₹18 Lakhs a year. Can I get ₹6,000 from PM Kisan?"*
Standard LLMs will often politely hallucinate: *"Yes! As an Indian citizen, you may apply on the PM Kisan portal by submitting your land records."*

That hallucination is not just wrong — in government technology, **it is dangerous**.
When a citizen takes leave from work, travels to a district collectorate or Common Service Center (CSC), and gets rejected because Clause 3.2 excludes income tax payees, trust in digital public infrastructure is broken.

For Week 5 of my #10WeekAIBuilderChallenge, I built **SchemeSathi** 🇮🇳📜:
An official gazette-grounded welfare eligibility and citation engine with strict negative abstention and **zero false promises**.

Key Architecture Principles:
1. **Deterministic Exclusion Filters:** Checks statutory disqualifications (tax filing status, public housing ownership, government pensions, land thresholds) before eligibility calculation.
2. **100% Gazette Citations:** Every recommendation references the exact ministry clause (e.g. MoA&FW Guidelines 2024 Clause 3.1, NHA PMJAY Manual v4.0 Sec 2, Maharashtra GR WCD-2024/CR-142).
3. **Mandatory CSC Document Checklist:** Outlines exact paperwork required (7/12 land extract, Aadhaar DBT-seeding, ULB vendor card) to eliminate wasted trips.

Quantitative benchmark results across 20 diverse citizen profiles (120 scheme determinations):
- Profile Multi-Scheme Accuracy: **100.0%** (20/20)
- Official Gazette Citation Coverage: **100.0%** (120/120)
- False Promise Rate (Hallucinations): **0.0%** (0 false positives)
- Negative Abstention Precision: **100.0%**

Open-source code, dataset, and benchmark report are on GitHub:
👉 https://github.com/prathameshratthe/10week10projects

Onto Week 6: PackCheck (automated vendor onboarding compliance verification).

#AI #FastAPI #React #FullStack #GovTech #IndiaStack #CivicTech #100DaysOfCode #LegalAI
