from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    TenderAnalysisRequest, TenderAnalysisResponse, ContractorProfile
)
from app.services.tender_analyzer import TenderAnalyzerService

router = APIRouter()
analyzer_service = TenderAnalyzerService()

SAMPLE_RFPS = [
    {
        "id": "cpwd-highway-01",
        "title": "CPWD 4-Lane Bypass Highway Construction (₹ 45.0 Cr)",
        "authority": "CPWD (Central Public Works Department)",
        "text": """--- Page 1 ---
CENTRAL PUBLIC WORKS DEPARTMENT (CPWD)
NOTICE INVITING TENDER (NIT)
NIT No.: CPWD/NZ/DELHI/2026/NIT-882
Name of Work: Construction of 4-Lane Bypass Arterial Road with bituminous concrete and 2 major bridges in Outer Delhi Region.
Estimated Cost: Rs. 45,00,00,000 (Rupees Forty Five Crores Only)
Earnest Money Deposit (EMD): Rs. 90,00,000 (Rupees Ninety Lakhs Only)
Cost of Tender Document: Nil (Free on portal)
MSE / MSME Exemption: MSE / MSME registered enterprises are exempt from submission of EMD upon submission of valid Udyam Registration Certificate.

--- Page 2 ---
CRITICAL DATES & SUBMISSION SCHEDULE:
Last Date and Time of Bid Submission: 25.11.2026 up to 15:00 Hrs IST
Pre-bid Meeting: 10.11.2026 at 11:00 AM IST via Video Conference
Technical Bid Opening: 26.11.2026 at 15:30 Hrs IST
Financial Bid Opening: To be notified after technical evaluation.

--- Page 3 ---
ELIGIBILITY CRITERIA - FINANCIAL CAPACITY:
Average Annual Financial Turnover during the last 3 financial years (FY 2023-24, 2024-25, 2025-26) should be at least Rs. 13,50,00,000 (30% of estimated cost).
Solvency Certificate: The bidder must submit a Bank Solvency Certificate of Rs. 18,00,00,000 (40% of estimated cost) issued by a Scheduled Commercial Bank.
Net Worth: Bidder must possess positive net worth certified by Chartered Accountant with unique UDIN.

--- Page 4 ---
TECHNICAL EXPERIENCE CRITERIA:
Similar Nature of Work defined as: Execution & successful completion of National/State Highway construction with Bituminous Macadam (DBM) and RCC flyovers.
Bidder should have satisfactorily completed during the last 7 years ending 31.10.2026:
- Three similar completed works each costing not less than Rs. 18,00,00,000 (40% of estimated cost) OR
- Two similar completed works each costing not less than Rs. 22,50,00,000 (50% of estimated cost) OR
- One similar completed work costing not less than Rs. 36,00,00,000 (80% of estimated cost).
Joint Venture (JV) is permitted for this tender subject to lead partner holding minimum 51% equity.

--- Page 5 ---
MANDATORY STATUTORY DOCUMENTS CHECKLIST:
1. Valid GST Registration Certificate with active tax status.
2. Permanent Account Number (PAN) Card copy.
3. EPF Registration Certificate & latest monthly deposit challan.
4. ESIC Registration Certificate.
5. Non-Blacklisting Notarized Affidavit on Rs. 100/- non-judicial stamp paper.
6. Signed Integrity Pact on prescribed format.
7. Notarized Power of Attorney authorizing bid signatory.
8. Audited Balance Sheets for last 3 financial years certified by CA with valid UDIN.
9. Proof of EMD deposit or valid MSME Udyam Certificate.

--- Page 6 ---
PENALTY & CONTRACT CONDITIONS:
Liquidated Damages: Compensation for delay shall be levied @ 0.5% per week of delay subject to a maximum of 10% of total contract value.
Defect Liability Period: 36 months from the date of physical completion of the work.
Price Escalation: Fixed price contract; no price escalation clause applicable.
EMD Forfeiture: Full forfeiture of EMD if bidder withdraws bid during validity period of 90 days.
"""
    },
    {
        "id": "railways-station-02",
        "title": "Indian Railways Station Modernization & Signal Works (₹ 18.5 Cr)",
        "authority": "Indian Railways (Western Railway)",
        "text": """--- Page 1 ---
WESTERN RAILWAY - ENGINEERING DEPARTMENT
TENDER NOTICE NO.: WR-ENGG-BCT-2026-T-412
Title of Work: Station modernization, passenger amenities, automated escalators, and electronic interlocking signaling at Ratlam Division.
Estimated Tender Value: Rs. 18,50,00,000/- (Rupees Eighteen Crores Fifty Lakhs Only)
Earnest Money Deposit (EMD): Rs. 10,75,000/-
Tender Fee: Rs. 10,000/-
MSME Exemption: Micro and Small Enterprises are exempt from payment of EMD as per Indian Railways Public Procurement Policy.

--- Page 2 ---
IMPORTANT MILESTONES:
Last Date and Time for Bid Submission: 18.11.2026 up to 14:00 Hrs IST
Pre-bid Conference: 04.11.2026 at 11:30 AM at Divisional Railway Manager Office
Technical Bid Opening: 18.11.2026 at 15:00 Hrs IST

--- Page 3 ---
ELIGIBILITY CONDITIONS:
Average Annual Turnover: Contractor must have minimum average annual financial turnover of Rs. 9,25,00,000 during the preceding three financial years.
Bank Solvency: Solvency Certificate of Rs. 7,40,000 issued by Scheduled Bank.
Similar Nature of Work defined as: Civil and electrical modernization of railway stations, metro stations, or airport terminals.
Work Experience:
One similar completed work costing at least Rs. 14,80,00,000 (80%) OR
Two similar completed works costing at least Rs. 9,25,00,000 (50%).
Joint Venture (JV) is not allowed for contracts below Rs. 20 Crores.

--- Page 4 ---
CHECKLIST OF MANDATORY ATTACHMENTS:
- Goods and Services Tax (GST) Certificate
- Income Tax PAN card
- EPF Registration Certificate & EPF code
- Notarized Affidavit stating non-debarment by Indian Railways
- Pre-contract Integrity Pact signed and sealed
- Power of Attorney for authorized representative
- CA Audited Balance Sheet with UDIN

--- Page 5 ---
RISK FACTORS:
Liquidated Damages: Delay penalty levied up to 10% of accepted contract value.
Defect Liability Period: Defect liability period shall be 24 months.
EMD Forfeiture: Forfeiture of EMD if bid conditions breached.
"""
    },
    {
        "id": "gem-cloud-03",
        "title": "GeM Cloud Infrastructure & Managed DevSecOps (₹ 6.2 Cr)",
        "authority": "GeM (Government e-Marketplace)",
        "text": """--- Page 1 ---
GOVERNMENT E-MARKETPLACE (GeM)
GeM Bid No: GEM/2026/B/8941029
Title: Supply, Deployment & 3-Year Managed DevSecOps Services for Ministry Enterprise Data Platform.
Estimated Value: Rs. 6,20,00,000 (Rupees Six Crores Twenty Lakhs Only)
Bid Security / EMD: Rs. 12,40,000
MSE Exemption: Startups and MSEs are exempt from EMD and prior experience criteria subject to meeting quality standards.

--- Page 2 ---
TIMELINES:
Bid Submission End Date: 12.11.2026 at 17:00 Hrs
Technical Bid Opening: 12.11.2026 at 17:30 Hrs
Pre-bid Meeting: 02.11.2026 at 14:00 Hrs Online

--- Page 3 ---
TECHNICAL & FINANCIAL CLAUSES:
Annual Turnover: Average annual turnover of last 3 years must be Rs. 1,86,00,000 (30%).
Similar Nature of Work defined as: Enterprise Cloud Architecture and Kubernetes DevOps infrastructure operations.
Past Experience: One work of Rs. 4,96,00,000 or two works of Rs. 3,10,00,000.
Joint Venture: Joint Venture not permitted.

--- Page 4 ---
MANDATORY BID ANNEXURES:
- Valid GST Registration
- PAN card
- Non-Blacklisting Affidavit
- ISO 27001 / SOC-2 certification proof
- Integrity Pact
- CA Certified Net Worth statement with UDIN
- MSME Udyam Certificate (if claiming exemption)

--- Page 5 ---
SPECIAL TERMS:
Liquidated Damages: 1% per week up to maximum 10% for service SLA breaches.
"""
    }
]

@router.get("/sample-rfps")
def get_sample_rfps():
    return {"samples": SAMPLE_RFPS}

@router.post("/analyze", response_model=TenderAnalysisResponse)
def analyze_tender(request: TenderAnalysisRequest):
    if not request.rfp_text or len(request.rfp_text.strip()) < 50:
        raise HTTPException(status_code=400, detail="RFP document text is too short or empty.")
    
    analysis = analyzer_service.analyze_tender(request.rfp_text)
    
    screening = None
    if request.contractor_profile:
        screening = analyzer_service.screen_contractor(analysis, request.contractor_profile)
        
    return TenderAnalysisResponse(
        analysis=analysis,
        screening=screening
    )
