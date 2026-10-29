import pytest
from httpx import ASGITransport, AsyncClient
from app.core.database import Base, engine
from app.main import app


@pytest.fixture(autouse=True)
async def setup_test_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.mark.asyncio
async def test_auth_flow():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Signup
        signup_res = await client.post("/api/v1/auth/signup", json={
            "email": "test@enterprise.com",
            "password": "Password123!",
            "full_name": "Test User",
            "organization_name": "Acme Corp",
        })
        assert signup_res.status_code == 200
        token_data = signup_res.json()
        assert "access_token" in token_data
        assert token_data["user"]["email"] == "test@enterprise.com"

        # Login
        login_res = await client.post("/api/v1/auth/login", json={
            "email": "test@enterprise.com",
            "password": "Password123!",
        })
        assert login_res.status_code == 200
        assert "access_token" in login_res.json()

        # Demo login
        demo_res = await client.post("/api/v1/auth/demo-login", json={"role": "admin"})
        assert demo_res.status_code == 200
        assert demo_res.json()["user"]["role"] == "Lead Asset Manager"


@pytest.mark.asyncio
async def test_claims_and_letter_flow():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Create a record first
        rec_res = await client.post("/api/v1/records/", json={
            "merchant_name": "Apple Fifth Avenue",
            "purchase_date": "2026-03-01",
            "total_amount": 2499.00,
            "currency": "USD",
            "category": "Electronics",
            "has_explicit_warranty": True,
            "warranty_duration_months": 24,
            "warranty_end_date": "2028-03-01",
            "items": [{"name": "MacBook Pro 16", "quantity": 1, "unit_price": 2499.00}],
        })
        rec_id = rec_res.json()["id"]

        # Create claim
        claim_res = await client.post("/api/v1/claims/", json={
            "record_id": rec_id,
            "title": "Screen Backlight Flickering",
            "issue_description": "LED backlight strobes intermittently on high brightness.",
            "desired_resolution": "Free Repair",
        })
        assert claim_res.status_code == 201
        claim_data = claim_res.json()
        claim_id = claim_data["id"]
        assert "CLM-2026-" in claim_data["claim_number"]
        assert claim_data["status"] == "SUBMITTED"

        # Generate formal claim letter
        letter_res = await client.post("/api/v1/claims/generate-letter", json={
            "record_id": rec_id,
            "issue_description": "LED backlight strobes intermittently on high brightness.",
            "desired_resolution": "Replacement",
            "user_name": "Alex Chen",
        })
        assert letter_res.status_code == 200
        assert "Magnuson-Moss" in letter_res.json()["letter_body"]

        # Update claim
        up_res = await client.put(f"/api/v1/claims/{claim_id}", json={
            "status": "APPROVED",
            "tracking_number": "TRK-992140",
        })
        assert up_res.status_code == 200
        assert up_res.json()["status"] == "APPROVED"


@pytest.mark.asyncio
async def test_notifications_and_workspace():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Trigger test notification
        n_res = await client.post("/api/v1/notifications/test-alert", json={
            "type": "EXPIRING_WARRANTY",
            "severity": "urgent",
            "title": "Test Urgency",
            "message": "Asset expiring soon",
        })
        assert n_res.status_code == 200
        n_id = n_res.json()["id"]

        # Mark read
        read_res = await client.put(f"/api/v1/notifications/{n_id}/read")
        assert read_res.status_code == 200
        assert read_res.json()["read"] is True

        # Reset demo data
        reset_res = await client.post("/api/v1/workspace/reset-demo")
        assert reset_res.status_code == 200

        # Check analytics summary
        analytics_res = await client.get("/api/v1/workspace/analytics")
        assert analytics_res.status_code == 200
        summary = analytics_res.json()
        assert summary["total_portfolio_value"] > 0
        assert len(summary["category_distribution"]) > 0
