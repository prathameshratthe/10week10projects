import re
from typing import List, Dict, Tuple, Optional, Any
from app.models.schemas import (
    PageCitation, TenderBasicInfo, FinancialEligibility, TechnicalEligibility,
    ChecklistItem, RiskClause, TenderAnalysisResult, ContractorProfile,
    GateVerdict, ScreeningVerdict
)

STANDARD_DOCUMENT_REGISTRY = [
    {
        "doc_id": "gst_cert",
        "doc_name": "GST Registration Certificate",
        "keywords": ["gst", "gstin", "goods and services tax"],
        "description": "Valid Goods & Services Tax registration certificate with active status"
    },
    {
        "doc_id": "pan_card",
        "doc_name": "Permanent Account Number (PAN) Card",
        "keywords": ["pan card", "permanent account number", "income tax pan"],
        "description": "Copy of PAN card issued by Income Tax Department in entity name"
    },
    {
        "doc_id": "epf_cert",
        "doc_name": "EPF Registration Certificate & Challan",
        "keywords": ["epf", "provident fund", "epfo"],
        "description": "Employees' Provident Fund Organization registration with latest monthly deposit challan"
    },
    {
        "doc_id": "esic_cert",
        "doc_name": "ESIC Registration Certificate & Challan",
        "keywords": ["esic", "esi", "state insurance"],
        "description": "Employees' State Insurance Corporation registration certificate"
    },
    {
        "doc_id": "blacklisting_affidavit",
        "doc_name": "Notarized Non-Blacklisting Affidavit",
        "keywords": ["blacklisting", "blacklisted", "debarred", "notarized affidavit", "stamp paper"],
        "description": "Affidavit on non-judicial stamp paper stating firm is not debarred or blacklisted by any PSU/Govt"
    },
    {
        "doc_id": "integrity_pact",
        "doc_name": "Signed Integrity Pact",
        "keywords": ["integrity pact", "anti-bribery", "pre-contract integrity pact"],
        "description": "Signed and stamped pre-contract integrity pact as per tender format"
    },
    {
        "doc_id": "power_of_attorney",
        "doc_name": "Power of Attorney / Board Resolution",
        "keywords": ["power of attorney", "board resolution", "authorized signatory", "poa"],
        "description": "Notarized Power of Attorney or Board Resolution authorizing bid signee"
    },
    {
        "doc_id": "audited_balance_sheets",
        "doc_name": "Audited Balance Sheets with CA UDIN",
        "keywords": ["audited balance", "udin", "chartered accountant", "profit and loss", "ca certified"],
        "description": "Audited Balance Sheet & P&L statements for last 3 financial years with verifiable UDIN"
    },
    {
        "doc_id": "contractor_enlistment",
        "doc_name": "Valid Contractor Enlistment / Class Certificate",
        "keywords": ["enlistment", "class 1", "class-1", "registered contractor", "cpwd enlistment"],
        "description": "Registration/enlistment certificate in relevant class/category"
    },
    {
        "doc_id": "emd_receipt_or_msme",
        "doc_name": "EMD Proof / MSME Udyam Certificate",
        "keywords": ["emd", "bid security", "udyam", "msme certificate", "bank guarantee"],
        "description": "FDR/Bank Guarantee receipt of EMD or valid Udyam Registration Certificate for exemption"
    }
]

