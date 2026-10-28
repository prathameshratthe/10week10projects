import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app


@pytest.mark.asyncio
async def test_electricity_scam_detection():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "message_text": "Dear consumer your electricity power will be disconnected at 9:30 pm tonight from electricity office. Call officer 9821039481.",
            "sender_id": "9821039481",
            "message_type": "SMS"
        }
        res = await client.post("/api/v1/scan/text", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["risk_score"] >= 60
        assert data["verdict"] in ["CRITICAL_SCAM", "SUSPICIOUS"]
        assert len(data["red_flags"]) >= 1
        assert "electricity" in data["scam_category"].lower()


@pytest.mark.asyncio
async def test_upi_cashback_scam_detection():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "message_text": "You have won cashback of Rs 4999 in PhonePe. Enter UPI PIN to receive money directly into your bank account.",
            "message_type": "WhatsApp"
        }
        res = await client.post("/api/v1/scan/text", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["verdict"] == "CRITICAL_SCAM"
        assert any("PIN" in rf["title"] or "UPI" in rf["category"] for rf in data["red_flags"])


@pytest.mark.asyncio
async def test_benign_bank_alert_no_false_positive():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "message_text": "HDFC Bank Alert: A/c *1092 debited by Rs. 450.00 at Swiggy on 28-OCT-26. Avail bal: Rs 24,190.50.",
            "sender_id": "VM-HDFCBK",
            "message_type": "SMS"
        }
        res = await client.post("/api/v1/scan/text", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["verdict"] == "SAFE"
        assert data["risk_score"] <= 15
        assert len(data["red_flags"]) == 0
