# Week 07 — InjectionLab

> **10-Week AI Builder Challenge** | Week 07 of 10  
> **Target Release Date:** 11 December 2026  
> **Status:** ⚪ Scheduled (Awaiting kickoff instruction)

---

## 📌 Problem Statement
Production LLM applications are vulnerable to direct and indirect prompt injection, sensitive data leakage, goal hijacking, and unauthorized tool execution. Developers lack automated regression test suites to systematically probe their defenses.

## 💡 Planned Build
- **Input:** Target application endpoints and schema definitions (specifically targeting Week 1–6 applications in isolated environments).
- **AI/Security Pipeline:** Adversarial test harness using synthetic canary secrets, Promptfoo/Pytest test matrix, deterministic security assertions, OWASP LLM Top 10 rule validation.
- **Output:** Before-and-after vulnerability report, Attack Success Rate (ASR) delta, regression test suite.
- **Evaluation Plan:** Measure attack success rate pre- and post-defense hardening across injection categories.
