import re
from typing import List, Tuple
from app.models.schemas import (
    EntityType,
    ExtractedEntity,
    RedFlag,
    ScanReportResponse,
    VerdictEnum,
)

SUSPICIOUS_DOMAINS = [
    r"bit\.ly", r"tinyurl\.com", r"is\.gd", r"t\.me", r"wa\.me", r"cutt\.ly",
    r"\.xyz\b", r"\.top\b", r"\.online\b", r"\.club\b", r"\.site\b", r"\.live\b",
    r"sbi[-_.]", r"yono[-_.]", r"hdfc[-_.]", r"icici[-_.]", r"paytm[-_.]",
    r"phonepe[-_.]", r"bses[-_.]", r"mahavitaran[-_.]", r"recharge[-_.]",
    r"kyc[-_.]", r"aadhaar[-_.]", r"pan[-_.]"
]

SCAM_PATTERNS = [
    {
        "category": "Electricity Bill Disconnection Fraud",
        "regex": r"(?:electricity|power)\s+(?:bill|supply|power)?\s*(?:will\s+be\s+(?:cut\s+off|disconnected)|disconnected\s+tonight|at\s+9:30\s*pm|update\s+your\s+bill|contact\s+officer)",
        "title": "Urgent Utility Disconnection Threat",
        "severity": "CRITICAL",
        "explanation": "State power discoms (like BSES, Tata Power, Mahavitaran) never send SMS from personal 10-digit mobile numbers threatening immediate cutoff at 9:30 PM. Legitimate notices are sent weeks in advance on official paper bills.",
        "action": "Do not call the number in the SMS. Check your real electricity bill status on the official discom portal or consumer app."
    },
    {
        "category": "Bank KYC & SIM Deactivation Phishing",
        "regex": r"(?:(?:yono|sbi|hdfc|icici|axis|pnb|bob|bank|sim|airtel|jio|vi|bsnl).{0,30}(?:blocked|deactivated|suspended|update\s+your\s+pan|submit\s+(?:kyc|document)|within\s+24\s*hours))|(?:(?:sim|services)\s+(?:card\s+)?(?:will\s+be\s+)?(?:blocked|deactivated|suspended))",
        "title": "Account / SIM Suspension Trap",
        "severity": "CRITICAL",
        "explanation": "Telecom operators and banks never send SMS threatening immediate service deactivation within 24 hours. Under DoT and RBI rules, legitimate verification follows standardized in-person or carrier app processes.",
        "action": "Never click unverified links or call individual numbers. Visit your official bank or telecom operator store."
    },
    {
        "category": "UPI Reverse Collect / Fake Cashback",
        "regex": r"(?:won|claim|received)\s+(?:cashback|reward|scratch\s+card|prize)\s*(?:of\s*₹?\s*[\d,]+|in\s+phonepe|gpay|paytm)|(?:enter\s+upi\s+pin\s+to\s+receive)",
        "title": "Deceptive UPI Reverse-Payment Scam",
        "severity": "CRITICAL",
        "explanation": "GOLDEN RULE OF UPI: You NEVER need to enter your UPI PIN, scan a QR code, or approve a request to RECEIVE money. Entering your PIN always deducts funds from your bank account.",
        "action": "Decline the UPI payment request immediately in your UPI app and block the VPA/UPI ID."
    },
    {
        "category": "Malicious APK File Download",
        "regex": r"(?:https?://[^\s]+\.apk\b)|(?:download\s+(?:our\s+)?app\s+to\s+(?:verify|update|claim))",
        "title": "Direct APK Download (Trojan / Screen Sharing)",
        "severity": "CRITICAL",
        "explanation": "Fraudsters send direct links to Android APK packages masquerading as official bank updates, utility portals, or lottery apps. Installing sideloaded APKs grants SMS-forwarding and remote access trojans (RATs).",
        "action": "Never install .apk files received over SMS or WhatsApp. Only download apps from the official Google Play Store."
    },
    {
        "category": "Part-Time Job / Task Fraud",
        "regex": r"(?:earn|salary)\s+(?:rs\.?|₹)?\s*[\d,]+\s*(?:daily|per\s+day|monthly)?\s*(?:by\s+liking\s+youtube|rating\s+hotels|simple\s+tasks|part[- ]time\s+job)|(?:contact\s+(?:our\s+)?hr\s+on\s+telegram)",
        "title": "Prepaid Task / Ponzi Job Fraud",
        "severity": "CRITICAL",
        "explanation": "Scammers promise easy daily payouts for liking YouTube videos or Google reviews. After paying small initial amounts (₹150), they coerce victims into depositing thousands into fake 'crypto trading' or 'prepaid investment' portals.",
        "action": "Report and block the sender. Legitimate corporate recruitment never happens through unsolicited WhatsApp or Telegram tasks."
    },
    {
        "category": "Digital Arrest & Police Extortion",
        "regex": r"(?:customs|parcel|fedex|dhl|mumbai\s+police|cyber\s*crime(?:\s+police)?|cbi|narcotics|\bed\b|enforcement\s+directorate|arrest\s+warrant|drugs\s+found|digital\s+arrest|avoid\s+arrest)",
        "title": "Impersonation of Law Enforcement (Digital Arrest)",
        "severity": "CRITICAL",
        "explanation": "No Indian police, CBI, Customs, or ED officer conducts 'digital arrests' over Skype, WhatsApp video, or phone calls, nor do they demand fund transfers for 'verification'.",
        "action": "Disconnect the call immediately. Report the incident directly to the National Cyber Crime Portal (1930) or local police."
    },
    {
        "category": "Lottery & KBC Lucky Draw",
        "regex": r"(?:congratulations|kbc|jio|lottery|lucky\s+draw|won\s+25\s*lakh|winner\s+number)",
        "title": "Advance-Fee Lottery Fraud",
        "severity": "CRITICAL",
        "explanation": "KBC and telecom operators never conduct lotteries requiring winners to pay processing fees, registration charges, or GST before disbursing prizes.",
        "action": "Delete and ignore the message. Do not contact the WhatsApp numbers listed."
    }
]


