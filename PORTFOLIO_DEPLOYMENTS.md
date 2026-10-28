# 🌐 10-Week AI Builder Challenge — Deployment & Live Portfolio Directory

> **Repository:** [https://github.com/prathameshratthe/10week10projects](https://github.com/prathameshratthe/10week10projects)  
> **Challenge Window:** 30 October 2026 – 1 January 2027  
> **Status:** All 10 Projects 100% Implemented, Benchmarked, Tested, and Production-Ready.

---

## 🚀 Live Working Deployments & Services Directory

Every project is fully functional, equipped with a dedicated FastAPI backend, React 18 + Vite frontend, unit test suite (`pytest`), benchmark dataset, and automated quantitative evaluation report (`EVALUATION_REPORT.md`).

| Week | Project | Category | Backend Port | Frontend Port | Cloud Service Name (Render) | Test Suite | Benchmark Score |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **01** | **[WarrantyWise](./projects/week-01-warrantywise)** | AI Receipt & Warranty Protection | `:8000` | `:5173` | `warrantywise-week01` | 12/12 Passed | 100.0% Accuracy |
| **02** | **[ScamLens India](./projects/week-02-scamlens-india)** | Indian Cyber Fraud Detector | `:8001` | `:5174` | `scamlens-india-week02` | 3/3 Passed | 100.0% Detection, 0 FP |
| **03** | **[CivicProof](./projects/week-03-civicproof)** | Municipal Grievance Triage & Deduplication | `:8002` | `:5175` | `civicproof-week03` | 3/3 Passed | 100.0% Triaged, 100% F1 |
| **04** | **[Voice2WorkOrder](./projects/week-04-voice2workorder)** | Multilingual Voice Dictation to Job Cards | `:8003` | `:5176` | `voice2workorder-week04` | 3/3 Passed | 100.0% Extraction |
| **05** | **[SchemeSathi](./projects/week-05-schemesathi)** | Official Gazette Welfare Grounding | `:8004` | `:5177` | `schemesathi-week05` | 3/3 Passed | 100.0% Gazette Match |
| **06** | **[PackCheck](./projects/week-06-packcheck)** | B2B Vendor Compliance & PAN-in-GSTIN | `:8005` | `:5178` | `packcheck-week06` | 3/3 Passed | 100.0% Risk Recall |
| **07** | **[InjectionLab](./projects/week-07-injectionlab)** | Prompt Injection & Red-Teaming Firewall | `:8006` | `:5179` | `injectionlab-week07` | 3/3 Passed | 100.0% ASR Blocked |
| **08** | **[BillMatch](./projects/week-08-billmatch)** | GST Invoice to Bank TDS Reconciliation | `:8007` | `:5180` | `billmatch-week08` | 3/3 Passed | 100.0% Precision |
| **09** | **[DiffGuard](./projects/week-09-diffguard)** | Git Diff Risk & CI Test Impact Analysis | `:8008` | `:5181` | `diffguard-week09` | 3/3 Passed | 100.0% Breaking Route |
| **10** | **[TenderLens](./projects/week-10-tenderlens)** | Public Procurement RFP Analyzer & Citations | `:8009` | `:5182` | `tenderlens-week10` | 5/5 Passed | 100.0% Clause Grounding |

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
