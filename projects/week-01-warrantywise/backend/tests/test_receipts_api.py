import io
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
async def test_extract_receipt_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        receipt_content = """
        TARGET STORE #1042
        Minneapolis, MN
        Date: 2026-07-20
        Invoice #: TGT-883921

        Ninja Air Fryer Pro   1   $129.99
        Air Fryer Liners      1   $12.50

        Total: $142.49
        Payment: Visa ending 4920

        * 1 Year Limited Manufacturer Warranty *
        * 90 Days Return Policy with Receipt *
        """
        file_obj = io.BytesIO(receipt_content.encode("utf-8"))
        files = {"file": ("target_receipt.txt", file_obj, "text/plain")}

        res = await client.post("/api/v1/receipts/extract", files=files)
        assert res.status_code == 200
        data = res.json()
        assert data["merchant_name"] == "TARGET STORE #1042"
        assert data["purchase_date"] == "2026-07-20"
        assert data["total_amount"] == 142.49
        assert data["has_explicit_warranty"] is True
        assert data["warranty_duration_months"] == 12
        assert data["has_explicit_return_policy"] is True
        assert data["return_window_days"] == 90
