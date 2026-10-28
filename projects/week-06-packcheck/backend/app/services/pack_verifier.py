import re
from datetime import datetime, timezone
from typing import List
from app.models.schemas import (
    CrossEntityCheck,
    DocStatus,
    DocType,
    OnboardingVerdict,
    VendorDossier,
    VerificationScorecard,
)


class PackVerifier:
    MANDATORY_DOCS = [DocType.GST_CERTIFICATE, DocType.PAN_CARD, DocType.BANK_CHEQUE]

    @classmethod
    def verify_dossier(cls, dossier: VendorDossier) -> VerificationScorecard:
        red_flags: List[str] = []
        recommendations: List[str] = []
        cross_checks: List[CrossEntityCheck] = []

        provided_doc_types = {d.doc_type: d for d in dossier.documents}

        # 1. Mandatory Checklist Check
        missing_mandatory = []
        for req in cls.MANDATORY_DOCS:
            if req not in provided_doc_types:
                missing_mandatory.append(req.value)

        if missing_mandatory:
            red_flags.append(f"Critical Missing Mandatory Documents: {', '.join(missing_mandatory)}")
            cross_checks.append(CrossEntityCheck(
                check_name="Mandatory Baseline Pack",
                passed=False,
                details=f"Missing mandatory requirements: {', '.join(missing_mandatory)}",
                severity="HIGH"
            ))
        else:
            cross_checks.append(CrossEntityCheck(
                check_name="Mandatory Baseline Pack",
                passed=True,
                details="GST Certificate, PAN Card, and Cancelled Bank Cheque are present.",
                severity="LOW"
            ))

        # 2. Tax ID Formatting & Cross-Entity Validation (PAN in GSTIN)
        gstin_clean = (dossier.vendor_gstin or "").strip().upper()
        pan_clean = (dossier.vendor_pan or "").strip().upper()

        is_gst_valid = bool(re.match(r"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$", gstin_clean)) if gstin_clean else False
        is_pan_valid = bool(re.match(r"^[A-Z]{5}[0-9]{4}[A-Z]{1}$", pan_clean)) if pan_clean else False

        if gstin_clean and not is_gst_valid:
            red_flags.append(f"Invalid GSTIN Format: '{gstin_clean}' fails checksum and structure.")
            cross_checks.append(CrossEntityCheck(
                check_name="GSTIN Format Structure",
                passed=False,
                details=f"GSTIN '{gstin_clean}' fails statutory 15-character structure.",
                severity="HIGH"
            ))
        if pan_clean and not is_pan_valid:
            red_flags.append(f"Invalid PAN Format: '{pan_clean}' fails statutory pattern.")
            cross_checks.append(CrossEntityCheck(
                check_name="PAN Format Structure",
                passed=False,
                details=f"PAN '{pan_clean}' fails 10-character statutory format.",
                severity="HIGH"
            ))

        if is_gst_valid and is_pan_valid:
            gst_pan_embedded = gstin_clean[2:12]
            if gst_pan_embedded == pan_clean:
                cross_checks.append(CrossEntityCheck(
                    check_name="GSTIN-to-PAN Entity Alignment",
                    passed=True,
                    details=f"Embedded PAN ({gst_pan_embedded}) perfectly matches standalone PAN Card ({pan_clean}).",
                    severity="LOW"
                ))
            else:
                red_flags.append(f"Critical Entity Mismatch: GSTIN contains PAN '{gst_pan_embedded}', but submitted PAN Card is '{pan_clean}'.")
                cross_checks.append(CrossEntityCheck(
                    check_name="GSTIN-to-PAN Entity Alignment",
                    passed=False,
                    details=f"Embedded PAN '{gst_pan_embedded}' contradicts standalone PAN '{pan_clean}'. Possible synthetic fraud.",
                    severity="HIGH"
                ))

        # 3. Bank Account Name vs Registered Name Check
        reg_name = dossier.vendor_registered_name.strip().lower()
        bank_holder = (dossier.bank_account_holder or "").strip().lower()

        if bank_holder:
            reg_tokens = set(re.findall(r"\w+", re.sub(r"\b(pvt|ltd|llp|private|limited|enterprises|solutions|inc)\b", "", reg_name)))
            bank_tokens = set(re.findall(r"\w+", re.sub(r"\b(pvt|ltd|llp|private|limited|enterprises|solutions|inc)\b", "", bank_holder)))

            overlap = len(reg_tokens.intersection(bank_tokens)) / max(len(reg_tokens), 1)
            if overlap >= 0.5:
                cross_checks.append(CrossEntityCheck(
                    check_name="Bank Account Beneficiary Match",
                    passed=True,
                    details=f"Bank Account Holder '{dossier.bank_account_holder}' matches registered company name.",
                    severity="LOW"
                ))
            else:
                red_flags.append(f"Third-Party Bank Payout Risk: Bank account holder '{dossier.bank_account_holder}' deviates from legal name '{dossier.vendor_registered_name}'.")
                cross_checks.append(CrossEntityCheck(
                    check_name="Bank Account Beneficiary Match",
                    passed=False,
                    details="Bank account beneficiary does not match registered vendor legal name.",
                    severity="HIGH"
                ))

        # 4. Document Validity & Expiry Check
        verified_count = 0
        expired_count = 0
        name_mismatch_count = 0

        for doc in dossier.documents:
            if doc.is_expired or doc.status == DocStatus.EXPIRED:
                expired_count += 1
                red_flags.append(f"Expired Credential: {doc.document_name} expired on {doc.expiry_date or 'Recent'}.")
            elif doc.status == DocStatus.NAME_MISMATCH:
                name_mismatch_count += 1
                red_flags.append(f"Name Divergence: {doc.document_name} was issued to '{doc.extracted_entity_name}'.")
            elif doc.status == DocStatus.PRESENT_VERIFIED:
                verified_count += 1

        # 5. Compute Compliance Score & Onboarding Verdict
        score = 100.0
        score -= (len(missing_mandatory) * 25.0)
        score -= (expired_count * 20.0)
        score -= (name_mismatch_count * 20.0)
        if any(not c.passed and c.severity == "HIGH" for c in cross_checks):
            score -= 30.0

        score = max(0.0, min(100.0, round(score, 1)))

        if len(missing_mandatory) > 0 or any(not c.passed and c.severity == "HIGH" for c in cross_checks):
            verdict = OnboardingVerdict.REJECTED
            recommendations.append("Vendor rejected. Resolve critical tax ID contradictions or missing mandatory statutory filings.")
        elif expired_count > 0 or name_mismatch_count > 0 or score < 80.0:
            verdict = OnboardingVerdict.CONDITIONAL_APPROVAL
            recommendations.append("Conditional onboarding granted. Require updated non-expired certificates or board resolution for name variation within 14 days.")
        else:
            verdict = OnboardingVerdict.APPROVED
            recommendations.append("Dossier fully compliant. Approved for enterprise ERP master vendor creation and invoice payments.")

        return VerificationScorecard(
            vendor_registered_name=dossier.vendor_registered_name,
            compliance_score=score,
            verdict=verdict,
            total_docs_required=len(cls.MANDATORY_DOCS) + 2,
            docs_verified_count=verified_count,
            docs_missing_count=len(missing_mandatory),
            docs_flagged_count=expired_count + name_mismatch_count,
            cross_entity_checks=cross_checks,
            red_flags=red_flags,
            recommendations=recommendations,
            audit_timestamp=datetime.now(timezone.utc).isoformat()
        )
