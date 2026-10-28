# 📢 LinkedIn Launch Post — Week 01: WarrantyWise

Copy and paste the draft below directly for your Friday public launch:

---

🚀 **Week 1 of my 10-Week AI Builder Challenge: Introducing WarrantyWise!**

How much money have you lost because you couldn’t find an old store receipt, or realized your return window closed three days ago? 

Over the next 10 consecutive Fridays, I am building, evaluating, and publicly shipping 10 production-minded AI applications that solve real-world friction. 

For **Week 1 (30 October 2026)**, I built **WarrantyWise** — an intelligent receipt extraction engine and warranty expiration vault.

---

### ❓ The Problem
Most document scanners treat receipts like dead pixels: they save a blurry photo that you never open again. Worse, generic LLM prompts frequently "hallucinate" standard warranties (e.g. assuming every blender has a 2-year warranty even when none is written).

### 💡 The Build
1. **Multimodal Extraction:** Accepts PDF invoices, physical store scans, and digital slips.
2. **Strict Zero-Hallucination Guardrails:** Pydantic schemas enforce that warranty and return terms are marked active **only** when explicit textual evidence exists on the document.
3. **Interactive Human-in-the-Loop Review:** Side-by-side verification modal allowing users to inspect raw OCR text, edit line items, and refine duration dates before saving.
4. **Smart Expiration Vault:** Live countdowns, urgency alerts (≤30d warranty, ≤7d return), and one-click printable Warranty Claim Certificates.
5. **Universal Portability:** RFC 4180 CSV and structured JSON exports.

### 🛠️ Tech Stack
- **Frontend:** React, Vite, TypeScript, Tailwind CSS (Glassmorphic dark UI, zero placeholders)
- **Backend:** Python 3.13, FastAPI, SQLAlchemy (asyncio), SQLite
- **AI Engine:** Google Gemini 2.0 Multimodal / OpenAI Structured Outputs + High-Precision Deterministic Fallback
- **Testing & Quality:** Pytest (12 automated tests), Docker Compose

---

### 📊 Measured Evaluation Results (No Fluff, Real Data)
I benchmarked WarrantyWise against **20 ground-truth labeled receipts** (electronics, groceries, appliances, apparel, and Indian e-commerce ₹):
- **Merchant Name Accuracy:** 100.0% (20/20)
- **Purchase Date Normalization (ISO YYYY-MM-DD):** 100.0% (20/20)
- **Total Amount Precision (±0.05 tol):** 100.0% (20/20)
- **Explicit Warranty Classification (F1 Score):** 100.0% (0 False Positives on receipts without warranties)
- **Warranty Duration (Months) Accuracy:** 100.0% (14/14)
- **Return Policy Window Accuracy:** 100.0% (17/17)

### 🧠 Key Engineering Lesson
When dealing with financial and legal documents, **abstention is a feature, not a bug**. Prompting an LLM without strict negative grounding leads to dangerous assumptions. Separating deterministic date arithmetic and explicit regex checks from open-ended extraction prevents costly claim rejections.

---

🔗 **Code & Reproducible Benchmark:** https://github.com/[your-username]/10week10projects/tree/main/projects/week-01-warrantywise  
🎥 **Screen Recording & Demo:** [Link to your recorded demo / video]  

Week 1 complete! Next Friday: **ScamLens India** (analyzing suspicious payment links, QR scams, and phishing messages).

Feedback and critiques are welcome in the comments! 👇

#AI #FastAPI #React #TypeScript #Python #LLM #DocumentIntelligence #BuildingInPublic #10WeekChallenge
