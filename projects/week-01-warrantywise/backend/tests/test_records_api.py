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
async def test_create_and_get_record():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Create record
        payload = {
            "merchant_name": "Apple Regent Street",
            "purchase_date": "2026-06-01",
            "total_amount": 999.00,
            "currency": "GBP",
            "category": "Electronics",
            "has_explicit_warranty": True,
            "warranty_duration_months": 12,
            "warranty_end_date": "2027-06-01",
            "has_explicit_return_policy": True,
            "return_window_days": 14,
            "return_deadline": "2026-06-15",
            "items": [
                {"name": "iPhone 16", "quantity": 1, "unit_price": 999.00, "total_price": 999.00}
            ],
        }
        res = await client.post("/api/v1/records/", json=payload)
        assert res.status_code == 201
        data = res.json()
        record_id = data["id"]
        assert data["merchant_name"] == "Apple Regent Street"
        assert len(data["items"]) == 1

        # Get record
        get_res = await client.get(f"/api/v1/records/{record_id}")
        assert get_res.status_code == 200
        assert get_res.json()["total_amount"] == 999.00


@pytest.mark.asyncio
async def test_list_records_and_stats():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Create 2 records
        await client.post("/api/v1/records/", json={
            "merchant_name": "IKEA Home",
            "purchase_date": "2026-01-01",
            "total_amount": 250.00,
            "currency": "USD",
            "category": "Furniture",
            "has_explicit_warranty": False,
        })
        await client.post("/api/v1/records/", json={
            "merchant_name": "Dyson Store",
            "purchase_date": "2026-02-15",
            "total_amount": 599.99,
            "currency": "USD",
            "category": "Home Appliances",
            "has_explicit_warranty": True,
            "warranty_duration_months": 24,
            "warranty_end_date": "2028-02-15",
        })

        # List records
        list_res = await client.get("/api/v1/records/")
        assert list_res.status_code == 200
        records = list_res.json()
        assert len(records) == 2

        # Check stats
        stats_res = await client.get("/api/v1/stats/")
        assert stats_res.status_code == 200
        stats = stats_res.json()
        assert stats["total_records"] == 2
        assert stats["total_spend_by_currency"]["USD"] == 849.99


@pytest.mark.asyncio
async def test_exports_csv_and_json():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Create a record
        await client.post("/api/v1/records/", json={
            "merchant_name": "Bose Audio",
            "purchase_date": "2026-05-20",
            "total_amount": 349.00,
            "currency": "USD",
            "category": "Audio",
        })

        # Export CSV
        csv_res = await client.get("/api/v1/records/export/csv")
        assert csv_res.status_code == 200
        assert "Bose Audio" in csv_res.text
        assert "text/csv" in csv_res.headers["content-type"]

        # Export JSON
        json_res = await client.get("/api/v1/records/export/json")
        assert json_res.status_code == 200
        data = json_res.json()
        assert isinstance(data, list)
        assert data[0]["merchant_name"] == "Bose Audio"
