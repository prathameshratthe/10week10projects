from typing import List
from app.models.schemas import (
    CitizenProfile,
    Gender,
    OccupationType,
    SchemeEligibilityStatus,
    SchemeMatch,
    SchemeSathiResponse,
)


class SchemeEngine:
    @classmethod
    def evaluate_profile(cls, profile: CitizenProfile) -> SchemeSathiResponse:
        eligible: List[SchemeMatch] = []
        ineligible: List[SchemeMatch] = []

        # 1. PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)
        if profile.occupation == OccupationType.FARMER and profile.landholding_acres > 0:
            if profile.is_income_tax_payer:
                ineligible.append(SchemeMatch(
                    scheme_code="PM_KISAN",
                    scheme_name="PM Kisan Samman Nidhi",
                    ministry="Ministry of Agriculture & Farmers Welfare",
                    status=SchemeEligibilityStatus.NOT_ELIGIBLE,
                    annual_financial_benefit_inr=0.0,
                    explanation="Disqualified: Income tax payees in previous assessment year are strictly excluded from PM-KISAN.",
                    mandatory_documents=["Aadhaar", "Land Ownership Record (7/12 Extract)", "Bank Passbook"],
                    official_portal_url="https://pmkisan.gov.in",
                    official_gazette_citation="MoA&FW Guidelines 2024, Exclusion Criterion 3.2(b)"
                ))
            elif profile.occupation == OccupationType.GOVERNMENT_EMPLOYEE:
                ineligible.append(SchemeMatch(
                    scheme_code="PM_KISAN",
                    scheme_name="PM Kisan Samman Nidhi",
                    ministry="Ministry of Agriculture & Farmers Welfare",
                    status=SchemeEligibilityStatus.NOT_ELIGIBLE,
                    annual_financial_benefit_inr=0.0,
                    explanation="Disqualified: Serving or retired central/state government officers are ineligible.",
                    mandatory_documents=["Aadhaar", "Land Records"],
                    official_portal_url="https://pmkisan.gov.in",
                    official_gazette_citation="MoA&FW Guidelines 2024, Exclusion Criterion 3.2(a)"
                ))
            else:
                eligible.append(SchemeMatch(
                    scheme_code="PM_KISAN",
                    scheme_name="PM Kisan Samman Nidhi",
                    ministry="Ministry of Agriculture & Farmers Welfare",
                    status=SchemeEligibilityStatus.ELIGIBLE,
                    annual_financial_benefit_inr=6000.0,
                    explanation="Eligible: Small/marginal farmer family holding cultivable agricultural land.",
                    mandatory_documents=["Aadhaar Card", "Land 7/12 / Khasra Record", "Aadhaar-seeded Bank Account"],
                    official_portal_url="https://pmkisan.gov.in",
                    official_gazette_citation="MoA&FW PM-KISAN Operational Guidelines 2024, Clause 3.1"
                ))
        else:
            ineligible.append(SchemeMatch(
                scheme_code="PM_KISAN",
                scheme_name="PM Kisan Samman Nidhi",
                ministry="Ministry of Agriculture & Farmers Welfare",
                status=SchemeEligibilityStatus.NOT_ELIGIBLE,
                annual_financial_benefit_inr=0.0,
                explanation="Disqualified: PM-KISAN strictly requires documented cultivable landownership by the applicant family.",
                mandatory_documents=["Land Record 7/12"],
                official_portal_url="https://pmkisan.gov.in",
                official_gazette_citation="MoA&FW Guidelines 2024, Clause 2.1"
            ))

        # 2. Ayushman Bharat — PMJAY
        if not profile.is_income_tax_payer and profile.occupation != OccupationType.GOVERNMENT_EMPLOYEE and profile.annual_income_inr <= 250000.0:
            eligible.append(SchemeMatch(
                scheme_code="AYUSHMAN_BHARAT",
                scheme_name="Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (PM-JAY)",
                ministry="National Health Authority (NHA) / MoHFW",
                status=SchemeEligibilityStatus.ELIGIBLE,
                annual_financial_benefit_inr=500000.0,
                explanation="Eligible: Economically deprived family with annual income ≤ ₹2.5 Lakhs qualifies for cashless secondary/tertiary hospital care.",
                mandatory_documents=["Aadhaar Card", "Ration Card (BPL/Antyodaya/Priority Household)", "Income Certificate"],
                official_portal_url="https://pmjay.gov.in",
                official_gazette_citation="NHA PMJAY Operational Manual v4.0, Beneficiary Identification Sec 2"
            ))
        else:
            reason = "Income tax payer status" if profile.is_income_tax_payer else ("Government health scheme coverage" if profile.occupation == OccupationType.GOVERNMENT_EMPLOYEE else "Annual family income exceeds ₹2,50,000 threshold")
            ineligible.append(SchemeMatch(
                scheme_code="AYUSHMAN_BHARAT",
                scheme_name="Ayushman Bharat PM-JAY",
                ministry="National Health Authority (NHA)",
                status=SchemeEligibilityStatus.NOT_ELIGIBLE,
                annual_financial_benefit_inr=0.0,
                explanation=f"Disqualified: Ineligible due to {reason}.",
                mandatory_documents=["Ration Card"],
                official_portal_url="https://pmjay.gov.in",
                official_gazette_citation="NHA PMJAY Exclusion Manual, Chapter 3"
            ))

        # 3. Pradhan Mantri Awas Yojana (PMAY-G)
        if not profile.owns_pucca_house and profile.annual_income_inr <= 300000.0:
            eligible.append(SchemeMatch(
                scheme_code="PM_AWAS",
                scheme_name="Pradhan Mantri Awas Yojana (Gramin / Urban Housing Subsidy)",
                ministry="Ministry of Rural Development / MoHUA",
                status=SchemeEligibilityStatus.ELIGIBLE,
                annual_financial_benefit_inr=120000.0,
                explanation="Eligible: Houseless family or household without a pucca (permanent) residential structure in India.",
                mandatory_documents=["Aadhaar Card", "Gram Panchayat / Ward Certificate of Kutcha House", "Bank Account Details", "Land Title Deed"],
                official_portal_url="https://pmayg.nic.in",
                official_gazette_citation="MoRD PMAY-G Implementation Framework 2024, Clause 4.2"
            ))
        else:
            ineligible.append(SchemeMatch(
                scheme_code="PM_AWAS",
                scheme_name="Pradhan Mantri Awas Yojana",
                ministry="Ministry of Rural Development",
                status=SchemeEligibilityStatus.NOT_ELIGIBLE,
                annual_financial_benefit_inr=0.0,
                explanation="Disqualified: Household already owns a pucca dwelling unit or annual income exceeds low-income housing criteria.",
                mandatory_documents=["Ownership Documents"],
                official_portal_url="https://pmayg.nic.in",
                official_gazette_citation="MoRD PMAY-G Framework 2024, Ineligibility Filter Clause 4.3"
            ))

        # 4. Sukanya Samriddhi Yojana (SSY)
        if profile.has_girl_child_under_10:
            eligible.append(SchemeMatch(
                scheme_code="SUKANYA_SAMRIDDHI",
                scheme_name="Sukanya Samriddhi Yojana (SSY)",
                ministry="Ministry of Finance (Dept of Economic Affairs)",
                status=SchemeEligibilityStatus.ELIGIBLE,
                annual_financial_benefit_inr=150000.0,
                explanation="Eligible: Parent/guardian of girl child aged below 10 years eligible for high-interest (8.2%) tax-free sovereign child security savings.",
                mandatory_documents=["Birth Certificate of Girl Child", "Guardian Aadhaar & PAN", "Address Proof"],
                official_portal_url="https://www.indiapost.gov.in",
                official_gazette_citation="Govt of India GSR 914(E), Sukanya Samriddhi Account Rules 2019, Rule 3"
            ))
        else:
            ineligible.append(SchemeMatch(
                scheme_code="SUKANYA_SAMRIDDHI",
                scheme_name="Sukanya Samriddhi Yojana",
                ministry="Ministry of Finance",
                status=SchemeEligibilityStatus.NOT_ELIGIBLE,
                annual_financial_benefit_inr=0.0,
                explanation="Disqualified: SSY account opening is strictly restricted to families with a biological/adopted girl child below 10 years of age.",
                mandatory_documents=["Girl Child Birth Certificate"],
                official_portal_url="https://www.indiapost.gov.in",
                official_gazette_citation="GSR 914(E), SSY Rules 2019, Rule 3(1)"
            ))

        # 5. Mukhyamantri Majhi Ladki Bahin Yojana (Maharashtra)
        if profile.state.lower() == "maharashtra" and profile.gender == Gender.FEMALE and 21 <= profile.age <= 65 and profile.annual_income_inr <= 250000.0 and not profile.is_income_tax_payer:
            eligible.append(SchemeMatch(
                scheme_code="LADKI_BAHIN",
                scheme_name="Mukhyamantri Majhi Ladki Bahin Yojana",
                ministry="Govt of Maharashtra (Women & Child Development Dept)",
                status=SchemeEligibilityStatus.ELIGIBLE,
                annual_financial_benefit_inr=18000.0,
                explanation="Eligible: Female resident of Maharashtra aged 21-65 with family income under ₹2.5 Lakhs receives ₹1,500/month DBT support.",
                mandatory_documents=["Aadhaar Card", "Maharashtra Domicile / Ration Card", "Income Certificate (≤ ₹2.5L)", "Bank Account linked to Aadhaar"],
                official_portal_url="https://ladakibahin.maharashtra.gov.in",
                official_gazette_citation="Govt of Maharashtra Resolution No. WCD-2024/CR-142, Dt. 28-06-2024"
            ))
        else:
            reason = "State is not Maharashtra" if profile.state.lower() != "maharashtra" else ("Gender is not female" if profile.gender != Gender.FEMALE else ("Age outside 21-65 window" if not (21 <= profile.age <= 65) else "Income exceeds ₹2.5L or tax payer status"))
            ineligible.append(SchemeMatch(
                scheme_code="LADKI_BAHIN",
                scheme_name="Majhi Ladki Bahin Yojana (Maharashtra)",
                ministry="Govt of Maharashtra (WCD)",
                status=SchemeEligibilityStatus.NOT_ELIGIBLE,
                annual_financial_benefit_inr=0.0,
                explanation=f"Disqualified: Ineligible due to {reason}.",
                mandatory_documents=["Domicile & Income Certificate"],
                official_portal_url="https://ladakibahin.maharashtra.gov.in",
                official_gazette_citation="Govt of Maharashtra Resolution No. WCD-2024/CR-142, Clause 4"
            ))

        # 6. PM SVANidhi (Micro-credit for Urban Street Vendors)
        if profile.occupation == OccupationType.STREET_VENDOR:
            eligible.append(SchemeMatch(
                scheme_code="PM_SVANIDHI",
                scheme_name="PM Street Vendor's AtmaNirbhar Nidhi (PM SVANidhi)",
                ministry="Ministry of Housing and Urban Affairs (MoHUA)",
                status=SchemeEligibilityStatus.ELIGIBLE,
                annual_financial_benefit_inr=50000.0,
                explanation="Eligible: Urban street vendor eligible for ₹10k–₹50k collateral-free working capital micro-credit with 7% interest subsidy and digital cashbacks.",
                mandatory_documents=["Vending Certificate / Urban Local Body ID Card", "Aadhaar Card", "Bank Account Details"],
                official_portal_url="https://pmsvanidhi.mohua.gov.in",
                official_gazette_citation="MoHUA PM SVANidhi Operational Guidelines 2024, Section 3.1"
            ))
        else:
            ineligible.append(SchemeMatch(
                scheme_code="PM_SVANIDHI",
                scheme_name="PM SVANidhi",
                ministry="Ministry of Housing and Urban Affairs",
                status=SchemeEligibilityStatus.NOT_ELIGIBLE,
                annual_financial_benefit_inr=0.0,
                explanation="Disqualified: PM SVANidhi is exclusively designated for verified urban street hawkers and mobile cart vendors.",
                mandatory_documents=["Town Vending Committee Certificate"],
                official_portal_url="https://pmsvanidhi.mohua.gov.in",
                official_gazette_citation="MoHUA PM SVANidhi Guidelines, Section 3.2"
            ))

        total_benefit = sum(s.annual_financial_benefit_inr for s in eligible)
        all_citations = len(eligible) + len(ineligible)

        return SchemeSathiResponse(
            citizen_name=profile.name or "Citizen",
            eligible_schemes=eligible,
            ineligible_schemes=ineligible,
            total_potential_benefit_inr=total_benefit,
            abstention_count=len(ineligible),
            citations_count=all_citations
        )
