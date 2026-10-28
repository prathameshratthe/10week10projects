from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class Gender(str, Enum):
    MALE = "MALE"
    FEMALE = "FEMALE"
    OTHER = "OTHER"


class OccupationType(str, Enum):
    FARMER = "FARMER"
    STREET_VENDOR = "STREET_VENDOR"
    DAILY_WAGE_LABORER = "DAILY_WAGE_LABORER"
    SALARIED_PRIVATE = "SALARIED_PRIVATE"
    GOVERNMENT_EMPLOYEE = "GOVERNMENT_EMPLOYEE"
    HOMEMAKER = "HOMEMAKER"
    UNEMPLOYED = "UNEMPLOYED"
    STUDENT = "STUDENT"


class SchemeEligibilityStatus(str, Enum):
    ELIGIBLE = "ELIGIBLE"
    NOT_ELIGIBLE = "NOT_ELIGIBLE"
    NEEDS_MORE_INFO = "NEEDS_MORE_INFO"


class CitizenProfile(BaseModel):
    name: Optional[str] = "Citizen"
    age: int = Field(..., ge=1, le=120)
    gender: Gender
    state: str = Field(..., description="Indian State or UT e.g. Maharashtra, Uttar Pradesh, Karnataka")
    annual_income_inr: float = Field(..., ge=0.0)
    occupation: OccupationType
    landholding_acres: float = Field(default=0.0, ge=0.0)
    owns_pucca_house: bool = False
    has_girl_child_under_10: bool = False
    is_income_tax_payer: bool = False


class SchemeMatch(BaseModel):
    scheme_code: str
    scheme_name: str
    ministry: str
    status: SchemeEligibilityStatus
    annual_financial_benefit_inr: float
    explanation: str
    mandatory_documents: List[str]
    official_portal_url: str
    official_gazette_citation: str


class SchemeSathiResponse(BaseModel):
    citizen_name: str
    eligible_schemes: List[SchemeMatch]
    ineligible_schemes: List[SchemeMatch]
    total_potential_benefit_inr: float
    abstention_count: int
    citations_count: int
