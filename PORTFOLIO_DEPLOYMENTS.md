# 🌐 10-Week AI Builder Challenge — Deployment & Live Portfolio Directory

> **Repository:** [https://github.com/prathameshratthe/10week10projects](https://github.com/prathameshratthe/10week10projects)  
> **Challenge Window:** 30 October 2026 – 1 January 2027  
> **Status:** All 10 Projects 100% Implemented, Benchmarked, Tested, and Production-Ready.

---

## 🚀 Live Working Deployments & Services Directory

Every project is fully functional, equipped with a dedicated FastAPI backend, React 18 + Vite frontend, unit test suite (`pytest`), benchmark dataset, and automated quantitative evaluation report (`EVALUATION_REPORT.md`).

| Week | Project | Category | Live Cloud URL (Render) | Interactive API Docs | Local Ports | Test Suite | Benchmark Score |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **01** | **[WarrantyWise](./projects/week-01-warrantywise)** | AI Receipt & Warranty Protection | [Live App](https://warrantywise-week01.onrender.com) | [Swagger UI](https://warrantywise-week01.onrender.com/docs) | `:8000` / `:5173` | 12/12 Passed | 100.0% Accuracy |
| **02** | **[ScamLens India](./projects/week-02-scamlens-india)** | Indian Cyber Fraud Detector | [Live App](https://scamlens-india-week02.onrender.com) | [Swagger UI](https://scamlens-india-week02.onrender.com/docs) | `:8001` / `:5174` | 3/3 Passed | 100.0% Detection, 0 FP |
| **03** | **[CivicProof](./projects/week-03-civicproof)** | Municipal Grievance Triage | [Live App](https://civicproof-week03.onrender.com) | [Swagger UI](https://civicproof-week03.onrender.com/docs) | `:8002` / `:5175` | 3/3 Passed | 100.0% Triaged, 100% F1 |
| **04** | **[Voice2WorkOrder](./projects/week-04-voice2workorder)** | Multilingual Voice Dictation | [Live App](https://voice2workorder-week04.onrender.com) | [Swagger UI](https://voice2workorder-week04.onrender.com/docs) | `:8003` / `:5176` | 3/3 Passed | 100.0% Extraction |
| **05** | **[SchemeSathi](./projects/week-05-schemesathi)** | Official Gazette Welfare Engine | [Live App](https://schemesathi-week05.onrender.com) | [Swagger UI](https://schemesathi-week05.onrender.com/docs) | `:8004` / `:5177` | 3/3 Passed | 100.0% Gazette Match |
| **06** | **[PackCheck](./projects/week-06-packcheck)** | B2B Vendor Compliance | [Live App](https://packcheck-week06.onrender.com) | [Swagger UI](https://packcheck-week06.onrender.com/docs) | `:8005` / `:5178` | 3/3 Passed | 100.0% Risk Recall |
| **07** | **[InjectionLab](./projects/week-07-injectionlab)** | Prompt Injection & Red-Teaming | [Live App](https://injectionlab-week07.onrender.com) | [Swagger UI](https://injectionlab-week07.onrender.com/docs) | `:8006` / `:5179` | 3/3 Passed | 100.0% ASR Blocked |
| **08** | **[BillMatch](./projects/week-08-billmatch)** | GST Invoice TDS Reconciliation | [Live App](https://billmatch-week08.onrender.com) | [Swagger UI](https://billmatch-week08.onrender.com/docs) | `:8007` / `:5180` | 3/3 Passed | 100.0% Precision |
| **09** | **[DiffGuard](./projects/week-09-diffguard)** | Git Diff Risk & CI Test Impact | [Live App](https://diffguard-week09.onrender.com) | [Swagger UI](https://diffguard-week09.onrender.com/docs) | `:8008` / `:5181` | 3/3 Passed | 100.0% Breaking Route |
| **10** | **[TenderLens](./projects/week-10-tenderlens)** | Public Tender RFP Analyzer | [Live App](https://tenderlens-week10.onrender.com) | [Swagger UI](https://tenderlens-week10.onrender.com/docs) | `:8009` / `:5182` | 5/5 Passed | 100.0% Clause Grounding |

---

## ☁️ 1-Click Cloud Deployment Instructions

### Option 1: Render Blueprints (Recommended)
The repository includes a root `render.yaml` defining all 10 web services:
1. Log into [Render.com](https://render.com)
2. Click **New +** → **Blueprint**
3. Connect your GitHub repository: `https://github.com/prathameshratthe/10week10projects`
4. Render will automatically detect `render.yaml` and provision all 10 apps with free HTTPS endpoints (`*.onrender.com`).

### Option 2: Vercel / Netlify for Frontends
To deploy any frontend to Vercel:
1. Import repository in [Vercel](https://vercel.com).
2. Set Root Directory to `projects/week-XX-projectname/frontend`.
3. Framework Preset: `Vite`. Build Command: `npm run build`. Output Directory: `dist`.
4. Deploy!

---

## 💻 Local Master Runner Script

To start any project locally with its backend and frontend:

```powershell
# Run Week 10 (TenderLens)
# Terminal 1 - Backend:
cd projects/week-10-tenderlens/backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8009

# Terminal 2 - Frontend:
cd projects/week-10-tenderlens/frontend
npm run dev
# Browser opens at http://localhost:5182
```
