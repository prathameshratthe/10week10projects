from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class PageCitation(BaseModel):
    page: int = Field(..., description="1-indexed page number where clause was found")
    excerpt: str = Field(..., description="Verbatim quote from the tender text")

class TenderBasicInfo(BaseModel):
    tender_id: str = Field(..., description="Tender Reference Number / NIT No / GeM Bid No")
    issuing_authority: str = Field(..., description="Authority issuing the tender e.g. CPWD, GeM, Railways, NHAI")
    title_of_work: str = Field(..., description="Title / description of the procurement")
    estimated_cost_inr: float = Field(0.0, description="Estimated tender value in INR")
    tender_fee_inr: float = Field(0.0, description="Tender fee / document fee in INR (0 if free)")
    emd_amount_inr: float = Field(0.0, description="Earnest Money Deposit / Bid Security in INR")
    emd_msme_exemption: bool = Field(False, description="Whether MSME / NSIC are exempt from EMD")
    submission_deadline: str = Field(..., description="Bid submission last date and time")
    pre_bid_meeting: Optional[str] = Field(None, description="Pre-bid meeting date and venue")
    tech_bid_opening: Optional[str] = Field(None, description="Technical bid opening date")
    citation: Optional[PageCitation] = None

class FinancialEligibility(BaseModel):
    min_average_turnover_inr: float = Field(0.0, description="Minimum average annual turnover required in INR")
    turnover_years: int = Field(3, description="Number of financial years considered")
    solvency_certificate_inr: float = Field(0.0, description="Solvency certificate or banker certificate amount")
    net_worth_positive: bool = Field(True, description="Whether positive net worth is mandatory")
    audit_udin_mandatory: bool = Field(True, description="Whether Chartered Accountant UDIN is mandatory")
    citation: Optional[PageCitation] = None

class TechnicalEligibility(BaseModel):
    similar_work_definition: str = Field(..., description="Exact definition of qualifying similar work")
    one_work_value_inr: float = Field(0.0, description="Value of 1 single work (typically 80% of estimate)")
    two_works_value_inr: float = Field(0.0, description="Value of 2 works each (typically 50% of estimate)")
    three_works_value_inr: float = Field(0.0, description="Value of 3 works each (typically 40% of estimate)")
    lookback_period_years: int = Field(7, description="Eligible past experience window in years")
    joint_venture_allowed: bool = Field(False, description="Whether Joint Ventures / Consortia are permitted")
    citation: Optional[PageCitation] = None

class ChecklistItem(BaseModel):
    doc_id: str
    doc_name: str
    is_mandatory: bool = True
    description: str
    citation: Optional[PageCitation] = None

class RiskClause(BaseModel):
    category: str = Field(..., description="e.g. Liquidated Damages, Defect Liability, Payment Terms, Forfeiture")
    severity: str = Field(..., description="HIGH, MEDIUM, LOW")
    clause_summary: str
    citation: PageCitation

class TenderAnalysisResult(BaseModel):
    basic_info: TenderBasicInfo
    financial_eligibility: FinancialEligibility
    technical_eligibility: TechnicalEligibility
    mandatory_checklist: List[ChecklistItem]
    risk_clauses: List[RiskClause]
    pages_analyzed: int
    summary_verdict: str

class ContractorProfile(BaseModel):
    contractor_name: str = "Candidate Contractor"
    annual_turnover_inr: float = 0.0
    single_largest_work_inr: float = 0.0
    solvency_amount_inr: float = 0.0
    is_msme_registered: bool = False
    available_doc_ids: List[str] = Field(default_factory=list)

class GateVerdict(BaseModel):
    gate_name: str
    passed: bool
    required: str
    actual: str
    notes: str

class ScreeningVerdict(BaseModel):
    overall_status: str = Field(..., description="ELIGIBLE, DISQUALIFIED, or AT_RISK")
    fit_score_percentage: float
    gates: List[GateVerdict]
    emd_action: str
    missing_mandatory_docs: List[str]
    readiness_percentage: float
    actionable_recommendations: List[str]

class TenderAnalysisRequest(BaseModel):
    rfp_text: str = Field(..., description="Tender RFP document text, optionally formatted with --- Page X --- markers")
    contractor_profile: Optional[ContractorProfile] = None

class TenderAnalysisResponse(BaseModel):
    analysis: TenderAnalysisResult
    screening: Optional[ScreeningVerdict] = None
