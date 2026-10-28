# 🛡️ ScamLens India — Quantitative Evaluation Report

> **Evaluation Date:** 2026-10-28 19:06:06  
> **Dataset Size:** 30 Real-world Labeled Indian Messages  
> **Benchmark Focus:** False Positive & False Negative Rates on High-Impact Scams

---

## 🎯 Executive Scorecard

| Metric | Target | Measured Result | Status |
| :--- | :---: | :---: | :---: |
| **Overall Accuracy** | ≥ 90.0% | **100.0%** (30/30) | 🟢 PASS |
| **Precision** | ≥ 90.0% | **100.0%** | 🟢 PASS |
| **Recall (Threat Catch Rate)** | ≥ 95.0% | **100.0%** (15/15 Scams Detected) | 🟢 PASS |
| **F1 Score** | ≥ 90.0% | **100.0%** | 🟢 PASS |
| **False Negative Rate (Missed Scams)** | **0%** | **0 missed scams** | 🟢 PASS |
| **False Positive Rate (Benign Alarms)** | ≤ 5.0% | **0 false alarms** | 🟢 PASS |

---

## 🔬 Confusion Matrix (30 Samples)

- **True Positives (TP):** 15 (Malicious messages correctly identified)
- **True Negatives (TN):** 15 (Legitimate transaction/OTP messages verified as Safe)
- **False Positives (FP):** 0 (Legitimate messages wrongly flagged)
- **False Negatives (FN):** 0 (Dangerous scam slipped through undetected)

---

## 📋 Detailed Results Breakdown

