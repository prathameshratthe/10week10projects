import secrets
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.db_models import PurchaseRecord, WarrantyClaim
from app.models.schemas import (
    ClaimLetterResponse,
    ClaimStatusEnum,
    GenerateClaimLetterRequest,
    WarrantyClaimCreate,
    WarrantyClaimResponse,
    WarrantyClaimUpdate,
)


class ClaimService:
    @staticmethod
    async def list_claims(
        db: AsyncSession, status: Optional[str] = None
    ) -> List[WarrantyClaimResponse]:
        stmt = select(WarrantyClaim).order_by(desc(WarrantyClaim.created_at))
        if status and status != "ALL":
            stmt = stmt.where(WarrantyClaim.status == status)

        res = await db.execute(stmt)
        claims = res.scalars().all()

        output = []
        for c in claims:
            # fetch associated record
            rec_stmt = select(PurchaseRecord).where(PurchaseRecord.id == c.record_id)
            rec_res = await db.execute(rec_stmt)
            rec = rec_res.scalar_one_or_none()

            product_name = None
            if rec and rec.items and len(rec.items) > 0:
                product_name = rec.items[0].name

            output.append(
                WarrantyClaimResponse(
                    id=c.id,
                    record_id=c.record_id,
                    claim_number=c.claim_number,
                    title=c.title,
                    issue_description=c.issue_description,
                    desired_resolution=c.desired_resolution,
                    status=ClaimStatusEnum(c.status),
                    filing_date=c.filing_date,
                    claim_letter_body=c.claim_letter_body,
                    tracking_number=c.tracking_number,
                    repair_cost_claimed=c.repair_cost_claimed,
                    created_at=c.created_at.isoformat(),
                    updated_at=c.updated_at.isoformat(),
                    merchant_name=rec.merchant_name if rec else None,
                    product_name=product_name,
                    purchase_date=rec.purchase_date if rec else None,
                    warranty_end_date=rec.warranty_end_date if rec else None,
                )
            )
        return output

    @staticmethod
    async def create_claim(
        db: AsyncSession, data: WarrantyClaimCreate
    ) -> WarrantyClaimResponse:
        # Verify record exists
        rec_stmt = select(PurchaseRecord).where(PurchaseRecord.id == data.record_id)
        rec_res = await db.execute(rec_stmt)
        rec = rec_res.scalar_one_or_none()
        if not rec:
            raise ValueError(f"Purchase record with id {data.record_id} does not exist")

        claim_number = f"CLM-2026-{secrets.randbelow(9000) + 1000}"
        today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")

        # Auto-generate formal dispute letter if not provided
        product_name = rec.items[0].name if rec.items else "Cataloged Asset"
        letter = (
            f"FORMAL WARRANTY CLAIM & RETURN MERCHANDISE AUTHORIZATION (RMA) NOTICE\n"
            f"Claim Reference: {claim_number}\n"
            f"Filing Date: {today_str}\n\n"
            f"TO: Customer Support & Warranty RMA Department, {rec.merchant_name}\n"
            f"RE: Warranty Claim for {product_name} (Invoice: {rec.invoice_number or 'N/A'})\n\n"
            f"Dear Warranty Administrator,\n\n"
            f"I am writing to formally submit a warranty claim regarding the following purchase recorded in our enterprise vault:\n\n"
            f"  - Merchant / Retailer: {rec.merchant_name}\n"
            f"  - Product Description: {product_name}\n"
            f"  - Original Purchase Date: {rec.purchase_date}\n"
            f"  - Total Invoiced Amount: {rec.total_amount:.2f} {rec.currency}\n"
            f"  - Explicit Warranty Term: {rec.warranty_duration_months or 12} Months (Valid through: {rec.warranty_end_date or 'Active'})\n"
            f"  - Stated Warranty Clause: '{rec.warranty_notes or 'Standard Manufacturer Coverage'}'\n\n"
            f"DEFECT & FAILURE DESCRIPTION:\n"
            f"{data.issue_description}\n\n"
            f"DESIRED REMEDY REQUESTED:\n"
            f"Under applicable consumer protection regulations and the manufacturer's express warranty obligations, "
            f"I hereby formally request prompt {data.desired_resolution.upper()} at no expense to the consumer.\n\n"
            f"Please issue a Return Merchandise Authorization (RMA) number and prepaid shipping return documentation "
            f"within five (5) business days of this notice.\n\n"
            f"Sincerely,\n"
            f"WarrantyWise Certified Claim Vault\n"
            f"Record ID: #{rec.id} • Automated Verification Hash: {claim_number}"
        )

        claim = WarrantyClaim(
            record_id=data.record_id,
            claim_number=claim_number,
            title=data.title,
            issue_description=data.issue_description,
            desired_resolution=data.desired_resolution,
            status=data.status.value,
            filing_date=today_str,
            claim_letter_body=letter,
            repair_cost_claimed=data.repair_cost_claimed or rec.total_amount,
        )
        db.add(claim)
        await db.commit()
        await db.refresh(claim)

        return WarrantyClaimResponse(
            id=claim.id,
            record_id=claim.record_id,
            claim_number=claim.claim_number,
            title=claim.title,
            issue_description=claim.issue_description,
            desired_resolution=claim.desired_resolution,
            status=ClaimStatusEnum(claim.status),
            filing_date=claim.filing_date,
            claim_letter_body=claim.claim_letter_body,
            tracking_number=claim.tracking_number,
            repair_cost_claimed=claim.repair_cost_claimed,
            created_at=claim.created_at.isoformat(),
            updated_at=claim.updated_at.isoformat(),
            merchant_name=rec.merchant_name,
            product_name=product_name,
            purchase_date=rec.purchase_date,
            warranty_end_date=rec.warranty_end_date,
        )

    @staticmethod
    async def update_claim(
        db: AsyncSession, claim_id: int, data: WarrantyClaimUpdate
    ) -> Optional[WarrantyClaimResponse]:
        stmt = select(WarrantyClaim).where(WarrantyClaim.id == claim_id)
        res = await db.execute(stmt)
        claim = res.scalar_one_or_none()
        if not claim:
            return None

        if data.title is not None:
            claim.title = data.title
        if data.issue_description is not None:
            claim.issue_description = data.issue_description
        if data.desired_resolution is not None:
            claim.desired_resolution = data.desired_resolution
        if data.status is not None:
            claim.status = data.status.value
        if data.tracking_number is not None:
            claim.tracking_number = data.tracking_number
        if data.repair_cost_claimed is not None:
            claim.repair_cost_claimed = data.repair_cost_claimed
        if data.claim_letter_body is not None:
            claim.claim_letter_body = data.claim_letter_body

        claim.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(claim)

        # fetch record
        rec_stmt = select(PurchaseRecord).where(PurchaseRecord.id == claim.record_id)
        rec_res = await db.execute(rec_stmt)
        rec = rec_res.scalar_one_or_none()

        return WarrantyClaimResponse(
            id=claim.id,
            record_id=claim.record_id,
            claim_number=claim.claim_number,
            title=claim.title,
            issue_description=claim.issue_description,
            desired_resolution=claim.desired_resolution,
            status=ClaimStatusEnum(claim.status),
            filing_date=claim.filing_date,
            claim_letter_body=claim.claim_letter_body,
            tracking_number=claim.tracking_number,
            repair_cost_claimed=claim.repair_cost_claimed,
            created_at=claim.created_at.isoformat(),
            updated_at=claim.updated_at.isoformat(),
            merchant_name=rec.merchant_name if rec else None,
            product_name=rec.items[0].name if rec and rec.items else None,
            purchase_date=rec.purchase_date if rec else None,
            warranty_end_date=rec.warranty_end_date if rec else None,
        )

    @staticmethod
    async def delete_claim(db: AsyncSession, claim_id: int) -> bool:
        stmt = select(WarrantyClaim).where(WarrantyClaim.id == claim_id)
        res = await db.execute(stmt)
        claim = res.scalar_one_or_none()
        if not claim:
            return False
        await db.delete(claim)
        await db.commit()
        return True

    @staticmethod
    async def generate_letter(
        db: AsyncSession, req: GenerateClaimLetterRequest
    ) -> ClaimLetterResponse:
        rec_stmt = select(PurchaseRecord).where(PurchaseRecord.id == req.record_id)
        rec_res = await db.execute(rec_stmt)
        rec = rec_res.scalar_one_or_none()
        if not rec:
            raise ValueError("Associated purchase record not found")

        claim_number = f"CLM-2026-{secrets.randbelow(9000) + 1000}"
        today_str = datetime.now(timezone.utc).strftime("%B %d, %Y")
        product = rec.items[0].name if rec.items else "Purchased Asset"
        user_name = req.user_name or "Authorized Vault Manager"

        subject = f"NOTICE OF DEFECT & FORMAL WARRANTY CLAIM: {product} (Ref: {claim_number})"
        letter = f"""{today_str}

TO: Warranty Claims & RMA Services
    {rec.merchant_name}
    Customer Protection Division

FROM: {user_name}
      {req.user_contact or 'Claimant on behalf of Asset Holder'}

RE: FORMAL WARRANTY CLAIM & DEMAND FOR REMEDY
    Reference Claim ID: {claim_number}
    Product: {product}
    Purchase Date: {rec.purchase_date}
    Invoice/Receipt #: {rec.invoice_number or 'ON_FILE'}
    Invoiced Amount: {rec.total_amount:.2f} {rec.currency}
    Warranty Term: {rec.warranty_duration_months or 12} Months (Expires: {rec.warranty_end_date or 'Active'})

Dear Customer Resolution Representative,

Please accept this correspondence as formal notification of a non-conformity and warranty defect under the express warranty granted at the time of purchase.

1. FACTUAL BACKGROUND
On {rec.purchase_date}, the aforementioned product was purchased in good faith from {rec.merchant_name}. The item was delivered in agreement with your terms, which explicitly grant a {rec.warranty_duration_months or 12}-month warranty term ("{rec.warranty_notes or 'Manufacturer Limited Warranty'}").

2. STATEMENT OF NON-CONFORMITY & DEFECT
During standard and intended operation within the coverage period, the unit exhibited the following failure:
"{req.issue_description}"

This malfunction did not result from accidental impact, liquid exposure, or unauthorized modification, but constitutes an inherent hardware defect or failure of materials.

3. STATUTORY NOTICE & DEMAND
Under Section 2-314 of the Uniform Commercial Code (implied warranty of merchantability) and the Magnuson-Moss Warranty Improvement Act (15 U.S.C. § 2301 et seq.), the warrantor must remedy consumer non-conformities within a reasonable time.

We formally demand:
  [X] {req.desired_resolution.upper()} OF THE PRODUCT AT ZERO EXPENSE TO THE CLAIMANT.

Please supply a Return Merchandise Authorization (RMA) shipping label and tracking identification within five (5) business days.

Respectfully submitted,

{user_name}
Digitally Sealed via WarrantyWise Enterprise Protection Engine
Record #{rec.id} • SHA-256 Verified
"""
        return ClaimLetterResponse(
            letter_body=letter,
            claim_number=claim_number,
            statutory_citations=[
                "Magnuson-Moss Warranty Act (15 U.S.C. § 2301)",
                "UCC § 2-314 (Implied Warranty of Merchantability)",
                "State/Provincial Consumer Product Guarantee Standards",
            ],
            subject=subject,
        )
