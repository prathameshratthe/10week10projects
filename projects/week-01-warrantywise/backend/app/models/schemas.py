from datetime import date, datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, field_validator


class WarrantyStatusEnum(str, Enum):
    ACTIVE = "ACTIVE"
    EXPIRING_SOON = "EXPIRING_SOON"  # <= 30 days
    EXPIRED = "EXPIRED"
    NO_WARRANTY = "NO_WARRANTY"


class ReturnStatusEnum(str, Enum):
    ACTIVE = "ACTIVE"
    EXPIRING_SOON = "EXPIRING_SOON"  # <= 7 days
    EXPIRED = "EXPIRED"
    NO_RETURN = "NO_RETURN"


class ClaimStatusEnum(str, Enum):
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    IN_REVIEW = "IN_REVIEW"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class LineItemSchema(BaseModel):
    name: str = Field(..., description="Name or description of the purchased item")
    quantity: int = Field(default=1, ge=1)
    unit_price: Optional[float] = Field(default=None, ge=0.0)
    total_price: Optional[float] = Field(default=None, ge=0.0)
    category: Optional[str] = Field(default="General")


class ReceiptExtractionResult(BaseModel):
    merchant_name: str = Field(..., description="Name of the store or seller")
    merchant_address: Optional[str] = Field(default=None, description="Physical address or website")
    purchase_date: Optional[str] = Field(default=None, description="Purchase date in YYYY-MM-DD format")
    total_amount: Optional[float] = Field(default=None, ge=0.0, description="Total amount paid")
    tax_amount: Optional[float] = Field(default=None, ge=0.0, description="Taxes paid if stated")
    currency: str = Field(default="USD", description="Currency symbol or 3-letter ISO code")
    invoice_number: Optional[str] = Field(default=None, description="Receipt or invoice number")
    payment_method: Optional[str] = Field(default=None, description="Cash, Credit Card, UPI, etc.")
    items: List[LineItemSchema] = Field(default_factory=list, description="Extracted line items")

    # Warranty fields
    has_explicit_warranty: bool = Field(
        default=False,
        description="True ONLY if warranty is explicitly written on the receipt. Never infer or guess."
    )
    warranty_duration_months: Optional[int] = Field(
        default=None,
        description="Duration in months (e.g. 1 year = 12 months, 2 years = 24 months)"
    )
    warranty_end_date: Optional[str] = Field(
        default=None,
        description="Calculated or explicitly stated expiration date (YYYY-MM-DD)"
    )
    warranty_notes: Optional[str] = Field(
        default=None,
        description="Specific terms stated on receipt, e.g. '1 Year Manufacturer Limited Warranty'"
    )

    # Return policy fields
    has_explicit_return_policy: bool = Field(
        default=False,
        description="True ONLY if return window is explicitly mentioned on the receipt."
    )
    return_window_days: Optional[int] = Field(
        default=None,
        description="Number of return days stated (e.g. 14, 30, 90)"
    )
    return_deadline: Optional[str] = Field(
        default=None,
        description="Last date for return in YYYY-MM-DD format"
    )
    return_notes: Optional[str] = Field(
        default=None,
        description="Return conditions, e.g. '30-day return with original box and receipt'"
    )

    confidence_score: float = Field(default=0.85, ge=0.0, le=1.0)
    extraction_method: str = Field(default="ai", description="gemini | openai | heuristic_mock")
    raw_text: Optional[str] = Field(default=None, description="Extracted raw text from OCR/PDF")


class PurchaseRecordCreate(BaseModel):
    merchant_name: str = Field(..., min_length=1)
    merchant_address: Optional[str] = None
    purchase_date: str = Field(..., description="YYYY-MM-DD")
    total_amount: float = Field(..., ge=0.0)
    tax_amount: Optional[float] = Field(default=None, ge=0.0)
    currency: str = Field(default="USD")
    category: str = Field(default="Electronics")
    invoice_number: Optional[str] = None
    payment_method: Optional[str] = None
    items: List[LineItemSchema] = Field(default_factory=list)

    # Warranty
    has_explicit_warranty: bool = False
    warranty_duration_months: Optional[int] = None
    warranty_end_date: Optional[str] = None
    warranty_notes: Optional[str] = None

    # Return
    has_explicit_return_policy: bool = False
    return_window_days: Optional[int] = None
    return_deadline: Optional[str] = None
    return_notes: Optional[str] = None

    # Meta
    receipt_filename: Optional[str] = None
    notes: Optional[str] = None

    @field_validator("purchase_date")
    @classmethod
    def validate_date(cls, v: str) -> str:
        try:
            datetime.strptime(v, "%Y-%m-%d")
        except ValueError:
            raise ValueError("purchase_date must be in YYYY-MM-DD format")
        return v


class PurchaseRecordUpdate(BaseModel):
    merchant_name: Optional[str] = None
    merchant_address: Optional[str] = None
    purchase_date: Optional[str] = None
    total_amount: Optional[float] = None
    tax_amount: Optional[float] = None
    currency: Optional[str] = None
    category: Optional[str] = None
    invoice_number: Optional[str] = None
    payment_method: Optional[str] = None
    items: Optional[List[LineItemSchema]] = None

    has_explicit_warranty: Optional[bool] = None
    warranty_duration_months: Optional[int] = None
    warranty_end_date: Optional[str] = None
    warranty_notes: Optional[str] = None

    has_explicit_return_policy: Optional[bool] = None
    return_window_days: Optional[int] = None
    return_deadline: Optional[str] = None
    return_notes: Optional[str] = None

    notes: Optional[str] = None


