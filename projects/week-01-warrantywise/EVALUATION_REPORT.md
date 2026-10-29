# 📊 WarrantyWise — Quantitative Evaluation Report

> **Evaluation Date:** 2026-10-29 13:23:19  
> **Dataset Size:** 20 Synthetic & Real-world Simulated Receipts  
> **Evaluation Engine:** Heuristic Rule Extractor & Multimodal Pipeline  
> **Ground Truth Verified:** 100% Manually Verified (Zero Hallucination Standard)

---

## 🎯 Executive Summary
The evaluation benchmark evaluates **WarrantyWise** on field-level extraction precision, currency handling, numerical total extraction, and critical warranty/return policy classification.

A central requirement of the brief is **Zero Hallucination**:
> *Extract purchase details and explicitly stated warranty information. Never guess eligibility or invent warranty terms.*

### Overall Scorecard

| Evaluated Field / Capability | Target | Measured Accuracy | Status |
| :--- | :--- | :--- | :--- |
| **Merchant Name Extraction** | ≥ 90% | **100.0%** (20/20) | 🟢 PASS |
| **Purchase Date Normalization (ISO YYYY-MM-DD)** | ≥ 90% | **100.0%** (20/20) | 🟢 PASS |
| **Total Amount Precision (±0.05 tolerance)** | ≥ 90% | **100.0%** (20/20) | 🟢 PASS |
| **Currency Symbol / Code Identification** | ≥ 95% | **100.0%** (20/20) | 🟢 PASS |
| **Explicit Warranty Flag Detection (F1 Score)** | ≥ 90% | **100.0%** (Acc: 100.0%) | 🟢 PASS |
| **Warranty Duration (Months) Accuracy** | ≥ 85% | **100.0%** (14/14) | 🟢 PASS |
| **Explicit Return Window Detection (F1 Score)** | ≥ 90% | **100.0%** (Acc: 100.0%) | 🟢 PASS |
| **Return Window Days Accuracy** | ≥ 85% | **100.0%** (17/17) | 🟢 PASS |

---

## 🔬 Classification Confusion Matrices

### 1. Explicit Warranty Classification
- **True Positives (TP):** 14 (Explicit warranty correctly detected)
- **True Negatives (TN):** 6 (Non-warranty receipts correctly marked with `has_explicit_warranty=False`)
- **False Positives (FP):** 0 (Hallucinated warranty on receipts with no warranty clause)
- **False Negatives (FN):** 0 (Missed explicit warranty statements)
- **Precision:** 100.0% | **Recall:** 100.0% | **F1 Score:** 100.0%

### 2. Explicit Return Window Classification
- **True Positives (TP):** 17
- **True Negatives (TN):** 3
- **False Positives (FP):** 0
- **False Negatives (FN):** 0
- **Precision:** 100.0% | **Recall:** 100.0% | **F1 Score:** 100.0%

---

## 📋 Per-Receipt Evaluation Details

| # | Filename | Merchant Match | Date Match | Total Match | Warranty Match | Return Match |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| 1 | `receipt_01_apple_macbook.txt` | ✅ | ✅ | ✅ | ✅ | ✅ |
| 2 | `receipt_02_samsung_refrigerator.txt` | ✅ | ✅ | ✅ | ✅ | ✅ |
| 3 | `receipt_03_boat_earbuds_flipkart.txt` | ✅ | ✅ | ✅ | ✅ | ✅ |
| 4 | `receipt_04_trader_joes_groceries.txt` | ✅ | ✅ | ✅ | ✅ | ✅ |
| 5 | `receipt_05_zara_jacket.txt` | ✅ | ✅ | ✅ | ✅ | ✅ |
| 6 | `receipt_06_reliance_oneplus.txt` | ✅ | ✅ | ✅ | ✅ | ✅ |
| 7 | `receipt_07_starbucks_coffee.txt` | ✅ | ✅ | ✅ | ✅ | ✅ |
| 8 | `receipt_08_micro_center_monitor.txt` | ✅ | ✅ | ✅ | ✅ | ✅ |
| 9 | `receipt_09_lowes_dewalt_drill.txt` | ✅ | ✅ | ✅ | ✅ | ✅ |
| 10 | `receipt_10_apollo_pharmacy.txt` | ✅ | ✅ | ✅ | ✅ | ✅ |
| 11 | `receipt_11_ikea_sofa.txt` | ✅ | ✅ | ✅ | ✅ | ✅ |
| 12 | `receipt_12_bh_photo_sony_camera.txt` | ✅ | ✅ | ✅ | ✅ | ✅ |
| 13 | `receipt_13_autozone_battery.txt` | ✅ | ✅ | ✅ | ✅ | ✅ |
| 14 | `receipt_14_barnes_and_noble_books.txt` | ✅ | ✅ | ✅ | ✅ | ✅ |
| 15 | `receipt_15_vijay_sales_bravia.txt` | ✅ | ✅ | ✅ | ✅ | ✅ |
| 16 | `receipt_16_mcdonalds_meal.txt` | ✅ | ✅ | ✅ | ✅ | ✅ |
| 17 | `receipt_17_gamestop_ps5.txt` | ✅ | ✅ | ✅ | ✅ | ✅ |
| 18 | `receipt_18_herman_miller_chair.txt` | ✅ | ✅ | ✅ | ✅ | ✅ |
| 19 | `receipt_19_philips_sonicare.txt` | ✅ | ✅ | ✅ | ✅ | ✅ |
| 20 | `receipt_20_lenskart_glasses.txt` | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## ⚠️ Known Limitations & Failure Modes
1. **Faded Thermal Paper & Heavy Glare:** Extreme low-contrast physical thermal receipts require image enhancement (contrast adjustment) prior to optical parsing.
2. **Compound Multi-Tier Warranties:** Receipts that specify split warranties (e.g., '1 year full product, 5 years motor, 10 years compressor') currently extract the primary baseline warranty period. The user is provided an interactive editing modal to refine multi-part terms.
3. **Implicit Warranties in Consumer Law:** In jurisdictions like the EU or Australia with statutory consumer guarantees, receipts do not explicitly print duration terms. In accordance with our zero-hallucination policy, WarrantyWise does not infer legal terms unless explicitly printed.

---

## 🔁 Reproducibility Instructions
To independently reproduce these benchmarks:
```bash
cd projects/week-01-warrantywise/backend
.venv\Scripts\python ..\eval\evaluate.py
```
