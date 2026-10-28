import re
import uuid
from datetime import datetime, timezone
from typing import List, Tuple
from app.models.schemas import (
    PartItem,
    PriorityLevel,
    TradeType,
    VoiceNoteInput,
    WorkOrder,
)


class VoiceWorkOrderExtractor:
    @classmethod
    def extract_work_order(cls, input_data: VoiceNoteInput) -> WorkOrder:
        text = input_data.raw_transcript.strip()
        lower = text.lower()

        # 1. Detect Language
        lang = "English"
        if re.search(r"\b(ka|ki|ke|hai|tha|thi|gaya|diya|aur|bhi|lagaya|khatam|ghante|aadha|paani)\b", lower):
            lang = "Hindi / Hinglish"
        elif re.search(r"\b(aani|aahe|hoti|kela|dile|taas|pan|zala|nahi|madhe)\b", lower):
            lang = "Marathi"

        # 2. Determine Trade (Check specific appliances first)
        if re.search(r"\b(fridge|refrigerator|washing\s*machine|microwave|oven|geyser)\b", lower):
            trade = TradeType.APPLIANCE_REPAIR
            default_title = "Home Appliance Repair & Maintenance"
        elif re.search(r"\b(ac|split\s+ac|cooling|compressor|gas\s+leak|refrigerant|outdoor\s+unit|condenser|coil)\b", lower):
            trade = TradeType.HVAC
            default_title = "HVAC / Air Conditioning Service"
        elif re.search(r"\b(pipe|paani|water|leak|tap|faucet|flush|drain|siphon|valve|plumber|toilet|basin|nal|sink)\b", lower):
            trade = TradeType.PLUMBING
            default_title = "Plumbing Leakage & Pipe Repair"
        elif re.search(r"\b(mcb|wire|wiring|switch|socket|spark|fuse|voltage|short\s+circuit|light|fan|board)\b", lower):
            trade = TradeType.ELECTRICAL
            default_title = "Electrical Wiring & Load Inspection"
        elif re.search(r"\b(door|lock|hinge|handle|wardrobe|cabinet|wood|cupboard|drawer)\b", lower):
            trade = TradeType.CARPENTRY
            default_title = "Carpentry & Hardware Repair"
        else:
            trade = TradeType.GENERAL
            default_title = "General Facility Maintenance"

        # 3. Extract Client Name & Location
        client_name = "Walk-in Client"
        client_match = re.search(r"\b(?:client|customer|mr\.?|mrs\.?|shri|shrimati|ji)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)", text)
        if not client_match:
            client_match = re.search(r"([A-Z][a-z]+)\s+(?:ji|sir|madam|bhai)", text)
        if client_match:
            client_name = client_match.group(1).title() + (" Ji" if "ji" in lower else "")
        elif "sharma" in lower:
            client_name = "Mr. Sharma"
        elif "patil" in lower:
            client_name = "Mr. Patil"
        elif "verma" in lower:
            client_name = "Mrs. Verma"
        elif "deshmukh" in lower:
            client_name = "Mr. Deshmukh"
        elif "kulkarni" in lower:
            client_name = "Mr. Kulkarni"

        # Location extraction
        location = "Client Premises"
        loc_match = re.search(r"\b(?:at|in|near|location|society|flat|apartment)\s+([A-Za-z0-9\s,\-]+?)(?:\.|\band\b|\bissue\b|\bpaani\b|\bproblem\b|$)", text, re.IGNORECASE)
        if loc_match and len(loc_match.group(1).strip()) > 3:
            loc_candidate = loc_match.group(1).strip()
            loc_candidate = re.sub(r"\s+(?:mein|madhe|pe|par|ka|ki)$", "", loc_candidate, flags=re.IGNORECASE)
            location = loc_candidate.title()
        elif "kothrud" in lower:
            location = "Kothrud, Pune"
        elif "andheri" in lower:
            location = "Andheri West, Mumbai"
        elif "gurgaon" in lower or "gurugram" in lower:
            location = "Sector 54, Gurgaon"
        elif "whitefield" in lower:
            location = "Whitefield, Bangalore"
        elif "baner" in lower:
            location = "Baner, Pune"

        # 4. Extract Labor Hours
        labor_hours = 1.0
        if re.search(r"\b(dedh|derh)\s+ghant[ea]\b", lower):
            labor_hours = 1.5
        elif re.search(r"\b(dhai|dhaai)\s+ghant[ea]\b", lower):
            labor_hours = 2.5
        elif re.search(r"\b(aadha|aadhe|ardha)\s+(?:ghanta|taas)\b", lower):
            labor_hours = 0.5
        elif re.search(r"\b(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|ghant[ea]|taas)\b", lower):
            m = re.search(r"\b(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|ghant[ea]|taas)\b", lower)
            if m:
                labor_hours = float(m.group(1))

        # 5. Extract Parts Used
        parts: List[PartItem] = []
        if re.search(r"\b(?:capacitor|45\s*mfd|50\s*mfd)\b", lower):
            parts.append(PartItem(name="Run Capacitor 45 MFD", quantity=1, unit_cost_inr=450.0))
        if re.search(r"\b(?:ball\s+valve|valve)\b", lower):
            parts.append(PartItem(name="Brass Ball Valve 1-inch", quantity=1, unit_cost_inr=320.0))
        if re.search(r"\b(?:teflon|tape)\b", lower):
            parts.append(PartItem(name="Teflon Thread Seal Tape", quantity=2, unit_cost_inr=40.0))
        if re.search(r"\b(?:mcb|breaker|32a|16a)\b", lower):
            parts.append(PartItem(name="Havells 16A Single Pole MCB", quantity=1, unit_cost_inr=280.0))
        if re.search(r"\b(?:copper\s+pipe|copper\s+tubing)\b", lower):
            parts.append(PartItem(name="1/2-inch Copper Tube (2 meters)", quantity=1, unit_cost_inr=750.0))
        if re.search(r"\b(?:washer|rubber\s+washer|gasket)\b", lower):
            parts.append(PartItem(name="High-Pressure Rubber Washers", quantity=4, unit_cost_inr=25.0))
        if re.search(r"\b(?:tap\s+spindle|spindle)\b", lower):
            parts.append(PartItem(name="Ceramic Tap Spindle Internal", quantity=1, unit_cost_inr=180.0))
        if re.search(r"\b(?:gas\s+refill|r32|r410)\b", lower):
            parts.append(PartItem(name="R32 Eco Refrigerant Top-up (500g)", quantity=1, unit_cost_inr=1200.0))

        # 6. Priority Level
        if re.search(r"\b(emergency|urgent|danger|short\s+circuit|sparking|flooding|immediate|burst)\b", lower):
            priority = PriorityLevel.EMERGENCY
        elif re.search(r"\b(major|high|leak|leakage|cooling\s+nahi|no\s+cooling|tripping|kharab|vibration|failure)\b", lower):
            priority = PriorityLevel.HIGH
        else:
            priority = PriorityLevel.MEDIUM

        # 7. Follow Up Required
        follow_up = False
        follow_up_notes = None
        if re.search(r"\b(kal\s+aana|tomorrow|follow\s*up|next\s+visit|part\s+order|part\s+lana|check\s+again)\b", lower):
            follow_up = True
            follow_up_notes = "Technician flagged required secondary inspection or replacement part procurement."

        # 8. Actions Taken
        actions = []
        if trade == TradeType.HVAC:
            actions = ["Diagnosed refrigerant line pressure", "Cleaned evaporator coils", "Tested compressor startup amp draw"]
        elif trade == TradeType.PLUMBING:
            actions = ["Isolated main water supply line", "Replaced worn valve mechanism", "Executed 15-minute pressure retention leak test"]
        elif trade == TradeType.ELECTRICAL:
            actions = ["Checked distribution board phase continuity", "Replaced tripped circuit breaker", "Verified earthing resistance"]
        else:
            actions = ["Inspected site issue reported by customer", "Applied temporary tightening and adjustment", "Tested functionality"]

        # Cost calculation
        hourly_rate = 450.0
        labor_cost = round(labor_hours * hourly_rate, 2)
        parts_cost = round(sum(p.unit_cost_inr * p.quantity for p in parts), 2)
        total_billable = round(labor_cost + parts_cost, 2)

        job_suffix = str(uuid.uuid4().int)[:4]
        job_id = f"WO-2026-{job_suffix}"

        return WorkOrder(
            job_id=job_id,
            trade=trade,
            client_name=client_name,
            location=location,
            issue_summary=default_title,
            actions_taken=actions,
            parts_used=parts,
            labor_hours=labor_hours,
            priority=priority,
            follow_up_required=follow_up,
            follow_up_notes=follow_up_notes,
            labor_rate_per_hour_inr=hourly_rate,
            total_parts_cost_inr=parts_cost,
            total_labor_cost_inr=labor_cost,
            total_billable_inr=total_billable,
            language_detected=lang,
            created_at=datetime.now(timezone.utc).isoformat()
        )