class PurchaseRecordResponse(BaseModel):
    id: int
    merchant_name: str
    merchant_address: Optional[str] = None
    purchase_date: str
    total_amount: float
    tax_amount: Optional[float] = None
    currency: str
    category: str
    invoice_number: Optional[str] = None
    payment_method: Optional[str] = None
    items: List[LineItemSchema] = []

    has_explicit_warranty: bool
    warranty_duration_months: Optional[int] = None
    warranty_end_date: Optional[str] = None
    warranty_notes: Optional[str] = None
    warranty_status: WarrantyStatusEnum
    days_left_warranty: Optional[int] = None

    has_explicit_return_policy: bool
    return_window_days: Optional[int] = None
    return_deadline: Optional[str] = None
    return_notes: Optional[str] = None
    return_status: ReturnStatusEnum
    days_left_return: Optional[int] = None

    receipt_filename: Optional[str] = None
    notes: Optional[str] = None
    created_at: str
    updated_at: str

    model_config = {"from_attributes": True}


class DashboardStats(BaseModel):
    total_records: int
    active_warranties: int
    expiring_soon_warranties: int
    expired_warranties: int
    active_returns: int
    expiring_soon_returns: int
    expired_returns: int
    total_spend_by_currency: Dict[str, float]


# --- Enterprise User & Auth Schemas ---

class UserSignup(BaseModel):
    email: str
    password: str = Field(..., min_length=6)
    full_name: str
    organization_name: str = "Enterprise Vault"


class UserLogin(BaseModel):
    email: str
    password: str


class DemoLoginRequest(BaseModel):
    role: str = "admin"  # admin | consumer


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    organization_name: str
    role: str
    api_key: Optional[str] = None
    created_at: str

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class ApiKeyResponse(BaseModel):
    api_key: str
    message: str


# --- Warranty Claim Schemas ---

class WarrantyClaimCreate(BaseModel):
    record_id: int
    title: str
    issue_description: str
    desired_resolution: str = "Repair"  # Repair, Replacement, Refund
    repair_cost_claimed: Optional[float] = None
    status: ClaimStatusEnum = ClaimStatusEnum.SUBMITTED


class WarrantyClaimUpdate(BaseModel):
    title: Optional[str] = None
    issue_description: Optional[str] = None
    desired_resolution: Optional[str] = None
    status: Optional[ClaimStatusEnum] = None
    tracking_number: Optional[Optional[str]] = None
    repair_cost_claimed: Optional[float] = None
    claim_letter_body: Optional[str] = None


class WarrantyClaimResponse(BaseModel):
    id: int
    record_id: int
    claim_number: str
    title: str
    issue_description: str
    desired_resolution: str
    status: ClaimStatusEnum
    filing_date: str
    claim_letter_body: Optional[str] = None
    tracking_number: Optional[str] = None
    repair_cost_claimed: Optional[float] = None
    created_at: str
    updated_at: str

    # Associated record details for UI convenience
    merchant_name: Optional[str] = None
    product_name: Optional[str] = None
    purchase_date: Optional[str] = None
    warranty_end_date: Optional[str] = None

    model_config = {"from_attributes": True}


class GenerateClaimLetterRequest(BaseModel):
    record_id: int
    issue_description: str
    desired_resolution: str = "Repair"
    user_name: Optional[str] = None
    user_contact: Optional[str] = None


class ClaimLetterResponse(BaseModel):
    letter_body: str
    claim_number: str
    statutory_citations: List[str]
    subject: str


# --- Notification Schemas ---

class NotificationResponse(BaseModel):
    id: int
    type: str
    severity: str
    title: str
    message: str
    record_id: Optional[int] = None
    read: bool
    created_at: str

    model_config = {"from_attributes": True}


class NotificationCreate(BaseModel):
    type: str = "SYSTEM"
    severity: str = "info"
    title: str
    message: str
    record_id: Optional[int] = None


# --- Advanced Analytics Schemas ---

class CategorySpendItem(BaseModel):
    category: str
    total_amount: float
    percentage: float
    item_count: int


class ExpirationTimelineItem(BaseModel):
    period: str  # e.g. "Next 30 Days", "31-60 Days", "Q3 2026", "2027+"
    count: int
    total_insured_value: float


class VendorReliabilityItem(BaseModel):
    vendor: str
    records_count: int
    active_warranties: int
    claims_filed: int
    reliability_score: float  # 0 to 100


class AnalyticsSummaryResponse(BaseModel):
    total_portfolio_value: float
    capital_at_risk: float  # Value of items expiring in < 60 days
    total_active_warranties: int
    total_claims_active: int
    claims_settlement_rate: float
    category_distribution: List[CategorySpendItem]
    expiration_timeline: List[ExpirationTimelineItem]
    vendor_reliability: List[VendorReliabilityItem]
