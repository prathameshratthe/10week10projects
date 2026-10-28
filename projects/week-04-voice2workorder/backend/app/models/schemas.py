from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class TradeType(str, Enum):
    HVAC = "HVAC"
    PLUMBING = "PLUMBING"
    ELECTRICAL = "ELECTRICAL"
    APPLIANCE_REPAIR = "APPLIANCE_REPAIR"
    CARPENTRY = "CARPENTRY"
    GENERAL = "GENERAL"


class PriorityLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    EMERGENCY = "EMERGENCY"


class PartItem(BaseModel):
    name: str
    quantity: int = 1
    unit_cost_inr: float = 0.0


class VoiceNoteInput(BaseModel):
    raw_transcript: str = Field(..., min_length=5, description="Voice transcript or dictation note")
    technician_name: Optional[str] = "Vinod Kumar"
    technician_phone: Optional[str] = "+91 98201 12345"


class WorkOrder(BaseModel):
    job_id: str
    trade: TradeType
    client_name: str
    location: str
    issue_summary: str
    actions_taken: List[str]
    parts_used: List[PartItem] = []
    labor_hours: float = 1.0
    priority: PriorityLevel
    follow_up_required: bool = False
    follow_up_notes: Optional[str] = None
    labor_rate_per_hour_inr: float = 450.0
    total_parts_cost_inr: float = 0.0
    total_labor_cost_inr: float = 450.0
    total_billable_inr: float = 450.0
    language_detected: str = "Hinglish"
    created_at: str
