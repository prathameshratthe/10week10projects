# DiffGuard — Change-Aware Regression & Test Impact Benchmark Report

**Project:** Week 09 — DiffGuard (10-Week AI Builder Challenge)  
**Evaluation Date:** December 2026  
**Evaluator:** Automated Git Diff AST & Regression Blast Radius Harness  
**Scope:** 15 Curated Pull Request Patches spanning DB Migrations, Pydantic Schemas, API Endpoints, Internal Bugfixes, and Docs  

---

## 1. Executive Summary

Running complete end-to-end integration test suites on every pull request burns cloud CI minutes and slows deployment cycles:
- **Blind Merges:** Developers merge database migrations with dropped columns without knowing which downstream services break.
- **Wasted CI Compute:** Documentation-only or markdown PRs run 45-minute Selenium/Jest suites unnecessarily.
- **Untracked Blast Radius:** Pydantic schema field deletions trigger silent runtime errors in downstream webhooks.

DiffGuard analyzes unified git diffs, flags breaking changes, and recommends the minimal viable test file subset.

---

## 2. Quantitative Performance Metrics

| Metric | Measured Score | Target SLA | Status |
| :--- | :--- | :--- | :--- |
| **Risk Level Accuracy** | **100.0%** | ≥ 90.0% | PASS |
| **Breaking Change Detection Precision** | **100.0%** | ≥ 95.0% | PASS |
| **Breaking Change Detection Recall** | **100.0%** | ≥ 95.0% | PASS |
| **Change Type Classification Acc** | **100.0%** | ≥ 90.0% | PASS |
| **Analysis Latency** | **< 10 ms** | < 100 ms | PASS |

---

## 3. Sample-by-Sample Breakdown

| ID | Pull Request Title | Exp Risk | Pred Risk | Exp Change Type | Pred Change Type | Breaking | Test Files | CI Saved |
|---|---|---|---|---|---|:---:|:---:|---|
| #1 | db: drop legacy user_phone column from users table | `CRITICAL` | `CRITICAL` | `DATABASE_MIGRATION` | `DATABASE_MIGRATION` | True | 4 files | 83.3% |
| #2 | docs: update deployment guidelines in README | `LOW` | `LOW` | `DOCUMENTATION_CHANGE` | `DOCUMENTATION_CHANGE` | False | 0 files | 100.0% |
| #3 | api: remove deprecated v1 user receipt endpoint | `CRITICAL` | `CRITICAL` | `API_ENDPOINT_CHANGE` | `API_ENDPOINT_CHANGE` | True | 6 files | 75.0% |
| #4 | schema: remove required client_tax_id from invoice | `HIGH` | `HIGH` | `CORE_SCHEMA_CHANGE` | `CORE_SCHEMA_CHANGE` | True | 5 files | 79.2% |
| #5 | feat: add optional description field to civic repo | `MEDIUM` | `MEDIUM` | `CORE_SCHEMA_CHANGE` | `CORE_SCHEMA_CHANGE` | False | 5 files | 79.2% |
| #6 | fix: correct GST TDS rounding in billing service | `MEDIUM` | `MEDIUM` | `INTERNAL_LOGIC_CHANGE` | `INTERNAL_LOGIC_CHANGE` | False | 4 files | 83.3% |
| #7 | test: add unit test coverage for receipt parser | `LOW` | `LOW` | `TEST_ONLY_CHANGE` | `TEST_ONLY_CHANGE` | False | 2 files | 91.7% |
| #8 | db: rename users table to corporate_accounts | `CRITICAL` | `CRITICAL` | `DATABASE_MIGRATION` | `DATABASE_MIGRATION` | True | 4 files | 83.3% |
| #9 | docs: add swagger API documentation and tutorial | `LOW` | `LOW` | `DOCUMENTATION_CHANGE` | `DOCUMENTATION_CHANGE` | False | 0 files | 100.0% |
| #10 | refactor: optimize auth token verification latency | `MEDIUM` | `MEDIUM` | `INTERNAL_LOGIC_CHANGE` | `INTERNAL_LOGIC_CHANGE` | False | 4 files | 83.3% |
| #11 | api: update vendor verification response schema | `MEDIUM` | `MEDIUM` | `API_ENDPOINT_CHANGE` | `API_ENDPOINT_CHANGE` | False | 5 files | 79.2% |
| #12 | test: add integration test cases for bank statemen | `LOW` | `LOW` | `TEST_ONLY_CHANGE` | `TEST_ONLY_CHANGE` | False | 1 files | 95.8% |
| #13 | db: drop invoices total_withholding column | `CRITICAL` | `CRITICAL` | `DATABASE_MIGRATION` | `DATABASE_MIGRATION` | True | 2 files | 91.7% |
| #14 | docs: add release notes for v1.2.0 | `LOW` | `LOW` | `DOCUMENTATION_CHANGE` | `DOCUMENTATION_CHANGE` | False | 0 files | 100.0% |
| #15 | feat: add webhook event dispatcher in report proce | `MEDIUM` | `MEDIUM` | `INTERNAL_LOGIC_CHANGE` | `INTERNAL_LOGIC_CHANGE` | False | 4 files | 83.3% |

---

## 4. Key Engineering Takeaways
- **Smart CI Test Pruning:** On pure documentation and changelog PRs (#2, #9, #14), DiffGuard safely recommends 0 test files, achieving 100% CI compute time and emissions reduction.
- **Immediate Breaking Alarm:** Database migrations dropping columns (#1, #8, #13) and deleted API routes (#3) are automatically elevated to `CRITICAL` risk with explicit warnings.
- **Zero Hallucination Test Graph:** Recommendations are derived from exact module symbol dependencies rather than speculative LLM hallucinations.
