from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

SAMPLE_RFP_TEXT = """--- Page 1 ---
CENTRAL PUBLIC WORKS DEPARTMENT (CPWD)
NIT No.: CPWD/NZ/DELHI/2026/NIT-882
Name of Work: Construction of 4-Lane Bypass Arterial Road with bituminous concrete and 2 major bridges in Outer Delhi Region.
Estimated Cost: Rs. 45,00,00,000 (Rupees Forty Five Crores Only)
Earnest Money Deposit (EMD): Rs. 90,00,000 (Rupees Ninety Lakhs Only)
MSE / MSME Exemption: MSE / MSME registered enterprises are exempt from submission of EMD.

--- Page 2 ---
CRITICAL DATES & SUBMISSION SCHEDULE:
Last Date and Time of Bid Submission: 25.11.2026 up to 15:00 Hrs IST

--- Page 3 ---
ELIGIBILITY CRITERIA - FINANCIAL CAPACITY:
Average Annual Financial Turnover during the last 3 financial years should be at least Rs. 13,50,00,000.
Solvency Certificate: The bidder must submit a Bank Solvency Certificate of Rs. 18,00,00,000.

--- Page 4 ---
TECHNICAL EXPERIENCE CRITERIA:
Similar Nature of Work defined as: Execution & successful completion of National/State Highway construction.
Three similar completed works each costing not less than Rs. 18,00,00,000 OR
Two similar completed works each costing not less than Rs. 22,50,00,000 OR
One similar completed work costing not less than Rs. 36,00,00,000.
Joint Venture (JV) is permitted for this tender.

--- Page 5 ---
MANDATORY STATUTORY DOCUMENTS CHECKLIST:
1. Valid GST Registration Certificate.
2. Permanent Account Number (PAN) Card copy.
3. EPF Registration Certificate.
4. Non-Blacklisting Notarized Affidavit on Rs. 100/- non-judicial stamp paper.
5. Signed Integrity Pact on prescribed format.

--- Page 6 ---
PENALTY & CONTRACT CONDITIONS:
Liquidated Damages: Compensation for delay shall be levied @ 0.5% per week of delay subject to a maximum of 10% of total contract value.
Defect Liability Period: 36 months from the date of physical completion.
"""

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert response.json()["service"] == "tenderlens-api"

def test_get_sample_rfps():
    response = client.get("/api/v1/tenders/sample-rfps")
    assert response.status_code == 200
    data = response.json()
    assert "samples" in data
    assert len(data["samples"]) >= 3
    assert "cpwd-highway-01" in [s["id"] for s in data["samples"]]

def test_analyze_tender_extraction():
    payload = {
        "rfp_text": SAMPLE_RFP_TEXT
    }
    response = client.post("/api/v1/tenders/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    
    analysis = data["analysis"]
    basic = analysis["basic_info"]
    assert "CPWD" in basic["issuing_authority"]
    assert basic["tender_id"] == "CPWD/NZ/DELHI/2026/NIT-882"
    assert basic["estimated_cost_inr"] == 450000000.0
    assert basic["emd_amount_inr"] == 9000000.0
    assert basic["emd_msme_exemption"] is True
    
    financial = analysis["financial_eligibility"]
    assert financial["min_average_turnover_inr"] == 135000000.0
    assert financial["solvency_certificate_inr"] == 180000000.0
    
    technical = analysis["technical_eligibility"]
    assert technical["one_work_value_inr"] == 360000000.0
    assert technical["joint_venture_allowed"] is True
    
    assert analysis["pages_analyzed"] == 6
    assert len(analysis["mandatory_checklist"]) >= 5
    assert len(analysis["risk_clauses"]) >= 2

def test_contractor_screening_eligible_msme():
    payload = {
        "rfp_text": SAMPLE_RFP_TEXT,
        "contractor_profile": {
            "contractor_name": "Apex Infrastructure Ltd",
            "annual_turnover_inr": 200000000.0, # 20 Cr > 13.5 Cr required
            "single_largest_work_inr": 400000000.0, # 40 Cr > 36 Cr required
            "solvency_amount_inr": 250000000.0, # 25 Cr > 18 Cr required
            "is_msme_registered": True,
            "available_doc_ids": [
                "gst_cert", "pan_card", "epf_cert", "esic_cert",
                "blacklisting_affidavit", "integrity_pact", "power_of_attorney",
                "audited_balance_sheets", "contractor_enlistment", "emd_receipt_or_msme"
            ]
        }
    }
    response = client.post("/api/v1/tenders/analyze", json=payload)
    assert response.status_code == 200
    screening = response.json()["screening"]
    assert screening["overall_status"] == "ELIGIBLE"
    assert screening["readiness_percentage"] == 100.0
    assert "EXEMPTED" in screening["emd_action"]
    assert len(screening["missing_mandatory_docs"]) == 0

def test_contractor_screening_disqualified():
    payload = {
        "rfp_text": SAMPLE_RFP_TEXT,
        "contractor_profile": {
            "contractor_name": "Small Builder Co",
            "annual_turnover_inr": 50000000.0, # 5 Cr < 13.5 Cr required
            "single_largest_work_inr": 100000000.0, # 10 Cr < 36 Cr required
            "solvency_amount_inr": 50000000.0,
            "is_msme_registered": False,
            "available_doc_ids": ["gst_cert", "pan_card"]
        }
    }
    response = client.post("/api/v1/tenders/analyze", json=payload)
    assert response.status_code == 200
    screening = response.json()["screening"]
    assert screening["overall_status"] == "DISQUALIFIED"
    assert "PAYABLE" in screening["emd_action"]
    assert len(screening["missing_mandatory_docs"]) > 0
