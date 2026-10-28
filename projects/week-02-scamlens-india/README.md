# Week 02 — ScamLens India

> **10-Week AI Builder Challenge** | Week 02 of 10  
> **Target Release Date:** 06 November 2026  
> **Status:** ⚪ Scheduled (Awaiting Week 1 completion & user kickoff instruction)

---

## 📌 Problem Statement
Citizens and elderly individuals in India regularly encounter fraudulent WhatsApp/SMS messages, malicious payment requests, APK download links, and spoofed bank alerts. Existing spam blockers only block numbers, but fail to explain why a message is risky or how to safely verify it.

## 💡 Planned Build
- **Input:** Pasted text or screenshot of SMS, WhatsApp, UPI payment request, or email.
- **AI/Analysis Pipeline:** OCR extraction, deterministic URL/regex checks (known malicious patterns, spoofed IFSC/UPI handles, shorteners), and LLM reasoning for transparent risk explanation.
- **Output:** Risk score, highlighted red flags, evidence citations, and specific safe verification steps.
- **Evaluation Plan:** Test 30 labeled benign and suspicious messages; measure false positives and false negatives.
