from collections import defaultdict
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.db_models import PurchaseRecord, WarrantyClaim
from app.models.schemas import (
    AnalyticsSummaryResponse,
    CategorySpendItem,
    ExpirationTimelineItem,
    VendorReliabilityItem,
)
from app.services.record_service import RecordService
from app.services.seed_service import populate_enterprise_demo_data

router = APIRouter(prefix="/workspace", tags=["Enterprise Workspace & Analytics"])


@router.get("/analytics", response_model=AnalyticsSummaryResponse)
async def get_analytics_summary(db: AsyncSession = Depends(get_db)):
    """Retrieve full executive BI metrics, capital at risk, vendor ratings, and quarterly timeline."""
    records = await RecordService.list_records(db=db, limit=200)
    claims_stmt = select(WarrantyClaim)
    claims_res = await db.execute(claims_stmt)
    claims = claims_res.scalars().all()

    # Total spend & Category spend
    total_spend = sum(r.total_amount for r in records)
    category_map = defaultdict(lambda: {"amount": 0.0, "count": 0})
    vendor_map = defaultdict(lambda: {"records": 0, "active": 0, "claims": 0})

    capital_at_risk = 0.0
    active_warranties = 0
    t_30d_count = 0
    t_30d_val = 0.0
    t_60d_count = 0
    t_60d_val = 0.0
    t_year_count = 0
    t_year_val = 0.0
    t_multiyear_count = 0
    t_multiyear_val = 0.0

    for r in records:
        category_map[r.category]["amount"] += r.total_amount
        category_map[r.category]["count"] += 1

        vendor = r.merchant_name.split()[0]
        vendor_map[vendor]["records"] += 1
        if r.warranty_status == "ACTIVE":
            active_warranties += 1
            vendor_map[vendor]["active"] += 1

        # Days left warranty
        if r.has_explicit_warranty and r.days_left_warranty is not None:
            days = r.days_left_warranty
            if 0 <= days <= 60:
                capital_at_risk += r.total_amount

            if 0 <= days <= 30:
                t_30d_count += 1
                t_30d_val += r.total_amount
            elif 30 < days <= 60:
                t_60d_count += 1
                t_60d_val += r.total_amount
            elif 60 < days <= 365:
                t_year_count += 1
                t_year_val += r.total_amount
            elif days > 365:
                t_multiyear_count += 1
                t_multiyear_val += r.total_amount

    # Category items
    category_items = []
    for cat, data in sorted(category_map.items(), key=lambda x: x[1]["amount"], reverse=True):
        pct = round((data["amount"] / total_spend * 100), 1) if total_spend > 0 else 0.0
        category_items.append(
            CategorySpendItem(
                category=cat,
                total_amount=round(data["amount"], 2),
                percentage=pct,
                item_count=data["count"],
            )
        )

    # Vendor reliability
    vendor_claims_map = defaultdict(int)
    for c in claims:
        # find record merchant
        for r in records:
            if r.id == c.record_id:
                vendor = r.merchant_name.split()[0]
                vendor_claims_map[vendor] += 1

    vendor_items = []
    for v, v_data in vendor_map.items():
        c_count = vendor_claims_map[v]
        # Score calculation: base 100 minus claims penalty
        score = max(70.0, min(99.0, 95.0 - (c_count * 8.5) + (v_data["records"] * 1.5)))
        vendor_items.append(
            VendorReliabilityItem(
                vendor=v,
                records_count=v_data["records"],
                active_warranties=v_data["active"],
                claims_filed=c_count,
                reliability_score=round(score, 1),
            )
        )
    vendor_items.sort(key=lambda x: x.reliability_score, reverse=True)

    # Expiration timeline
    expiration_timeline = [
        ExpirationTimelineItem(period="Next 30 Days (Urgent)", count=t_30d_count, total_insured_value=round(t_30d_val, 2)),
        ExpirationTimelineItem(period="31 - 60 Days", count=t_60d_count, total_insured_value=round(t_60d_val, 2)),
        ExpirationTimelineItem(period="Next 12 Months", count=t_year_count, total_insured_value=round(t_year_val, 2)),
        ExpirationTimelineItem(period="Long-Term (2+ Years)", count=t_multiyear_count, total_insured_value=round(t_multiyear_val, 2)),
    ]

    total_claims = len(claims)
    settled_claims = sum(1 for c in claims if c.status in ["APPROVED", "REJECTED"])
    settlement_rate = round((settled_claims / total_claims * 100), 1) if total_claims > 0 else 100.0

    return AnalyticsSummaryResponse(
        total_portfolio_value=round(total_spend, 2),
        capital_at_risk=round(capital_at_risk, 2),
        total_active_warranties=active_warranties,
        total_claims_active=sum(1 for c in claims if c.status in ["SUBMITTED", "IN_REVIEW"]),
        claims_settlement_rate=settlement_rate,
        category_distribution=category_items,
        expiration_timeline=expiration_timeline,
        vendor_reliability=vendor_items,
    )


@router.post("/reset-demo")
async def reset_demo_database(db: AsyncSession = Depends(get_db)):
    """Reset and re-populate the vault with enterprise demo assets, claims, and alerts."""
    await populate_enterprise_demo_data(db)
    return {"message": "Enterprise demo database successfully initialized with 8 assets, 3 claims, and alerts"}