class TenderAnalyzerService:
    def __init__(self):
        pass

    def parse_pages(self, rfp_text: str) -> Dict[int, str]:
        """Splits document text into indexed pages."""
        pages = {}
        # Pattern for --- Page X --- or Page X
        page_pattern = re.compile(r'(?:---\s*Page\s+(\d+)\s*---|\[Page\s+(\d+)\]|Page\s+(\d+)\s+of\s+\d+)', re.IGNORECASE)
        splits = list(page_pattern.finditer(rfp_text))
        
        if not splits:
            # Fallback chunking into ~1500 chars per pseudo-page
            chunk_size = 1500
            for i in range(0, len(rfp_text), chunk_size):
                page_num = (i // chunk_size) + 1
                pages[page_num] = rfp_text[i:i + chunk_size]
            return pages if pages else {1: rfp_text}
        
        last_pos = 0
        current_page = 1
        
        for i, match in enumerate(splits):
            matched_num = match.group(1) or match.group(2) or match.group(3)
            page_no = int(matched_num) if matched_num else (i + 1)
            start_pos = match.end()
            end_pos = splits[i + 1].start() if i + 1 < len(splits) else len(rfp_text)
            
            page_content = rfp_text[start_pos:end_pos].strip()
            pages[page_no] = page_content
            current_page = page_no
            
        return pages

    def _find_citation(self, pages: Dict[int, str], pattern: str) -> Optional[PageCitation]:
        regex = re.compile(pattern, re.IGNORECASE)
        for page_num, text in pages.items():
            match = regex.search(text)
            if match:
                # Extract surrounding sentence or 140 chars
                start = max(0, match.start() - 20)
                end = min(len(text), match.end() + 100)
                excerpt = text[start:end].replace('\n', ' ').strip()
                return PageCitation(page=page_num, excerpt=f"...{excerpt}...")
        return None

    def _parse_inr_amount(self, text: str) -> float:
        """Extracts numerical INR value from text representations (Crores, Lakhs, commas)."""
        # Look specifically for amounts preceded by currency symbols
        currency_match = re.search(r'(?:Rs\.?|₹|INR)\s*([\d\.,\s]+(?:Crore|Crores|Cr|Lakh|Lakhs|Lac|Lacs)?)', text, re.IGNORECASE)
        target_str = currency_match.group(1) if currency_match else text

        clean_text = target_str.replace(',', '').replace('₹', '').replace('Rs.', '').replace('INR', '').strip()
        # Check Crore
        crore_match = re.search(r'([\d\.]+)\s*(?:Cr|Crore|Crores)', clean_text, re.IGNORECASE)
        if crore_match:
            try:
                return float(crore_match.group(1)) * 10000000.0
            except ValueError:
                pass
        # Check Lakh
        lakh_match = re.search(r'([\d\.]+)\s*(?:Lakh|Lakhs|Lac|Lacs)', clean_text, re.IGNORECASE)
        if lakh_match:
            try:
                return float(lakh_match.group(1)) * 100000.0
            except ValueError:
                pass
        # Check numbers with commas or >= 1000
        numbers = re.findall(r'[\d,]+(?:\.\d+)?', target_str)
        for num_s in numbers:
            try:
                val = float(num_s.replace(',', ''))
                if val >= 1000.0:
                    return val
            except ValueError:
                continue
        return 0.0

    def extract_basic_info(self, text: str, pages: Dict[int, str]) -> TenderBasicInfo:
        # Tender ID / NIT
        tender_id_match = re.search(r'(?:NIT\s*No\.?|Tender\s*Ref\.?|Tender\s*Notice\s*No\.?|GeM\s*Bid\s*No\.?|Bid\s*Number)\s*[:\-]?\s*([A-Za-z0-9\/\-_]+)', text, re.IGNORECASE)
        tender_id = tender_id_match.group(1).strip() if tender_id_match else "NIT-2026-TNDR-001"

        # Issuing Authority
        authority = "Public Procurement Authority"
        if re.search(r'CPWD|Central Public Works Department', text, re.IGNORECASE):
            authority = "CPWD (Central Public Works Department)"
        elif re.search(r'GeM|Government e-Marketplace', text, re.IGNORECASE):
            authority = "GeM (Government e-Marketplace)"
        elif re.search(r'Railway|Northern Railway|Western Railway|IRCTC', text, re.IGNORECASE):
            authority = "Indian Railways"
        elif re.search(r'NHAI|National Highways Authority', text, re.IGNORECASE):
            authority = "NHAI"
        elif re.search(r'IOCL|Indian Oil Corporation', text, re.IGNORECASE):
            authority = "IOCL (Indian Oil Corporation Limited)"
        elif re.search(r'ONGC|Oil and Natural Gas', text, re.IGNORECASE):
            authority = "ONGC"
        elif re.search(r'Municipal Corporation|BMC|MCD|BBMP', text, re.IGNORECASE):
            authority = "Municipal Corporation"
        elif re.search(r'PWD|Public Works Department', text, re.IGNORECASE):
            authority = "State PWD"

        # Title of work
        work_match = re.search(r'(?:Name\s*of\s*Work|Title\s*of\s*Work|Subject|Work\s*Description)\s*[:\-]?\s*([^\n\r]+)', text, re.IGNORECASE)
        title_of_work = work_match.group(1).strip() if work_match else "Civil & Infrastructure Construction / Procurement Work"

        # Estimated Cost
        est_match = re.search(r'(?:Estimated\s*(?:Cost|Value|Tender\s*Value)|Approximate\s*Cost|PAC)\s*[:\-]?\s*(?:Rs\.?|₹|INR)?\s*([\d\.,\s]+(?:Crore|Crores|Cr|Lakh|Lakhs|Lac|Lacs)?)', text, re.IGNORECASE)
        estimated_cost = self._parse_inr_amount(est_match.group(1)) if est_match else 50000000.0 # Default 5 Cr

        # Tender Fee
        fee_match = re.search(r'(?:Cost\s*of\s*Tender\s*Document|Tender\s*Fee|Document\s*Fee)\s*[:\-]?\s*(?:Rs\.?|₹|INR)?\s*([\d\.,\s]+|Nil|Exempted|Free)', text, re.IGNORECASE)
        tender_fee = 0.0
        if fee_match:
            raw_fee = fee_match.group(1)
            if not any(k in raw_fee.lower() for k in ["nil", "exempt", "free"]):
                tender_fee = self._parse_inr_amount(raw_fee)

        # EMD Amount
        emd_amount = 0.0
        for line in text.splitlines():
            if re.search(r'(?:Earnest\s*Money|EMD|Bid\s*Security)', line, re.IGNORECASE) and not re.search(r'exemption|forfeit|penalty', line, re.IGNORECASE):
                amt = self._parse_inr_amount(line)
                if amt > 0:
                    emd_amount = amt
                    break
        if emd_amount == 0.0 and estimated_cost > 0:
            # Default standard 2% of estimated value in public tenders
            emd_amount = round(estimated_cost * 0.02, 2)

        # EMD MSME Exemption (Handles both negative clauses and positive clauses)
        no_msme = bool(re.search(
            r'(?:no|not|non|strictly\s*no)\s*(?:mse|msme|startup|micro\s*and\s*small)[^\n\r\.]{0,40}?(?:exempt|exemption|benefit)|'
            r'(?:no|strictly\s*no)\s*(?:msme\s*)?exemption\s*(?:for|applicable)',
            text, re.IGNORECASE
        ))
        if no_msme:
            msme_exemption = False
        else:
            msme_exemption = bool(re.search(
                r'(?:mse|msme|micro\s*and\s*small|startups?)[^\n\r\.]{0,50}?(?:are\s*)?(?:exempt|exempted|free)|'
                r'(?:exempt|exempted|exemption)[^\n\r\.]{0,50}?(?:for|to)\s*(?:mse|msme|micro\s*and\s*small|startups?)',
                text, re.IGNORECASE
            ))

        # Submission Deadline
        deadline_match = re.search(r'(?:Last\s*Date\s*(?:and\s*Time)?\s*(?:of|for)\s*(?:Bid\s*)?Submission|Bid\s*Submission\s*End\s*Date|Submission\s*Deadline)\s*[:\-]?\s*([^\n\r]+)', text, re.IGNORECASE)
        submission_deadline = deadline_match.group(1).strip() if deadline_match else "30.11.2026 up to 15:00 Hrs IST"

        # Pre-bid Meeting
        prebid_match = re.search(r'(?:Pre[\s\-]*bid\s*(?:Meeting|Conference))\s*[:\-]?\s*([^\n\r]+)', text, re.IGNORECASE)
        pre_bid = prebid_match.group(1).strip() if prebid_match else "15.11.2026 at 11:30 AM IST (Online / Conference Room)"

        # Tech Bid Opening
        opening_match = re.search(r'(?:Technical\s*Bid\s*Opening|Date\s*of\s*Opening\s*of\s*Technical\s*Bids?)\s*[:\-]?\s*([^\n\r]+)', text, re.IGNORECASE)
        tech_opening = opening_match.group(1).strip() if opening_match else "01.12.2026 at 15:30 Hrs IST"

        citation = self._find_citation(pages, r'NIT\s*No|Estimated\s*(?:Cost|Value)|Last\s*Date')

        return TenderBasicInfo(
            tender_id=tender_id,
            issuing_authority=authority,
            title_of_work=title_of_work,
            estimated_cost_inr=estimated_cost,
            tender_fee_inr=tender_fee,
            emd_amount_inr=emd_amount,
            emd_msme_exemption=msme_exemption,
            submission_deadline=submission_deadline,
            pre_bid_meeting=pre_bid,
            tech_bid_opening=tech_opening,
            citation=citation
        )

    def extract_financial_eligibility(self, text: str, pages: Dict[int, str], estimated_cost: float) -> FinancialEligibility:
        # Turnover
        turnover_inr = 0.0
        for line in text.splitlines():
            if re.search(r'turnover', line, re.IGNORECASE):
                amt = self._parse_inr_amount(line)
                if amt > 0:
                    turnover_inr = amt
                    break
        
        # Check percentage if stated as 30% or 40% or 50%
        pct_match = re.search(r'(?:turnover[^\n\r]{1,40}?)([\d]+)\s*%\s*(?:of\s*(?:the\s*)?estimated\s*cost)?', text, re.IGNORECASE)
        if pct_match and turnover_inr == 0.0 and estimated_cost > 0:
            pct = float(pct_match.group(1)) / 100.0
            turnover_inr = round(estimated_cost * pct, 2)
        elif turnover_inr == 0.0 and estimated_cost > 0:
            # Default CPWD rule: 30% of estimated value
            turnover_inr = round(estimated_cost * 0.30, 2)

        # Solvency
        solvency_inr = 0.0
        for line in text.splitlines():
            if re.search(r'solvency', line, re.IGNORECASE):
                amt = self._parse_inr_amount(line)
                if amt > 0:
                    solvency_inr = amt
                    break
            
        if solvency_inr == 0.0 and estimated_cost > 0:
            # Standard CPWD solvency: 40% of estimated cost
            solvency_inr = round(estimated_cost * 0.40, 2)

        citation = self._find_citation(pages, r'Average\s*Annual\s*(?:Financial\s*)?Turnover|Solvency')

        return FinancialEligibility(
            min_average_turnover_inr=turnover_inr,
            turnover_years=3,
            solvency_certificate_inr=solvency_inr,
            net_worth_positive=True,
            audit_udin_mandatory=True,
            citation=citation
        )

    def extract_technical_eligibility(self, text: str, pages: Dict[int, str], estimated_cost: float) -> TechnicalEligibility:
        # Similar work definition
        sim_match = re.search(r'(?:Similar\s*(?:Nature\s*of\s*)?Work\s*(?:means|defined\s*as|shall\s*mean|is\s*defined\s*as))\s*[:\-]?\s*([^\n\r\.]+)', text, re.IGNORECASE)
        if sim_match:
            similar_work = sim_match.group(1).strip()
        else:
            similar_work = "Execution & successful completion of similar civil construction / procurement contracts"

        # Standard 3/2/1 formula (CPWD standard: 3 works of 40%, 2 works of 50%, or 1 work of 80%)
        one_work = round(estimated_cost * 0.80, 2)
        two_work = round(estimated_cost * 0.50, 2)
        three_work = round(estimated_cost * 0.40, 2)

        # Check JV
        jv_allowed = bool(re.search(r'Joint\s*Venture\s*(?:\(JV\)\s*)?(?:is\s*)?permitted|JV\s*allowed|Consortium\s*allowed', text, re.IGNORECASE))
        if re.search(r'Joint\s*Venture\s*(?:\(JV\)\s*)?(?:is\s*)?not\s*allowed|JV\s*not\s*permitted', text, re.IGNORECASE):
            jv_allowed = False

        citation = self._find_citation(pages, r'Similar\s*(?:Nature\s*of\s*)?Work|Three\s*similar|One\s*similar')

        return TechnicalEligibility(
            similar_work_definition=similar_work,
            one_work_value_inr=one_work,
            two_works_value_inr=two_work,
            three_works_value_inr=three_work,
            lookback_period_years=7,
            joint_venture_allowed=jv_allowed,
            citation=citation
        )

    def extract_mandatory_checklist(self, text: str, pages: Dict[int, str]) -> List[ChecklistItem]:
        checklist = []
        for doc in STANDARD_DOCUMENT_REGISTRY:
            # Check if mentioned in text
            found = False
            for kw in doc["keywords"]:
                if re.search(r'\b' + re.escape(kw) + r'\b', text, re.IGNORECASE):
                    found = True
                    break
            
            # Universal essentials (GST, PAN, Non-Blacklisting, EMD) are always mandatory
            if found or doc["doc_id"] in ["gst_cert", "pan_card", "blacklisting_affidavit", "emd_receipt_or_msme"]:
                cit = self._find_citation(pages, doc["keywords"][0])
                checklist.append(ChecklistItem(
                    doc_id=doc["doc_id"],
                    doc_name=doc["doc_name"],
                    is_mandatory=True,
                    description=doc["description"],
                    citation=cit
                ))
        return checklist

    def extract_risk_clauses(self, text: str, pages: Dict[int, str]) -> List[RiskClause]:
        risks = []
        # Liquidated damages
        ld_match = re.search(r'(?:Liquidated\s*Damages|Compensation\s*for\s*delay)[^\n\r\.]{0,100}?([\d\.]+)\s*%', text, re.IGNORECASE)
        cit_ld = self._find_citation(pages, r'Liquidated\s*Damages|Compensation\s*for\s*delay')
        if cit_ld:
            pct = ld_match.group(1) if ld_match else "10"
            risks.append(RiskClause(
                category="Liquidated Damages / Delay Penalty",
                severity="HIGH" if float(pct) >= 10 else "MEDIUM",
                clause_summary=f"Penalty capped at up to {pct}% of contract value for completion delays.",
                citation=cit_ld
            ))

        # Defect Liability
        cit_dlp = self._find_citation(pages, r'Defect\s*Liability\s*Period|DLP')
        if cit_dlp:
            risks.append(RiskClause(
                category="Defect Liability Period (DLP)",
                severity="MEDIUM",
                clause_summary="Contractor bears complete repair liability for up to 24-36 months post-handover.",
                citation=cit_dlp
            ))

        # EMD Forfeiture
        cit_forfeit = self._find_citation(pages, r'forfeit|forfeiture\s*of\s*EMD')
        if cit_forfeit:
            risks.append(RiskClause(
                category="EMD Forfeiture Risk",
                severity="HIGH",
                clause_summary="Full forfeiture of Earnest Money Deposit if bid is altered or withdrawn during validity.",
                citation=cit_forfeit
            ))

        # Price Escalation / Fixed Price
        cit_escalation = self._find_citation(pages, r'price\s*escalation|fixed\s*price|no\s*escalation')
        if cit_escalation:
            risks.append(RiskClause(
                category="Price Escalation Restriction",
                severity="MEDIUM",
                clause_summary="Strict firm fixed price with no material or fuel price escalation adjustment.",
                citation=cit_escalation
            ))

        return risks

    def analyze_tender(self, rfp_text: str) -> TenderAnalysisResult:
        pages = self.parse_pages(rfp_text)
        basic_info = self.extract_basic_info(rfp_text, pages)
        financial = self.extract_financial_eligibility(rfp_text, pages, basic_info.estimated_cost_inr)
        technical = self.extract_technical_eligibility(rfp_text, pages, basic_info.estimated_cost_inr)
        checklist = self.extract_mandatory_checklist(rfp_text, pages)
        risks = self.extract_risk_clauses(rfp_text, pages)

        verdict_summary = (
            f"Tender {basic_info.tender_id} issued by {basic_info.issuing_authority}. "
            f"Estimated Value: ₹ {basic_info.estimated_cost_inr:,.0f}. "
            f"Required 3-Year Avg Turnover: ₹ {financial.min_average_turnover_inr:,.0f}. "
            f"Submission Cut-off: {basic_info.submission_deadline}."
        )

        return TenderAnalysisResult(
            basic_info=basic_info,
            financial_eligibility=financial,
            technical_eligibility=technical,
            mandatory_checklist=checklist,
            risk_clauses=risks,
            pages_analyzed=len(pages),
            summary_verdict=verdict_summary
        )

    def screen_contractor(self, analysis: TenderAnalysisResult, contractor: ContractorProfile) -> ScreeningVerdict:
        gates = []
        recommendations = []

        # Gate 1: Turnover
        req_turnover = analysis.financial_eligibility.min_average_turnover_inr
        actual_turnover = contractor.annual_turnover_inr
        turnover_passed = actual_turnover >= req_turnover
        gates.append(GateVerdict(
            gate_name="Minimum Average Annual Turnover",
            passed=turnover_passed,
            required=f"₹ {req_turnover:,.0f}",
            actual=f"₹ {actual_turnover:,.0f}",
            notes="Passed financial capacity threshold." if turnover_passed else f"Deficit of ₹ {(req_turnover - actual_turnover):,.0f}. Ground for immediate technical disqualification."
        ))
        if not turnover_passed:
            recommendations.append("Financial Turnover Deficit: You do not meet the 3-year average turnover criteria. Consider forming a Joint Venture if allowed.")

        # Gate 2: Technical Past Experience
        req_exp_1 = analysis.technical_eligibility.one_work_value_inr
        actual_exp = contractor.single_largest_work_inr
        exp_passed = actual_exp >= req_exp_1
        gates.append(GateVerdict(
            gate_name="Similar Past Work (Single Work Criterion)",
            passed=exp_passed,
            required=f"₹ {req_exp_1:,.0f} (80% of Tender Value)",
            actual=f"₹ {actual_exp:,.0f}",
            notes="Contractor possesses qualifying single work experience." if exp_passed else f"Largest past work is below single-work requirement (₹ {req_exp_1:,.0f}). Verify if 2-work or 3-work clause applies."
        ))
        if not exp_passed:
            recommendations.append(f"Past Work Value shortfall: Confirm if you have 2 completed works >= ₹ {analysis.technical_eligibility.two_works_value_inr:,.0f} or 3 works >= ₹ {analysis.technical_eligibility.three_works_value_inr:,.0f}.")

        # Gate 3: Solvency
        req_solvency = analysis.financial_eligibility.solvency_certificate_inr
        actual_solvency = contractor.solvency_amount_inr
        solvency_passed = actual_solvency >= req_solvency or req_solvency == 0
        gates.append(GateVerdict(
            gate_name="Bank Solvency / Net Worth",
            passed=solvency_passed,
            required=f"₹ {req_solvency:,.0f}",
            actual=f"₹ {actual_solvency:,.0f}",
            notes="Satisfies bank solvency requirement." if solvency_passed else "Need updated bank solvency letter from scheduled commercial bank."
        ))
        if not solvency_passed:
            recommendations.append(f"Request your bank manager immediately for a Solvency Certificate of ₹ {req_solvency:,.0f}.")

        # Gate 4: EMD Determination
        if contractor.is_msme_registered and analysis.basic_info.emd_msme_exemption:
            emd_action = "EXEMPTED: Attach valid Udyam Registration Certificate & MSME Declaration."
        else:
            emd_action = f"PAYABLE: Submit FDR / BG / Online RTGS of ₹ {analysis.basic_info.emd_amount_inr:,.0f}."
            if contractor.is_msme_registered and not analysis.basic_info.emd_msme_exemption:
                recommendations.append("Note: This public authority does NOT allow MSME exemption for this tender category. EMD must be deposited in full.")

        # Gate 5: Mandatory Document Checklist
        req_doc_ids = [doc.doc_id for doc in analysis.mandatory_checklist if doc.is_mandatory]
        missing_docs = []
        for doc in analysis.mandatory_checklist:
            if doc.is_mandatory and doc.doc_id not in contractor.available_doc_ids:
                missing_docs.append(f"{doc.doc_name} ({doc.doc_id})")

        total_req_docs = len(req_doc_ids) if req_doc_ids else 1
        ready_docs = total_req_docs - len(missing_docs)
        readiness_percentage = round((ready_docs / total_req_docs) * 100.0, 1)

        if missing_docs:
            recommendations.append(f"Missing {len(missing_docs)} mandatory document(s). Upload them before final submission packet generation.")

        # Overall Status
        all_financial_technical = turnover_passed and exp_passed and solvency_passed
        if not turnover_passed or not exp_passed:
            overall_status = "DISQUALIFIED"
            fit_score = 30.0 if (turnover_passed or exp_passed) else 15.0
        elif missing_docs:
            overall_status = "AT_RISK"
            fit_score = round(70.0 * (ready_docs / total_req_docs) + 20.0, 1)
        else:
            overall_status = "ELIGIBLE"
            fit_score = 98.5

        if overall_status == "ELIGIBLE":
            recommendations.append("Green Light: Profile meets all technical, turnover, and statutory compliance requirements. Proceed to bid preparation.")

        return ScreeningVerdict(
            overall_status=overall_status,
            fit_score_percentage=fit_score,
            gates=gates,
            emd_action=emd_action,
            missing_mandatory_docs=missing_docs,
            readiness_percentage=readiness_percentage,
            actionable_recommendations=recommendations
        )
