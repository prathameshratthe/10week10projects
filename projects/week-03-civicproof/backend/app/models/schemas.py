from datetime import datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class CivicCategory(str, Enum):
    POTHOLE = "POTHOLE"
    GARBAGE_DUMP = "GARBAGE_DUMP"
    BROKEN_STREETLIGHT = "BROKEN_STREETLIGHT"
    WATER_LEAK = "WATER_LEAK"
    FALLEN_TREE = "FALLEN_TREE"
    OPEN_MANHOLE = "OPEN_MANHOLE"
    GENERAL = "GENERAL"


class SeverityLevel(str, Enum):
    CRITICAL = "CRITICAL"  # Life safety risk (e.g. open manhole on road)
    HIGH = "HIGH"          # Significant obstruction (major pothole, flooded road)
    MEDIUM = "MEDIUM"      # Standard maintenance (uncollected bin, flickering light)
    LOW = "LOW"            # Cosmetic or minor issue


class DuplicateCandidate(BaseModel):
    existing_report_id: int
    title: str
    category: CivicCategory
    similarity_score: float = Field(..., ge=0.0, le=1.0)
    distance_meters: Optional[float] = None
    status: str = "OPEN"
    created_at: str


class CivicAnalyzeRequest(BaseModel):
    description: str = Field(..., min_length=3, description="Citizen's raw description of the issue")
    location_address: str = Field(..., description="Landmark, street, or ward name")
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    image_filename: Optional[str] = None


class CivicAnalyzeResponse(BaseModel):
    category: CivicCategory
    department: str
    severity: SeverityLevel
    actionable_title: str
    cleaned_description: str
    urgency_reasoning: str
    is_duplicate: bool
    duplicate_confidence: float
    duplicate_candidates: List[DuplicateCandidate] = []
    recommended_authority: str


class CivicReportCreate(BaseModel):
    category: CivicCategory
    department: str
    severity: SeverityLevel
    actionable_title: str
    description: str
    location_address: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    image_url: Optional[str] = None
    is_duplicate: bool = False
    original_report_id: Optional[int] = None


class CivicReportResponse(CivicReportCreate):
    id: int
    ticket_id: str
    status: str = "OPEN"
    created_at: str
    updated_at: str
