from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class AttackVector(str, Enum):
    DIRECT_OVERRIDE = "DIRECT_OVERRIDE"
    INDIRECT_INJECTION = "INDIRECT_INJECTION"
    ROLEPLAY_JAILBREAK = "ROLEPLAY_JAILBREAK"
    OBFUSCATED_BASE64 = "OBFUSCATED_BASE64"
    CANARY_EXFILTRATION = "CANARY_EXFILTRATION"


class SecurityAuditResult(BaseModel):
    attack_id: int
    attack_vector: AttackVector
    prompt: str
    vulnerable_response: str
    defended_response: str
    raw_model_compromised: bool
    defense_mitigated: bool
    canary_leaked_raw: bool
    canary_leaked_defended: bool
    matched_firewall_rule: Optional[str] = None


class SecurityProbeRequest(BaseModel):
    prompt: str
    attack_vector: Optional[AttackVector] = AttackVector.DIRECT_OVERRIDE


class HarnessBenchmarkReport(BaseModel):
    total_probes: int
    raw_compromised_count: int
    defended_compromised_count: int
    raw_asr_percentage: float = Field(..., ge=0.0, le=100.0)
    defended_asr_percentage: float = Field(..., ge=0.0, le=100.0)
    asr_reduction_percentage: float = Field(..., ge=0.0, le=100.0)
    canary_leak_protection_rate: float = Field(..., ge=0.0, le=100.0)
    audit_timestamp: str
