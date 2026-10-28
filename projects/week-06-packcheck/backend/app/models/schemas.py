from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class DocType(str, Enum):
    GST_CERTIFICATE = "GST_CERTIFICATE"
    PAN_CARD = "PAN_CARD"
    BANK_CHEQUE = "BANK_CHEQUE"
    UDYAM_MSME = "UDYAM_MSME"
    COI = "COI"
    ISO_CERTIFICATE = "ISO_CERTIFICATE"


class DocStatus(str, Enum):
    PRESENT_VERIFIED = "PRESENT_VERIFIED"
    EXPIRED = "EXPIRED"
    NAME_MISMATCH = "NAME_MISMATCH"
    INVALID_TAX_ID = "INVALID_TAX_ID"
    MISSING = "MISSING"


class OnboardingVerdict(str, Enum):
    APPROVED = "APPROVED"
    CONDITIONAL_APPROVAL = "CONDITIONAL_APPROVAL"
    REJECTED = "REJECTED"


class ExtractedDoc(BaseModel):
    doc_type: DocType
    document_name: str
    status: DocStatus
    extracted_entity_name: Optional[str] = None
    extracted_identifier: Optional[str] = None
    expiry_date: Optional[str] = None
    is_expired: bool = False
    findings: str


class CrossEntityCheck(BaseModel):
    check_name: str
    passed: bool
    details: str
    severity: str  # HIGH, MEDIUM, LOW


class VendorDossier(BaseModel):
    vendor_registered_name: str
    vendor_pan: Optional[str] = None
    vendor_gstin: Optional[str] = None
    bank_account_holder: Optional[str] = None
    bank_ifsc: Optional[str] = None
    documents: List[ExtractedDoc] = []


class VerificationScorecard(BaseModel):
    vendor_registered_name: str
    compliance_score: float = Field(..., ge=0.0, le=100.0)
    verdict: OnboardingVerdict
    total_docs_required: int = 5
    docs_verified_count: int
    docs_missing_count: int
    docs_flagged_count: int
    cross_entity_checks: List[CrossEntityCheck] = []
    red_flags: List[str] = []
    recommendations: List[str] = []
    audit_timestamp: str
