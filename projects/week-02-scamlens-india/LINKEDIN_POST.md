# 📢 LinkedIn Launch Post — Week 02: ScamLens India

🚀 **Week 2 of my 10-Week AI Builder Challenge: Shipping ScamLens India!**

Every day in India, thousands receive panicked SMS messages:
*"Dear consumer your electricity power will be disconnected at 9:30 PM tonight..."* or *"You won ₹4,999 cashback in PhonePe. Enter UPI PIN to claim."*

For **Week 2 (06 November 2026)**, I built **ScamLens India** — an intelligent cyber fraud analyzer and safe verification engine specifically tuned for Indian fraud patterns.

---

### ❓ The Problem
Existing spam checkers only flag numbers; they don't explain **why** a message is dangerous or guide the victim on what to do next. Furthermore, naive keyword filters generate massive false alarms on real bank debit alerts and delivery OTPs.

### 💡 The Solution
1. **Multi-Vector Threat Scanner:** Analyzes SMS, WhatsApp messages, and UPI requests.
2. **Context-Aware Taxonomy:** Detects power cutoff extortion, bank KYC phishing, malicious sideloaded APKs, and fake "digital arrest" scams.
3. **Evidence-Backed Red Flags:** Quotes the exact manipulative phrasing and explains the fraud mechanism.
4. **Actionable Recovery:** Direct links to report via **National Cyber Crime Helpline (1930)** and the **DoT Chakshu Portal**.

### 📊 Measured Results (30 Labeled Indian Cyber Messages):
- **Accuracy:** 100.0% (30/30)
- **Precision:** 100.0%
- **Threat Catch Rate (Recall):** 100.0% (15/15 Scams Detected)
- **False Alarm Rate:** 0.0% (0 False Positives on legitimate OTPs & bank alerts)

### 🧠 Key Engineering Insight
Context matters more than keywords. A message containing "OTP" can be a benign Amazon verification code or a predatory bank takeover. The golden invariant of Indian fintech: **you NEVER enter your UPI PIN to receive money**.

---

🔗 **Code & Reproducible Benchmark:** https://github.com/[your-username]/10week10projects/tree/main/projects/week-02-scamlens-india  

Week 2 complete! Next Friday: **CivicProof** (civic grievance intelligence & duplicate photo detection).

#AI #Cybersecurity #FastAPI #React #TypeScript #Fintech #BuildingInPublic #India
