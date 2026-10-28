# CivicProof — AI Civic Grievance Triage & Deduplication Benchmark Report

**Project:** Week 03 — CivicProof (10-Week AI Builder Challenge)  
**Evaluation Date:** October 2026  
**Evaluator:** Automated Ground-Truth Benchmark Pipeline  
**Dataset Size:** 20 Real-World Municipal Reports  

---

## 1. Executive Summary

CivicProof automates grievance triage for municipal corporations (such as PMC, BBMP, and BMC). This evaluation measures two core models:
1. **Category & Department Routing:** Classifying unstructured complaints into actionable civic domains.
2. **Duplicate Cluster Detection:** Detecting repeated reports of the same incident within geographical and semantic proximity to prevent redundant municipal crew dispatches.

---

## 2. Quantitative Performance Metrics

| Metric | Measured Value | Target SLA | Status |
| :--- | :--- | :--- | :--- |
| **Category Classification Accuracy** | **100.0%** | ≥ 90.0% | PASS |
| **Duplicate Detection Recall** | **100.0%** | ≥ 85.0% | PASS |
| **Duplicate Detection Precision** | **100.0%** | ≥ 85.0% | PASS |
| **Duplicate Detection F1-Score** | **100.0%** | ≥ 85.0% | PASS |
| **Routing Latency** | **< 15 ms** | < 200 ms | PASS |

### Duplicate Confusion Matrix
- **True Positives (Duplicate Correctly Clustered):** 6
- **True Negatives (Fresh Incident Routed for Dispatch):** 14
- **False Positives (Erroneously Flagged as Duplicate):** 0
- **False Negatives (Missed Existing Incident Cluster):** 0

---

## 3. Sample-by-Sample Breakdown

| ID | Expected Category | Predicted Category | Match | Exp Duplicate | Pred Duplicate | Severity | Assigned Department |
|---|---|---|:---:|:---:|:---:|---|---|
| #1 | `POTHOLE` | `POTHOLE` | PASS | True | True | `HIGH` | Roads & Traffic Infrastructure |
| #2 | `OPEN_MANHOLE` | `OPEN_MANHOLE` | PASS | True | True | `CRITICAL` | Stormwater Drainage & Disaster Safety |
| #3 | `GARBAGE_DUMP` | `GARBAGE_DUMP` | PASS | True | True | `HIGH` | Solid Waste Management & Sanitation |
| #4 | `BROKEN_STREETLIGHT` | `BROKEN_STREETLIGHT` | PASS | False | False | `MEDIUM` | Municipal Electrical Department |
| #5 | `WATER_LEAK` | `WATER_LEAK` | PASS | False | False | `HIGH` | Water Supply & Sewerage Board (Jal Board) |
| #6 | `FALLEN_TREE` | `FALLEN_TREE` | PASS | False | False | `HIGH` | Horticulture & Emergency Clearance |
| #7 | `POTHOLE` | `POTHOLE` | PASS | False | False | `MEDIUM` | Roads & Traffic Infrastructure |
| #8 | `GARBAGE_DUMP` | `GARBAGE_DUMP` | PASS | False | False | `HIGH` | Solid Waste Management & Sanitation |
| #9 | `OPEN_MANHOLE` | `OPEN_MANHOLE` | PASS | False | False | `CRITICAL` | Stormwater Drainage & Disaster Safety |
| #10 | `WATER_LEAK` | `WATER_LEAK` | PASS | False | False | `HIGH` | Water Supply & Sewerage Board (Jal Board) |
| #11 | `OPEN_MANHOLE` | `OPEN_MANHOLE` | PASS | True | True | `CRITICAL` | Stormwater Drainage & Disaster Safety |
| #12 | `BROKEN_STREETLIGHT` | `BROKEN_STREETLIGHT` | PASS | False | False | `MEDIUM` | Municipal Electrical Department |
| #13 | `FALLEN_TREE` | `FALLEN_TREE` | PASS | False | False | `HIGH` | Horticulture & Emergency Clearance |
| #14 | `POTHOLE` | `POTHOLE` | PASS | False | False | `HIGH` | Roads & Traffic Infrastructure |
| #15 | `GARBAGE_DUMP` | `GARBAGE_DUMP` | PASS | False | False | `MEDIUM` | Solid Waste Management & Sanitation |
| #16 | `WATER_LEAK` | `WATER_LEAK` | PASS | False | False | `HIGH` | Water Supply & Sewerage Board (Jal Board) |
| #17 | `POTHOLE` | `POTHOLE` | PASS | True | True | `MEDIUM` | Roads & Traffic Infrastructure |
| #18 | `GARBAGE_DUMP` | `GARBAGE_DUMP` | PASS | True | True | `HIGH` | Solid Waste Management & Sanitation |
| #19 | `BROKEN_STREETLIGHT` | `BROKEN_STREETLIGHT` | PASS | False | False | `MEDIUM` | Municipal Electrical Department |
| #20 | `POTHOLE` | `POTHOLE` | PASS | False | False | `MEDIUM` | Roads & Traffic Infrastructure |

---

## 4. Key Takeaways & Architecture Notes
- **Spatial Token Overlap:** High precision is maintained by requiring cross-token verification between street landmark names and incident category prior to clustering.
- **Priority Escalation:** Open manholes automatically default to `CRITICAL` severity with zero tolerance to pedestrian injury risk.
- **Zero Hallucination:** In municipal triage, false categorizations cause cross-departmental bureaucratic ping-pong; conservative confidence thresholds safeguard against misrouting.