| # | Message Snippet | Ground Truth | Verdict | Risk Score | Category / Outcome |
| :-: | :--- | :-: | :-: | :-: | :--- |
| 1 | `Dear consumer your electricity power will be disconnected at 9:30...` | **SCAM** | `CRITICAL_SCAM` | **75/100** | 🟢 TP (Scam Caught) (Electricity Bill Disconnection Fraud) |
| 2 | `SBI Alert: Dear customer your YONO account has been blocked today...` | **SCAM** | `CRITICAL_SCAM` | **75/100** | 🟢 TP (Scam Caught) (Bank KYC & SIM Deactivation Phishing) |
| 3 | `Congratulations! You have received a cashback reward of Rs. 4,999...` | **SCAM** | `CRITICAL_SCAM` | **75/100** | 🟢 TP (Scam Caught) (UPI Reverse Collect / Fake Cashback) |
| 4 | `URGENT NOTICE: Download our official power billing app http://bit...` | **SCAM** | `CRITICAL_SCAM` | **75/100** | 🟢 TP (Scam Caught) (Malicious APK File Download) |
| 5 | `Earn Rs 3000 to Rs 8000 daily by simply liking YouTube videos and...` | **SCAM** | `CRITICAL_SCAM` | **75/100** | 🟢 TP (Scam Caught) (Part-Time Job / Task Fraud) |
| 6 | `FEDEX ALERT: Your parcel from Mumbai to Taiwan containing 5 passp...` | **SCAM** | `CRITICAL_SCAM` | **75/100** | 🟢 TP (Scam Caught) (Digital Arrest & Police Extortion) |
| 7 | `Dear customer you have won 25 Lakh Rupees in KBC Jio Lucky Draw 2...` | **SCAM** | `CRITICAL_SCAM` | **75/100** | 🟢 TP (Scam Caught) (Lottery & KBC Lucky Draw) |
| 8 | `HDFC Bank: Your NetBanking access is suspended due to invalid Aad...` | **SCAM** | `CRITICAL_SCAM` | **75/100** | 🟢 TP (Scam Caught) (Bank KYC & SIM Deactivation Phishing) |
| 9 | `Airtel Important: Your SIM card services will be blocked within 2...` | **SCAM** | `CRITICAL_SCAM` | **75/100** | 🟢 TP (Scam Caught) (Bank KYC & SIM Deactivation Phishing) |
| 10 | `Online Freelance Opportunity: Earn Rs 4500 daily by simple tasks....` | **SCAM** | `SUSPICIOUS` | **30/100** | 🟢 TP (Scam Caught) (Part-Time Job / Task Fraud) |
| 11 | `Dear user, personal loan of Rs 5,00,000 is approved without CIBIL...` | **SCAM** | `CRITICAL_SCAM` | **75/100** | 🟢 TP (Scam Caught) (Malicious APK File Download) |
| 12 | `Jio Anniversary Gift: Government of India offering free 3-month 5...` | **SCAM** | `CRITICAL_SCAM` | **75/100** | 🟢 TP (Scam Caught) (Lottery & KBC Lucky Draw) |
| 13 | `Income Tax Department: Your tax refund of Rs 15,490 has been appr...` | **SCAM** | `SUSPICIOUS` | **30/100** | 🟢 TP (Scam Caught) (Bank KYC & Pan Card Phishing) |
| 14 | `Urgent: Cyber crime police Mumbai has registered a case against y...` | **SCAM** | `CRITICAL_SCAM` | **75/100** | 🟢 TP (Scam Caught) (Digital Arrest & Police Extortion) |
| 15 | `Electricity Bill Alert: Your power supply will be cut off at 9:30...` | **SCAM** | `CRITICAL_SCAM` | **75/100** | 🟢 TP (Scam Caught) (Electricity Bill Disconnection Fraud) |
| 16 | `HDFC Bank Alert: A/c *1092 debited by Rs. 450.00 at Swiggy on 28-...` | **BENIGN** | `SAFE` | **0/100** | 🟢 TN (Benign Verified) (Legitimate Bank Alert) |
| 17 | `492014 is your Amazon verification OTP. Valid for 10 minutes. Do ...` | **BENIGN** | `SAFE` | **0/100** | 🟢 TN (Benign Verified) (Legitimate OTP) |
| 18 | `IRCTC: PNR 2419201940 is Confirmed. Train 12952 Rajdhani Exp, Dat...` | **BENIGN** | `SAFE` | **0/100** | 🟢 TN (Benign Verified) (Legitimate Travel Alert) |
| 19 | `Your Swiggy order from Cafe Goodluck has been placed! Delivery pa...` | **BENIGN** | `SAFE` | **0/100** | 🟢 TN (Benign Verified) (Legitimate Service Update) |
| 20 | `CoWIN: Mr. Rajesh Kumar has been successfully vaccinated with Dos...` | **BENIGN** | `SAFE` | **0/100** | 🟢 TN (Benign Verified) (Legitimate Government Notice) |
| 21 | `State Bank of India: Your account ending with 4821 has available ...` | **BENIGN** | `SAFE` | **0/100** | 🟢 TN (Benign Verified) (Legitimate Bank Alert) |
| 22 | `G-882910 is your Google verification code. Never share this code ...` | **BENIGN** | `SAFE` | **0/100** | 🟢 TN (Benign Verified) (Legitimate OTP) |
| 23 | `Zomato: Order #883921 from Burger King has been delivered. Enjoy ...` | **BENIGN** | `SAFE` | **0/100** | 🟢 TN (Benign Verified) (Legitimate Service Update) |
| 24 | `Flipkart: Your order containing boAt Airdopes has been dispatched...` | **BENIGN** | `SAFE` | **0/100** | 🟢 TN (Benign Verified) (Legitimate Service Update) |
| 25 | `Airtel: Thank you for payment of Rs 399.00 towards your postpaid ...` | **BENIGN** | `SAFE` | **0/100** | 🟢 TN (Benign Verified) (Legitimate Service Update) |
| 26 | `Your Uber ride PIN is 5912. Share this PIN with driver partner Ra...` | **BENIGN** | `SAFE` | **0/100** | 🟢 TN (Benign Verified) (Legitimate OTP) |
| 27 | `BookMyShow: Booking confirmed for Interstellar at PVR Phoenix Pun...` | **BENIGN** | `SAFE` | **0/100** | 🟢 TN (Benign Verified) (Legitimate Service Update) |
| 28 | `Tata Play: Recharge of Rs. 400.00 is successful for Subscriber ID...` | **BENIGN** | `SAFE` | **0/100** | 🟢 TN (Benign Verified) (Legitimate Service Update) |
| 29 | `Indane Gas: Your LPG refill booking order number 449102 has been ...` | **BENIGN** | `SAFE` | **0/100** | 🟢 TN (Benign Verified) (Legitimate Service Update) |
| 30 | `CRED: Payment of Rs. 14,500.00 towards your HDFC Credit Card endi...` | **BENIGN** | `SAFE` | **0/100** | 🟢 TN (Benign Verified) (Legitimate Service Update) |

---

## ⚠️ Key Engineering Learnings
1. **Context Over Keyword Triggering:** Simple keyword filters on words like "OTP" or "Bank" fail miserably because both legitimate transaction notices and phishing messages use them. Contextual classification—distinguishing *'never share your OTP'* from *'enter UPI PIN to receive money'*—is essential to achieve 0% False Negatives.
2. **Reverse UPI Invariant:** Any message requesting an action to receive money via UPI is 100% fraudulent, because the UPI protocol never requires user authentication to credit an account.

---

## 🔁 Reproducibility Command
```bash
cd projects/week-02-scamlens-india/backend
python ..\eval\evaluate.py
```
