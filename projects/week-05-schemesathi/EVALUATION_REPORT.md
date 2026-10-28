# SchemeSathi — Indian Welfare Scheme Grounding & Citation Benchmark Report

**Project:** Week 05 — SchemeSathi (10-Week AI Builder Challenge)  
**Evaluation Date:** November 2026  
**Evaluator:** Automated Multi-Scheme Citation & Negative-Abstention Harness  
**Scope:** 6 National & State Schemes (PM-KISAN, Ayushman Bharat, PMAY-G, Sukanya Samriddhi, Majhi Ladki Bahin, PM SVANidhi) across 20 Diverse Citizen Profiles (120 total determinations)  

---

## 1. Executive Summary

Navigating welfare eligibility requires absolute precision. False promises waste days of vulnerable citizens' time at government collectorates and common service centers (CSCs). SchemeSathi implements:
1. **Strict Exclusion Filtering:** Explicitly verifying tax filing status, landholding limits, and government employment exclusions.
2. **Negative-Case Abstention:** Transparently stating ineligibility rather than hallucinating benefits.
3. **Deterministic Gazette Grounding:** Every single positive or negative determination is tied to the exact clause of the ministry operational guidelines.

---

## 2. Quantitative Performance Metrics

| Metric | Measured Value | Target SLA | Status |
| :--- | :--- | :--- | :--- |
| **Profile Multi-Scheme Accuracy** | **100.0%** | ≥ 95.0% | PASS |
| **Gazette Citation Coverage** | **100.0%** | 100.0% | PASS |
| **False Promise Rate (Hallucinated Benefit)** | **0.0%** | 0.0% | PASS |
| **Negative Abstention Precision** | **100.0%** | ≥ 95.0% | PASS |
| **Evaluation Latency** | **< 10 ms** | < 100 ms | PASS |

---

## 3. Sample-by-Sample Breakdown

| ID | Citizen Profile | Occupation | Income (₹) | Taxpayer | Eligible Schemes | Ineligible (Abstained) | Total Benefit (₹) | Status |
|---|---|---|---|---|---|---|---|:---:|
| #1 | Ramesh Patil | `FARMER` | ₹120,000 | False | 3 schemes | 3 schemes | ₹626,000 | PASS |
| #2 | Sunita Deshmukh | `HOMEMAKER` | ₹150,000 | False | 3 schemes | 3 schemes | ₹668,000 | PASS |
| #3 | Vikram Singh | `SALARIED_PRIVATE` | ₹1,800,000 | True | 1 schemes | 5 schemes | ₹150,000 | PASS |
| #4 | Mohammad Aslam | `STREET_VENDOR` | ₹95,000 | False | 3 schemes | 3 schemes | ₹670,000 | PASS |
| #5 | Pooja Sharma | `DAILY_WAGE_LABORER` | ₹80,000 | False | 3 schemes | 3 schemes | ₹770,000 | PASS |
| #6 | Anil Kumar (Govt Officer) | `GOVERNMENT_EMPLOYEE` | ₹1,200,000 | True | 0 schemes | 6 schemes | ₹0 | PASS |
| #7 | Lakshmi Narayanan | `HOMEMAKER` | ₹210,000 | False | 2 schemes | 4 schemes | ₹518,000 | PASS |
| #8 | Balwinder Singh | `FARMER` | ₹180,000 | False | 2 schemes | 4 schemes | ₹506,000 | PASS |
| #9 | Priyanka Kadam | `SALARIED_PRIVATE` | ₹450,000 | True | 1 schemes | 5 schemes | ₹150,000 | PASS |
| #10 | Gopal Das | `STREET_VENDOR` | ₹85,000 | False | 3 schemes | 3 schemes | ₹670,000 | PASS |
| #11 | Manju Devi | `DAILY_WAGE_LABORER` | ₹72,000 | False | 3 schemes | 3 schemes | ₹770,000 | PASS |
| #12 | Siddharth Rao | `STUDENT` | ₹0 | False | 1 schemes | 5 schemes | ₹500,000 | PASS |
| #13 | Suresh Gawande (Taxpayer Farmer) | `FARMER` | ₹900,000 | True | 0 schemes | 6 schemes | ₹0 | PASS |
| #14 | Amina Khatun | `HOMEMAKER` | ₹110,000 | False | 3 schemes | 3 schemes | ₹638,000 | PASS |
| #15 | Raghavan Iyer | `UNEMPLOYED` | ₹200,000 | False | 1 schemes | 5 schemes | ₹500,000 | PASS |
| #16 | Deepak Jadhav | `FARMER` | ₹160,000 | False | 4 schemes | 2 schemes | ₹776,000 | PASS |
| #17 | Meera Joshi | `STUDENT` | ₹50,000 | False | 1 schemes | 5 schemes | ₹500,000 | PASS |
| #18 | Kavita Shinde | `HOMEMAKER` | ₹100,000 | False | 1 schemes | 5 schemes | ₹500,000 | PASS |
| #19 | Chhotu Lal | `STREET_VENDOR` | ₹110,000 | False | 2 schemes | 4 schemes | ₹550,000 | PASS |
| #20 | Kiran Bedi | `GOVERNMENT_EMPLOYEE` | ₹2,000,000 | True | 0 schemes | 6 schemes | ₹0 | PASS |

---

## 4. Key Takeaways & Architecture Notes
- **Zero Hallucination Standard:** In social welfare, false positives are worse than conservative abstention. High earners (#3, #6, #13, #20) are strictly disqualified from BPL and small farmer schemes with exact exclusion clauses cited.
- **Multilingual Support Ready:** Output schemas provide plain-language explanations in simple Hindi, Marathi, and English with direct URLs to official portals (pmkisan.gov.in, pmjay.gov.in, ladakibahin.maharashtra.gov.in).
- **Mandatory Document Checklist:** Every eligible scheme pairs with the exact required government documentation (7/12 extract, Aadhaar DBT-seeding, ration card tier, town vending committee certificates) to prevent citizen rejection at Common Service Centers (CSCs).
