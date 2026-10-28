from datetime import datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class VerdictEnum(str, Enum):
    SAFE = "SAFE"
    SUSPICIOUS = "SUSPICIOUS"
    CRITICAL_SCAM = "CRITICAL_SCAM"


class EntityType(str, Enum):
    URL = "URL"
    SHORTENER = "SHORTENER"
    APK_DOWNLOAD = "APK_DOWNLOAD"
    UPI_ID = "UPI_ID"
    PHONE_NUMBER = "PHONE_NUMBER"
    BANK_ACCOUNT = "BANK_ACCOUNT"


class ExtractedEntity(BaseModel):
    entity_type: EntityType
    value: str
    risk_level: str  # HIGH, MEDIUM, LOW
    notes: Optional[str] = None


class RedFlag(BaseModel):
    title: str
    category: str
    severity: str  # CRITICAL, HIGH, MEDIUM
    explanation: str
    evidence_snippet: str


class MessageScanRequest(BaseModel):
    message_text: str = Field(..., min_length=2, description="Content of the SMS, WhatsApp, or UPI message")
    sender_id: Optional[str] = Field(default=None, description="Sender name, phone number, or SMS header (e.g. AX-SBIINB)")
    message_type: str = Field(default="SMS", description="SMS | WhatsApp | UPI | Email")


class ScanReportResponse(BaseModel):
    id: Optional[int] = None
    input_text: str
    sender_id: Optional[str] = None
    message_type: str
    risk_score: int = Field(..., ge=0, le=100, description="0 (Benign) to 100 (Deadly Scam)")
    verdict: VerdictEnum
    scam_category: Optional[str] = None
    summary_explanation: str
    extracted_entities: List[ExtractedEntity] = []
    red_flags: List[RedFlag] = []
    safe_verification_steps: List[str] = []
    official_helplines: List[str] = []
    analyzed_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class ScanStats(BaseModel):
    total_scans: int
    scams_detected: int
    suspicious_detected: int
    benign_detected: int
    top_scam_categories: dict
