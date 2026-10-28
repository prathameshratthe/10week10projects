# Week 09 — DiffGuard

> **10-Week AI Builder Challenge** | Week 09 of 10  
> **Target Release Date:** 25 December 2026  
> **Status:** ⚪ Scheduled (Awaiting kickoff instruction)

---

## 📌 Problem Statement
Code reviews often focus on formatting and obvious logic bugs, while missing subtle regressions, untested edge conditions, breaking API contract changes, or implicit side effects across dependent modules.

## 💡 Planned Build
- **Input:** Git diff (unified diff format) + relevant test files/context.
- **AI/Analysis Pipeline:** Change-aware AST and diff parsing, grounded LLM reasoning examining mutation risks, boundary conditions, and test gaps. Treats code strictly as data (never executes untrusted code).
- **Output:** Regression risk report, highlighted blast radius, and generated targeted Pytest/Jest regression test cases.
- **Evaluation Plan:** Test 15 curated real-world pull request diffs; measure useful findings, missed regressions, and human acceptance score.
