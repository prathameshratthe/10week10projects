# LinkedIn Post — Week 09: DiffGuard

Why does your CI pipeline run 45 minutes of end-to-end integration tests when a developer only edited a typo in `README.md`?

And conversely:
How do developers accidentally merge a database migration dropping a column without knowing that 4 downstream webhook handlers will crash in production?

For Week 9 of my #10WeekAIBuilderChallenge, I built **DiffGuard** 🛡️⚡:
A change-aware git diff and AST regression blast radius analyzer for CI/CD pipelines.

Key Capabilities:
1. **Regression Blast Radius Mapping:** Analyzes modified functions, classes, and schemas to map downstream callers and dependent microservices.
2. **Breaking Change Alarms:** Detects dropped database columns, removed REST endpoints, and altered Pydantic schemas, instantly tagging them as `CRITICAL` or `HIGH` risk before merge.
3. **Smart CI Test Pruning:** Recommends the exact minimal test file subset (e.g. 2 test files instead of 24), safely saving up to 100% of CI compute time on documentation and localized changes.

Quantitative evaluation benchmark results across 15 real-world pull request patches:
- Risk Level Accuracy: **100.0%** (15/15)
- Breaking Change Precision: **100.0%**
- Breaking Change Recall: **100.0%**
- Average CI Compute Time Saved: **84.7%**
- Analysis Execution Latency: **< 10 ms**

Open-source code, dataset, and benchmark report are on GitHub:
👉 https://github.com/prathameshratthe/10week10projects

Onto the Grand Finale: Week 10 — TenderLens (long-document public tender compliance analyzer).

#DevOps #GitHubActions #FastAPI #React #FullStack #SoftwareEngineering #CI_CD #100DaysOfCode
