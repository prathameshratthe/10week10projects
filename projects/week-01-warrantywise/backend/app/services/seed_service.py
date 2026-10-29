from datetime import datetime, timedelta, timezone
from sqlalchemy import select, func, delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.db_models import NotificationItem, PurchaseRecord, ReceiptItem, User, WarrantyClaim
from app.services.auth_service import hash_password


async def seed_initial_data_if_empty(db: AsyncSession) -> bool:
    count_stmt = select(func.count(PurchaseRecord.id))
    res = await db.execute(count_stmt)
    count = res.scalar() or 0
    if count > 0:
        return False  # Already populated

    await populate_enterprise_demo_data(db)
    return True


async def populate_enterprise_demo_data(db: AsyncSession) -> None:
    # Clean previous records if resetting
    await db.execute(delete(NotificationItem))
    await db.execute(delete(WarrantyClaim))
    await db.execute(delete(ReceiptItem))
    await db.execute(delete(PurchaseRecord))

    # Ensure admin & consumer demo users exist
    admin_stmt = select(User).where(User.email == "alex.chen@nexus.corp")
    admin_res = await db.execute(admin_stmt)
    if not admin_res.scalar_one_or_none():
        admin_user = User(
            email="alex.chen@nexus.corp",
            hashed_password=hash_password("admin123"),
            full_name="Alex Chen",
            organization_name="Nexus Technologies Inc.",
            role="Hardware Procurement Lead",
            api_key="ww_live_nexus_corp_9948201a",
        )
        db.add(admin_user)

    consumer_stmt = select(User).where(User.email == "sarah.connor@personal.vault")
    consumer_res = await db.execute(consumer_stmt)
    if not consumer_res.scalar_one_or_none():
        consumer_user = User(
            email="sarah.connor@personal.vault",
            hashed_password=hash_password("consumer123"),
            full_name="Sarah Connor",
            organization_name="Personal Household Vault",
            role="Personal Vault Owner",
            api_key="ww_live_consumer_vault_810294b",
        )
        db.add(consumer_user)

    now = datetime.now(timezone.utc)
    today = now.strftime("%Y-%m-%d")

    # Dates calculation
    date_expiring_soon = (now + timedelta(days=18)).strftime("%Y-%m-%d")
    date_return_urgency = (now + timedelta(days=4)).strftime("%Y-%m-%d")
    date_active_long = (now + timedelta(days=730)).strftime("%Y-%m-%d")
    date_active_medium = (now + timedelta(days=340)).strftime("%Y-%m-%d")
    date_expired_past = (now - timedelta(days=45)).strftime("%Y-%m-%d")

    past_date_60d = (now - timedelta(days=60)).strftime("%Y-%m-%d")
    past_date_300d = (now - timedelta(days=300)).strftime("%Y-%m-%d")
    past_date_10d = (now - timedelta(days=10)).strftime("%Y-%m-%d")
    past_date_400d = (now - timedelta(days=400)).strftime("%Y-%m-%d")

    # 1. Apple MacBook Pro M3 Max
    macbook = PurchaseRecord(
        merchant_name="Apple Fifth Avenue",
        merchant_address="767 5th Ave, New York, NY 10153",
        purchase_date=past_date_60d,
        total_amount=3499.00,
        tax_amount=297.41,
        currency="USD",
        category="Electronics",
        invoice_number="APL-998241",
        payment_method="Corporate Amex",
        has_explicit_warranty=True,
        warranty_duration_months=36,
        warranty_end_date=date_active_long,
        warranty_notes="AppleCare+ for Enterprise (3-Year Accidental Damage Protection)",
        has_explicit_return_policy=True,
        return_window_days=14,
        return_deadline=(now - timedelta(days=46)).strftime("%Y-%m-%d"),
        return_notes="14-day Apple Retail Return Window (Lapsed)",
        notes="Primary engineering workstation for ML training and local LLM fine-tuning.",
    )
    macbook.items.append(ReceiptItem(name="MacBook Pro 16-inch M3 Max (64GB, 1TB)", quantity=1, unit_price=3199.00, total_price=3199.00, category="Laptops"))
    macbook.items.append(ReceiptItem(name="AppleCare+ 3-Year Protection Plan", quantity=1, unit_price=300.00, total_price=300.00, category="Services"))

    # 2. Dell XPS 15 Enterprise Workstation
    dell = PurchaseRecord(
        merchant_name="Dell Technologies Direct",
        merchant_address="One Dell Way, Round Rock, TX 78682",
        purchase_date=past_date_300d,
        total_amount=2199.00,
        tax_amount=175.92,
        currency="USD",
        category="Electronics",
        invoice_number="DELL-8831092",
        payment_method="ACH Wire Transfer",
        has_explicit_warranty=True,
        warranty_duration_months=36,
        warranty_end_date=date_active_long,
        warranty_notes="3-Year ProSupport Plus Next Business Day Onsite Service",
        has_explicit_return_policy=True,
        return_window_days=30,
        return_deadline=(now - timedelta(days=270)).strftime("%Y-%m-%d"),
        return_notes="30-day corporate return policy",
        notes="QA Lead system. Currently in active RMA for battery swelling.",
    )
    dell.items.append(ReceiptItem(name="Dell XPS 15 9530 (i9-13900H, 32GB RAM, RTX 4070)", quantity=1, unit_price=2199.00, total_price=2199.00, category="Laptops"))

    # 3. Sony WH-1000XM5 ANC Headphones (EXPIRING SOON - 18 DAYS LEFT)
    sony = PurchaseRecord(
        merchant_name="B&H Photo Video",
        merchant_address="420 9th Ave, New York, NY 10001",
        purchase_date=(now - timedelta(days=347)).strftime("%Y-%m-%d"),
        total_amount=399.99,
        tax_amount=35.50,
        currency="USD",
        category="Electronics",
        invoice_number="BH-109924-US",
        payment_method="Mastercard",
        has_explicit_warranty=True,
        warranty_duration_months=12,
        warranty_end_date=date_expiring_soon,
        warranty_notes="1-Year Limited Manufacturer Warranty (Coverage ending this month!)",
        has_explicit_return_policy=True,
        return_window_days=30,
        return_deadline=(now - timedelta(days=317)).strftime("%Y-%m-%d"),
        return_notes="30-day return policy",
        notes="Audio testing headset. Action needed: file claim before warranty closes in 18 days.",
    )
    sony.items.append(ReceiptItem(name="Sony WH-1000XM5 Wireless Noise-Canceling Headphones", quantity=1, unit_price=399.99, total_price=399.99, category="Audio"))

    # 4. Herman Miller Aeron Ergonomic Chair
    herman = PurchaseRecord(
        merchant_name="Herman Miller Commercial",
        merchant_address="855 E Main Ave, Zeeland, MI 49464",
        purchase_date=past_date_60d,
        total_amount=1495.00,
        tax_amount=119.60,
        currency="USD",
        category="Furniture",
        invoice_number="HM-7749102",
        payment_method="Corporate Amex",
        has_explicit_warranty=True,
        warranty_duration_months=144,
        warranty_end_date=(now + timedelta(days=4300)).strftime("%Y-%m-%d"),
        warranty_notes="12-Year 24/7 Multi-Shift Structural Warranty including pneumatic cylinder",
        has_explicit_return_policy=True,
        return_window_days=30,
        return_deadline=(now - timedelta(days=30)).strftime("%Y-%m-%d"),
        return_notes="30-day trial with free return pickup",
        notes="Executive desk seating. 12-year manufacturer guaranteed coverage.",
    )
    herman.items.append(ReceiptItem(name="Aeron Chair Size B Graphite Fully Featured", quantity=1, unit_price=1495.00, total_price=1495.00, category="Office Seating"))

    # 5. Keychron Q1 Pro Mechanical Keyboard (RETURN WINDOW EXPIRING IN 4 DAYS)
    keychron = PurchaseRecord(
        merchant_name="Keychron Online Store",
        merchant_address="keychron.com",
        purchase_date=past_date_10d,
        total_amount=199.00,
        tax_amount=0.00,
        currency="USD",
        category="Electronics",
        invoice_number="KC-551029",
        payment_method="PayPal",
        has_explicit_warranty=True,
        warranty_duration_months=12,
        warranty_end_date=date_active_medium,
        warranty_notes="1-Year Manufacturer Warranty on PCB and switches",
        has_explicit_return_policy=True,
        return_window_days=14,
        return_deadline=date_return_urgency,
        return_notes="14-day hassle-free return window for refund or exchange",
        notes="Urgent: evaluate switch feel before 14-day return window closes in 4 days.",
    )
    keychron.items.append(ReceiptItem(name="Keychron Q1 Pro Wireless Custom Mechanical Keyboard", quantity=1, unit_price=199.00, total_price=199.00, category="Peripherals"))

    # 6. Samsung 65" Neo QLED Commercial Display
    samsung_tv = PurchaseRecord(
        merchant_name="Best Buy Commercial #104",
        merchant_address="Richfield, MN",
        purchase_date=past_date_60d,
        total_amount=1899.00,
        tax_amount=151.92,
        currency="USD",
        category="Home Appliances",
        invoice_number="BB-6649102",
        payment_method="Visa Business",
        has_explicit_warranty=True,
        warranty_duration_months=24,
        warranty_end_date=date_active_long,
        warranty_notes="2-Year Geek Squad Protection Plan + Panel Replacement",
        has_explicit_return_policy=True,
        return_window_days=15,
        return_deadline=(now - timedelta(days=45)).strftime("%Y-%m-%d"),
        return_notes="15-day return policy",
        notes="Main conference room video wall display.",
    )
    samsung_tv.items.append(ReceiptItem(name="Samsung 65-inch Class QN90C Neo QLED 4K Smart Display", quantity=1, unit_price=1899.00, total_price=1899.00, category="Displays"))

    # 7. Bosch Professional SDS-Plus Rotary Hammer (EXPIRED WARRANTY)
    bosch = PurchaseRecord(
        merchant_name="Home Depot Pro Center",
        merchant_address="2455 Paces Ferry Rd, Atlanta, GA",
        purchase_date=past_date_400d,
        total_amount=649.00,
        tax_amount=51.92,
        currency="USD",
        category="Tools",
        invoice_number="HD-339182",
        payment_method="Home Depot Commercial Card",
        has_explicit_warranty=True,
        warranty_duration_months=12,
        warranty_end_date=date_expired_past,
        warranty_notes="1-Year Limited Heavy Duty Tool Warranty (Coverage Expired)",
        has_explicit_return_policy=True,
        return_window_days=90,
        return_deadline=(now - timedelta(days=310)).strftime("%Y-%m-%d"),
        return_notes="90-day return policy for Pro account holders",
        notes="Facility maintenance equipment. Expired warranty preserved for asset depreciation audit.",
    )
    bosch.items.append(ReceiptItem(name="Bosch Bulldog Xtreme 1-inch SDS-plus Rotary Hammer", quantity=1, unit_price=649.00, total_price=649.00, category="Power Tools"))

    # 8. Croma Retail / Samsung Galaxy S24 Ultra (INR CURRENCY)
    s24 = PurchaseRecord(
        merchant_name="Croma Electronics",
        merchant_address="Phoenix Marketcity, Viman Nagar, Pune, India",
        purchase_date=past_date_60d,
        total_amount=129999.00,
        tax_amount=23399.82,
        currency="INR",
        category="Electronics",
        invoice_number="CR-MH-2026-90412",
        payment_method="UPI / HDFC Corporate",
        has_explicit_warranty=True,
        warranty_duration_months=12,
        warranty_end_date=date_active_medium,
        warranty_notes="1 Year Comprehensive Manufacturer Warranty on Handset & Motherboard",
        has_explicit_return_policy=True,
        return_window_days=7,
        return_deadline=(now - timedelta(days=53)).strftime("%Y-%m-%d"),
        return_notes="7-day replacement for manufacturing defects",
        notes="Leadership field device. GST input tax credit claimed.",
    )
    s24.items.append(ReceiptItem(name="Samsung Galaxy S24 Ultra 5G (Titanium Gray, 512GB)", quantity=1, unit_price=129999.00, total_price=129999.00, category="Smartphones"))

    db.add_all([macbook, dell, sony, herman, keychron, samsung_tv, bosch, s24])
    await db.commit()

    # Re-fetch for IDs to attach claims
    await db.refresh(dell)
    await db.refresh(sony)
    await db.refresh(bosch)

    # Seed 3 Claims
    claim1 = WarrantyClaim(
        record_id=dell.id,
        claim_number="CLM-2026-7240",
        title="Dell XPS 15: Thermal Throttling & Battery Swell",
        issue_description="Laptop battery chassis began bulging along the trackpad edge, causing intermittent trackpad click failures and extreme thermal throttling during compile cycles.",
        desired_resolution="Onsite Component Replacement",
        status="APPROVED",
        filing_date=(now - timedelta(days=12)).strftime("%Y-%m-%d"),
        claim_letter_body="Formal Dell ProSupport RMA claim submitted. Dell technician scheduled for onsite motherboard and battery pack replacement.",
        tracking_number="1Z9999999999999999",
        repair_cost_claimed=2199.00,
    )

    claim2 = WarrantyClaim(
        record_id=sony.id,
        claim_number="CLM-2026-8812",
        title="Sony WH-1000XM5: Right Hinge Pivot Crack & Audio Cutout",
        issue_description="Right ear cup swivel hinge exhibited stress cracking after 10 months of regular office usage, leading to crackling distortion and right channel dropout when ANC is active.",
        desired_resolution="Repair or Replacement",
        status="IN_REVIEW",
        filing_date=(now - timedelta(days=3)).strftime("%Y-%m-%d"),
        claim_letter_body="Sony RMA authorization requested. Service center ticket #SNY-884102 open and under diagnostic review.",
        tracking_number="940011189922319082",
        repair_cost_claimed=399.99,
    )

    claim3 = WarrantyClaim(
        record_id=bosch.id,
        claim_number="CLM-2026-9041",
        title="Bosch SDS-Plus: Chuck Bearing Lockup",
        issue_description="Tool chuck seized during rotary hammering operation after 13 months. Claim denied due to 12-month warranty expiration.",
        desired_resolution="Free Repair",
        status="REJECTED",
        filing_date=(now - timedelta(days=20)).strftime("%Y-%m-%d"),
        claim_letter_body="Formal request denied by Bosch Service Center as warranty expired 30 days prior to filing. Paid overhaul quote offered.",
        tracking_number=None,
        repair_cost_claimed=649.00,
    )

    db.add_all([claim1, claim2, claim3])

    # Seed 4 Notifications
    notif1 = NotificationItem(
        type="EXPIRING_RETURN",
        severity="urgent",
        title="Return Deadline Closing Soon",
        message="Keychron Q1 Pro Mechanical Keyboard return window expires in 4 days (Deadline: " + date_return_urgency + ").",
        record_id=keychron.id,
        read=False,
    )
    notif2 = NotificationItem(
        type="EXPIRING_WARRANTY",
        severity="urgent",
        title="Warranty Expiring in 18 Days",
        message="Sony WH-1000XM5 ANC Headphones warranty expires on " + date_expiring_soon + ". File inspection or claim immediately.",
        record_id=sony.id,
        read=False,
    )
    notif3 = NotificationItem(
        type="CLAIM_UPDATE",
        severity="info",
        title="Claim Approved: Dell XPS 15 RMA",
        message="Dell ProSupport approved battery replacement for Claim #CLM-2026-7240. Technician dispatch confirmed.",
        record_id=dell.id,
        read=False,
    )
    notif4 = NotificationItem(
        type="SYSTEM",
        severity="info",
        title="Enterprise Vault Active",
        message="8 capital assets secured. $10,340 USD + ₹129,999 INR total insured coverage active with zero hallucination verification.",
        record_id=None,
        read=True,
    )

    db.add_all([notif1, notif2, notif3, notif4])
    await db.commit()
