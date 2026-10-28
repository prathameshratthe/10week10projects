# 🚀 10-Week AI Builder Challenge — Master Roadmap

> **Author & Builder:** Senior Full-Stack & AI Engineer  
> **Challenge Window:** 30 October 2026 – 1 January 2027 (10 Consecutive Fridays)  
> **Mission:** Solve real problems, build production-minded MVPs, measure actual performance, and publish every project publicly on GitHub & LinkedIn.  
> **Rule of Engagement:** Implement one project at a time. Do not build 10 half-baked applications at once. Measure honest metrics, verify against real failure modes, and never invent numbers.

---

## 📅 Challenge Master Schedule

| Week | Date | Project | Problem & Core Value | Primary AI & Tech Pattern | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **01** | **30 Oct 2026** | **[WarrantyWise](./projects/week-01-warrantywise)** | People lose receipts and forget warranty/return deadlines | Document Intelligence, Multimodal Extraction, Schema Validation | 🟡 **In Progress (Active)** |
| **02** | **06 Nov 2026** | **[ScamLens India](./projects/week-02-scamlens-india)** | Identifying suspicious messages, phishing payment links, QR scams | OCR, Deterministic Security Rules, LLM Explainability | ⚪ Scheduled |
| **03** | **13 Nov 2026** | **[CivicProof](./projects/week-03-civicproof)** | Citizens struggle to document civic issues clearly and avoid duplicates | Vision Understanding, Geo-enrichment, Vector Similarity Search | ⚪ Scheduled |
| **04** | **20 Nov 2026** | **[Voice2WorkOrder](./projects/week-04-voice2workorder)** | Small repair shops waste time converting unstructured voice notes | Multilingual Speech-to-Text (HI/MR/EN), Schema Extraction | ⚪ Scheduled |
| **05** | **27 Nov 2026** | **[SchemeSathi](./projects/week-05-schemesathi)** | Navigating Indian welfare schemes and eligibility without hallucinations | Multilingual RAG, Hybrid Retrieval, Strict Source Grounding & Abstention | ⚪ Scheduled |
| **06** | **04 Dec 2026** | **[PackCheck](./projects/week-06-packcheck)** | Businesses waste hours verifying vendor onboarding document packets | Multi-document Classification, Date Validation, Checklist Matching | ⚪ Scheduled |
| **07** | **11 Dec 2026** | **[InjectionLab](./projects/week-07-injectionlab)** | LLM apps vulnerable to prompt injection, data leaks, and tool exploits | Red-teaming Harness, Security Assertions, Pytest/Promptfoo Evaluator | ⚪ Scheduled |
| **08** | **18 Dec 2026** | **[BillMatch](./projects/week-08-billmatch)** | Small businesses struggle reconciling GST invoices with bank statements | Deterministic Reconciliation first, LLM Reranking for Ambiguous Records | ⚪ Scheduled |
| **09** | **25 Dec 2026** | **[DiffGuard](./projects/week-09-diffguard)** | Code reviews miss subtle regression risks and missing test boundaries | Change-aware Code Analysis, AST/Diff Parsing, Regression Test Generation | ⚪ Scheduled |
| **10** | **01 Jan 2027** | **[TenderLens](./projects/week-10-tenderlens)** | Small vendors overwhelmed by 100+ page public tender requirements | Long-document PDF Parsing, Page-grounded Retrieval, Structured Fact Extraction | ⚪ Scheduled |

---

## 🏗️ Architectural Foundations

Every project adheres to a standardized, battle-tested stack:
- **Frontend:** React, Vite, TypeScript, Tailwind CSS with Lucide icons. High-aesthetic, responsive, accessible, zero placeholder policy.
- **Backend:** Python 3.12+, FastAPI, Pydantic v2 with strict validation and error handling.
- **Data Persistence:** SQLite for local zero-config MVPs; PostgreSQL + pgvector when relational concurrency or vector search is required.
- **AI Abstraction:** Provider-agnostic AI interfaces (Google Gemini, OpenAI, or local/deterministic fallbacks) allowing zero-dependency testing and evaluation.
- **Evaluation Discipline:** Minimum 15–30 synthetic/permissive-licensed test cases per week, calculating precision, recall, exact match, and failure analyses.
- **Zero Hallucination Tolerance:** Explicit citations, explicit warranty flags, or explicit abstention when information is absent.

---

## ⏱️ Weekly Execution Rhythm

```
┌─────────────┬─────────────────────────────────────────────────────────┐
│ Saturday    │ Problem validation, edge-case audit, and scope lockdown │
├─────────────┼─────────────────────────────────────────────────────────┤
│ Sunday      │ UI wireframes, Pydantic schemas, and DB models          │
├─────────────┼─────────────────────────────────────────────────────────┤
│ Monday      │ Core AI / extraction / reasoning pipeline               │
├─────────────┼─────────────────────────────────────────────────────────┤
│ Tuesday     │ FastAPI endpoints, business logic, validation, DB layer │
├─────────────┼─────────────────────────────────────────────────────────┤
│ Wednesday   │ React frontend integration, interactive states, UI/UX   │
├─────────────┼─────────────────────────────────────────────────────────┤
│ Thursday    │ Test suite execution, quantitative eval, deployment prep│
├─────────────┼─────────────────────────────────────────────────────────┤
│ Friday      │ Live smoke test, artifact publishing, LinkedIn post    │
└─────────────┴─────────────────────────────────────────────────────────┘
```

---

## 📦 Directory Structure

```
10week10projects/
├── ROADMAP.md                  # This file: master schedule & tracking
├── CHALLENGE_LOG.md            # Running execution log & milestone outcomes
├── templates/                  # Reusable patterns across weeks
│   ├── fastapi-service/        # Base FastAPI backend pattern
│   ├── react-vite-tailwind/    # Base React frontend pattern
│   ├── eval-harness/           # Standardized evaluation harness
│   └── project-readme-template.md
└── projects/
    ├── week-01-warrantywise/   # [ACTIVE] Receipt & warranty intelligence
    ├── week-02-scamlens-india/
    ├── week-03-civicproof/
    ├── week-04-voice2workorder/
    ├── week-05-schemesathi/
    ├── week-06-packcheck/
    ├── week-07-injectionlab/
    ├── week-08-billmatch/
    ├── week-09-diffguard/
    └── week-10-tenderlens/
```
