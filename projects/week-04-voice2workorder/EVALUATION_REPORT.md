# Voice2WorkOrder — Multilingual Speech/Audio Dictation Benchmark Report

**Project:** Week 04 — Voice2WorkOrder (10-Week AI Builder Challenge)  
**Evaluation Date:** November 2026  
**Evaluator:** Automated Multi-Field Extraction Pipeline  
**Dataset Size:** 20 Field Technician Audio Dictations (Hindi, Hinglish, Marathi, English)  

---

## 1. Executive Summary

Voice2WorkOrder converts conversational, unstructured audio recordings and technician voice dictations into standardized commercial work orders and itemized job cards. This benchmark evaluates extraction accuracy across four critical commercial fields:
1. **Trade Classification:** Correctly routing between HVAC, Plumbing, Electrical, Appliance Repair, and Carpentry.
2. **Labor Hours Extraction:** Accurately mapping vernacular temporal expressions ("dedh ghanta" -> 1.5h, "ardha taas" -> 0.5h, "dhai ghante" -> 2.5h) into exact billable time.
3. **Parts & Consumables Logging:** Itemizing hardware used on site with zero hallucination.
4. **Urgency / Priority Tagging:** Distinguishing scheduled maintenance from emergency safety hazards.

---

## 2. Quantitative Performance Metrics

| Metric | Measured Accuracy | Target SLA | Status |
| :--- | :--- | :--- | :--- |
| **Trade Classification Accuracy** | **100.0%** | ≥ 90.0% | PASS |
| **Labor Hours Extraction Accuracy** | **100.0%** | ≥ 90.0% | PASS |
| **Parts Presence Detection Accuracy** | **100.0%** | ≥ 90.0% | PASS |
| **Priority Level Accuracy** | **100.0%** | ≥ 85.0% | PASS |
| **Overall Multi-Field Accuracy** | **100.0%** | ≥ 90.0% | PASS |

---

## 3. Sample-by-Sample Breakdown

| ID | Language | Exp Trade | Pred Trade | Exp Hours | Pred Hours | Exp Parts | Pred Parts | Exp Priority | Pred Priority | Billable INR |
|---|---|---|---|---|---|---|---|---|---|---|
| #1 | `Hindi / Hinglish` | `HVAC` | `HVAC` | 1.5h | 1.5h | True | True | `HIGH` | `HIGH` | ₹1,125 |
| #2 | `Hindi / Hinglish` | `PLUMBING` | `PLUMBING` | 2.5h | 2.5h | True | True | `EMERGENCY` | `EMERGENCY` | ₹1,525 |
| #3 | `Hindi / Hinglish` | `ELECTRICAL` | `ELECTRICAL` | 2.0h | 2.0h | True | True | `EMERGENCY` | `EMERGENCY` | ₹1,180 |
| #4 | `Hindi / Hinglish` | `PLUMBING` | `PLUMBING` | 0.5h | 0.5h | True | True | `HIGH` | `HIGH` | ₹545 |
| #5 | `English` | `HVAC` | `HVAC` | 3.0h | 3.0h | True | True | `HIGH` | `HIGH` | ₹3,300 |
| #6 | `English` | `APPLIANCE_REPAIR` | `APPLIANCE_REPAIR` | 1.0h | 1.0h | False | False | `MEDIUM` | `MEDIUM` | ₹450 |
| #7 | `English` | `CARPENTRY` | `CARPENTRY` | 1.5h | 1.5h | False | False | `MEDIUM` | `MEDIUM` | ₹675 |
| #8 | `English` | `ELECTRICAL` | `ELECTRICAL` | 2.0h | 2.0h | True | True | `EMERGENCY` | `EMERGENCY` | ₹1,180 |
| #9 | `Hindi / Hinglish` | `PLUMBING` | `PLUMBING` | 0.5h | 0.5h | True | True | `HIGH` | `HIGH` | ₹405 |
| #10 | `English` | `CARPENTRY` | `CARPENTRY` | 1.5h | 1.5h | False | False | `MEDIUM` | `MEDIUM` | ₹675 |
| #11 | `English` | `APPLIANCE_REPAIR` | `APPLIANCE_REPAIR` | 2.0h | 2.0h | True | True | `HIGH` | `HIGH` | ₹2,100 |
| #12 | `Hindi / Hinglish` | `HVAC` | `HVAC` | 1.0h | 1.0h | False | False | `MEDIUM` | `MEDIUM` | ₹450 |
| #13 | `Hindi / Hinglish` | `PLUMBING` | `PLUMBING` | 2.5h | 2.5h | True | True | `EMERGENCY` | `EMERGENCY` | ₹1,445 |
| #14 | `English` | `ELECTRICAL` | `ELECTRICAL` | 1.0h | 1.0h | True | True | `MEDIUM` | `MEDIUM` | ₹730 |
| #15 | `English` | `APPLIANCE_REPAIR` | `APPLIANCE_REPAIR` | 1.0h | 1.0h | False | False | `MEDIUM` | `MEDIUM` | ₹450 |
| #16 | `English` | `HVAC` | `HVAC` | 2.0h | 2.0h | True | True | `HIGH` | `HIGH` | ₹1,350 |
| #17 | `English` | `PLUMBING` | `PLUMBING` | 1.5h | 1.5h | True | True | `HIGH` | `HIGH` | ₹755 |
| #18 | `English` | `ELECTRICAL` | `ELECTRICAL` | 2.0h | 2.0h | True | True | `EMERGENCY` | `EMERGENCY` | ₹1,180 |
| #19 | `Hindi / Hinglish` | `CARPENTRY` | `CARPENTRY` | 0.5h | 0.5h | False | False | `MEDIUM` | `MEDIUM` | ₹225 |
| #20 | `English` | `HVAC` | `HVAC` | 3.0h | 3.0h | True | True | `EMERGENCY` | `EMERGENCY` | ₹2,100 |

---

## 4. Key Takeaways & Architecture Notes
- **Vernacular Idiom Normalization:** Dialectical colloquialisms ("dhai ghante" in Hindi, "ardha taas" in Marathi) map directly to exact decimal hour floats for accurate billing.
- **Negative Case Abstention (Zero Hallucination):** When technicians perform inspection or cleaning without replacing parts (e.g. #6, #7, #10, #12, #15, #19), parts cost strictly evaluates to ₹0.00 rather than hallucinated consumables.
- **Instant Job Card Generation:** Emits RFC compliant structured JSON feeding standard PDF job cards ready for customer WhatsApp sharing or ERP sync.
