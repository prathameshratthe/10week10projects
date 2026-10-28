import math
import re
from typing import List, Tuple
from app.models.schemas import (
    CivicAnalyzeResponse,
    CivicCategory,
    DuplicateCandidate,
    SeverityLevel,
)

DEPARTMENT_MAP = {
    CivicCategory.POTHOLE: "Roads & Traffic Infrastructure",
    CivicCategory.GARBAGE_DUMP: "Solid Waste Management & Sanitation",
    CivicCategory.BROKEN_STREETLIGHT: "Municipal Electrical Department",
    CivicCategory.WATER_LEAK: "Water Supply & Sewerage Board (Jal Board)",
    CivicCategory.OPEN_MANHOLE: "Stormwater Drainage & Disaster Safety",
    CivicCategory.FALLEN_TREE: "Horticulture & Emergency Clearance",
    CivicCategory.GENERAL: "Municipal Grievance Cell",
}


class CivicClassifier:
    @classmethod
    def classify_issue(
        cls, description: str, location: str, existing_reports: List[dict] = None
    ) -> CivicAnalyzeResponse:
        desc_lower = description.lower()
        loc_lower = location.lower()

        # 1. Categorization
        if re.search(r"\b(manhole|drain\s+cover|open\s+chamber|gutter\s+open|uncovered\s+drain)\b", desc_lower):
            category = CivicCategory.OPEN_MANHOLE
            severity = SeverityLevel.CRITICAL
            title = f"Urgent: Open Manhole Hazard at {location.title()}"
            reasoning = "Uncovered manhole poses an immediate life-threatening hazard to pedestrians and two-wheelers."
        elif re.search(r"\b(pothole|potholes|crater|damaged\s+road|broken\s+asphalt|road\s+cave[- ]in)\b", desc_lower):
            category = CivicCategory.POTHOLE
            severity = SeverityLevel.HIGH if re.search(r"(deep|major|accident|highway|main\s+road)", desc_lower) else SeverityLevel.MEDIUM
            title = f"Pothole Repair Needed on {location.title()}"
            reasoning = "Damaged road surface causes vehicle axle damage and severe accident risks during rainfall."
        elif re.search(r"\b(garbage|trash|dump|waste|rubbish|overflowing\s+bin|filth|dustbin)\b", desc_lower):
            category = CivicCategory.GARBAGE_DUMP
            severity = SeverityLevel.HIGH if re.search(r"(hospital|school|rotting|smell|stray)", desc_lower) else SeverityLevel.MEDIUM
            title = f"Solid Waste Dump Clearing at {location.title()}"
            reasoning = "Accumulated uncollected waste creates severe sanitation and vector-borne health risks."
        elif re.search(r"\b(water\s+leak|pipeline\s+burst|pipe\s+leak|drinking\s+water\s+wasted|gushing\s+water|water\s+leaking|valve\s+leak)\b", desc_lower):
            category = CivicCategory.WATER_LEAK
            severity = SeverityLevel.HIGH
            title = f"Potable Water Pipeline Leak near {location.title()}"
            reasoning = "High-pressure potable water leakage leads to municipal resource waste and road subgrade erosion."
        elif re.search(r"\b(streetlight|street\s+light|street\s+lights|pole\s+light|lamp\s+post|dark\s+road|flickering\s+light|lights\s+out)\b", desc_lower):
            category = CivicCategory.BROKEN_STREETLIGHT
            severity = SeverityLevel.MEDIUM
            title = f"Non-Functional Streetlight at {location.title()}"
            reasoning = "Unlit street sector impairs pedestrian night safety and increases opportunistic crime risks."
        elif re.search(r"\b(tree\s+fell|fallen\s+tree|broken\s+branch|blocked\s+by\s+tree|tree\s+branch|banyan\s+tree)\b", desc_lower):
            category = CivicCategory.FALLEN_TREE
            severity = SeverityLevel.HIGH
            title = f"Fallen Tree Blocking Right of Way at {location.title()}"
            reasoning = "Obstruction restricts vehicular passage and risks power line entanglement."
        else:
            category = CivicCategory.GENERAL
            severity = SeverityLevel.LOW
            title = f"Civic Grievance Report at {location.title()}"
            reasoning = "Standard civic grievance logged for administrative routing."

        department = DEPARTMENT_MAP.get(category, "Municipal Grievance Cell")

        # 2. Duplicate Detection
        duplicate_candidates: List[DuplicateCandidate] = []
        is_duplicate = False
        duplicate_confidence = 0.0

        if existing_reports:
            for rep in existing_reports:
                if rep.get("category") == category.value:
                    # Calculate token overlap between locations and descriptions
                    rep_loc = rep.get("location_address", "").lower()
                    rep_desc = rep.get("description", "").lower()

                    loc_tokens = set(re.findall(r"\w+", loc_lower))
                    rep_loc_tokens = set(re.findall(r"\w+", rep_loc))
                    loc_overlap = len(loc_tokens.intersection(rep_loc_tokens)) / max(len(loc_tokens), 1)

                    desc_tokens = set(re.findall(r"\w+", desc_lower))
                    rep_desc_tokens = set(re.findall(r"\w+", rep_desc))
                    desc_overlap = len(desc_tokens.intersection(rep_desc_tokens)) / max(len(desc_tokens), 1)

                    score = round(0.6 * loc_overlap + 0.4 * desc_overlap, 2)
                    if score >= 0.50:
                        duplicate_candidates.append(DuplicateCandidate(
                            existing_report_id=rep["id"],
                            title=rep.get("actionable_title", "Prior Report"),
                            category=category,
                            similarity_score=score,
                            status=rep.get("status", "OPEN"),
                            created_at=rep.get("created_at", "Recent")
                        ))

            if duplicate_candidates:
                duplicate_candidates.sort(key=lambda x: x.similarity_score, reverse=True)
                top_score = duplicate_candidates[0].similarity_score
                if top_score >= 0.50:
                    is_duplicate = True
                    duplicate_confidence = top_score

        return CivicAnalyzeResponse(
            category=category,
            department=department,
            severity=severity,
            actionable_title=title,
            cleaned_description=description.strip(),
            urgency_reasoning=reasoning,
            is_duplicate=is_duplicate,
            duplicate_confidence=duplicate_confidence,
            duplicate_candidates=duplicate_candidates[:3],
            recommended_authority=f"Forward to Executive Engineer, {department}"
        )