class ScamAnalyzer:
    @classmethod
    def analyze_message(
        cls, message_text: str, sender_id: str = None, message_type: str = "SMS"
    ) -> ScanReportResponse:
        entities: List[ExtractedEntity] = []
        red_flags: List[RedFlag] = []
        safe_steps: List[str] = []
        scam_categories: List[str] = []
        risk_score = 0

        text = message_text.strip()

        # 1. Extract URLs and check suspicious shorteners/domains
        urls = re.findall(r"https?://[^\s,]+", text, re.IGNORECASE)
        for url in urls:
            is_suspicious = False
            for pattern in SUSPICIOUS_DOMAINS:
                if re.search(pattern, url, re.I):
                    is_suspicious = True
                    break

            if re.search(r"\.apk\b", url, re.I):
                entities.append(ExtractedEntity(
                    entity_type=EntityType.APK_DOWNLOAD,
                    value=url,
                    risk_level="HIGH",
                    notes="Direct APK installation link detected. High risk of malware or spyware."
                ))
                risk_score += 45
            elif re.search(r"(?:bit\.ly|tinyurl|is\.gd|cutt\.ly|t\.me|wa\.me)", url, re.I):
                entities.append(ExtractedEntity(
                    entity_type=EntityType.SHORTENER,
                    value=url,
                    risk_level="HIGH",
                    notes="Obfuscated URL shortener disguising final destination domain."
                ))
                risk_score += 30
            elif is_suspicious:
                entities.append(ExtractedEntity(
                    entity_type=EntityType.URL,
                    value=url,
                    risk_level="HIGH",
                    notes="Unverified or typosquatted domain attempting brand spoofing."
                ))
                risk_score += 40
            else:
                entities.append(ExtractedEntity(
                    entity_type=EntityType.URL,
                    value=url,
                    risk_level="LOW",
                    notes="Standard URL"
                ))

        # 2. Extract UPI IDs
        upi_matches = re.findall(r"\b[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}\b", text)
        for upi in upi_matches:
            entities.append(ExtractedEntity(
                entity_type=EntityType.UPI_ID,
                value=upi,
                risk_level="MEDIUM",
                notes="Personal or business UPI Virtual Payment Address."
            ))

        # 3. Extract Phone numbers
        phone_matches = re.findall(r"\b(?:(?:\+91|91|0)?[6-9]\d{9})\b", text)
        for phone in phone_matches:
            entities.append(ExtractedEntity(
                entity_type=EntityType.PHONE_NUMBER,
                value=phone,
                risk_level="MEDIUM",
                notes="Personal 10-digit mobile number."
            ))

        # 4. Check Scam Taxonomy
        for pattern in SCAM_PATTERNS:
            match = re.search(pattern["regex"], text, re.IGNORECASE)
            if match:
                snippet = match.group(0)
                pattern_score = 75 if pattern["severity"] == "CRITICAL" else 50
                risk_score = max(risk_score, pattern_score)
                scam_categories.append(pattern["category"])
                red_flags.append(RedFlag(
                    title=pattern["title"],
                    category=pattern["category"],
                    severity=pattern["severity"],
                    explanation=pattern["explanation"],
                    evidence_snippet=snippet
                ))
                if pattern["action"] not in safe_steps:
                    safe_steps.append(pattern["action"])

        # 5. Check Sender Header if available (e.g. personal 10-digit phone for official alert)
        if sender_id and re.match(r"^(?:\+91)?[6-9]\d{9}$", sender_id):
            if red_flags:
                risk_score += 20
                red_flags.append(RedFlag(
                    title="Unofficial Personal Sender ID",
                    category="Spoofing",
                    severity="HIGH",
                    explanation=f"Sender ID '{sender_id}' is an individual personal SIM card, NOT an authorized enterprise DLT sender header (e.g., AD-SBIINB or BP-MSEB).",
                    evidence_snippet=sender_id
                ))

        # 6. Check for Legitimate Transaction/OTP Indicators
        is_legitimate_otp = bool(re.search(
            r"\b(?:otp|one\s+time\s+password|secret\s+code)\b.*\b(?:do\s+not\s+share|valid\s+for|login|verification)\b",
            text, re.I
        ) and not urls and not re.search(r"(?:blocked|suspended|update\s+kyc)", text, re.I))

        is_legitimate_bank_alert = bool(re.search(
            r"\b(?:a/c|account)\s+[\*x\d]+\s+(?:debited|credited)\s+by\s+(?:rs\.?|inr|₹)\b",
            text, re.I
        ) and not re.search(r"(?:click\s+here|update|urgent)", text, re.I))

        if is_legitimate_otp or is_legitimate_bank_alert:
            risk_score = min(risk_score, 10)
            red_flags = []
            safe_steps = ["Verify that you initiated this transaction or login yourself."]

        # Normalize score
        risk_score = min(max(risk_score, 0), 100)

        # Determine Verdict
        if risk_score >= 60:
            verdict = VerdictEnum.CRITICAL_SCAM
            summary = (
                f"🚨 HIGH THREAT DETECTED: This message shows classic signatures of an Indian cyber scam "
                f"({scam_categories[0] if scam_categories else 'Fraudulent Phishing'}). Do not call the numbers, do not click links, and never share OTPs or UPI PINs."
            )
        elif risk_score >= 30:
            verdict = VerdictEnum.SUSPICIOUS
            summary = (
                "⚠️ SUSPICIOUS MESSAGE: This message contains unverified links or urgent language. Proceed with extreme caution and verify via official channels."
            )
            safe_steps.append("Contact the organization's verified customer care number from their official website.")
        else:
            verdict = VerdictEnum.SAFE
            summary = "✅ BENIGN MESSAGE: No high-risk scam signatures, deceptive links, or malicious APK triggers were detected."
            if not safe_steps:
                safe_steps.append("Standard security: never share your banking OTP or password with anyone.")

        official_helplines = [
            "National Cyber Crime Reporting Helpline: Call 1930 (Toll Free)",
            "National Cyber Crime Portal: https://cybercrime.gov.in",
            "Chakshu Suspected Fraud Reporting (DoT): https://sancharsaathi.gov.in/sfc/",
            "RBI Sachet Consumer Protection: https://sachet.rbi.org.in"
        ]

        return ScanReportResponse(
            input_text=text,
            sender_id=sender_id,
            message_type=message_type,
            risk_score=risk_score,
            verdict=verdict,
            scam_category=scam_categories[0] if scam_categories else None,
            summary_explanation=summary,
            extracted_entities=entities,
            red_flags=red_flags,
            safe_verification_steps=safe_steps,
            official_helplines=official_helplines
        )
