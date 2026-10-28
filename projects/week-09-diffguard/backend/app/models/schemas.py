from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class ChangeType(str, Enum):
    CORE_SCHEMA_CHANGE = "CORE_SCHEMA_CHANGE"
    DATABASE_MIGRATION = "DATABASE_MIGRATION"
    API_ENDPOINT_CHANGE = "API_ENDPOINT_CHANGE"
    INTERNAL_LOGIC_CHANGE = "INTERNAL_LOGIC_CHANGE"
    TEST_ONLY_CHANGE = "TEST_ONLY_CHANGE"
    DOCUMENTATION_CHANGE = "DOCUMENTATION_CHANGE"


class ImpactedSymbol(BaseModel):
    name: str
    symbol_type: str  # function, class, endpoint, schema_field
    file_path: str
    downstream_callers: List[str] = []


class DiffAnalysisRequest(BaseModel):
    pr_title: str
    git_diff: str = Field(..., min_length=5, description="Unified git diff or patch content")
    changed_files: Optional[List[str]] = []


class DiffAnalysisResponse(BaseModel):
    pr_title: str
    risk_level: RiskLevel
    primary_change_type: ChangeType
    breaking_change_detected: bool
    lines_added: int
    lines_deleted: int
    touched_symbols: List[ImpactedSymbol] = []
    recommended_test_files: List[str] = []
    full_suite_test_count: int = 24
    recommended_test_count: int
    ci_time_saved_pct: float = Field(..., ge=0.0, le=100.0)
    executive_summary: str
    risk_reasons: List[str] = []
