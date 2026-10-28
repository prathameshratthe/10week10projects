import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
    assert response.json()["service"] == "Voice2WorkOrder"


def test_process_hvac_hinglish_voice_note():
    payload = {
        "raw_transcript": "Sharma ji ke flat pe gaya tha Kothrud mein. AC cooling nahi kar raha tha. Run capacitor 45 MFD jal gaya tha. Naya capacitor lagaya. Dedh ghanta laga.",
        "technician_name": "Ramesh Kumar"
    }
    response = client.post("/api/v1/workorders/process", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["trade"] == "HVAC"
    assert data["labor_hours"] == 1.5
    assert len(data["parts_used"]) == 1
    assert data["parts_used"][0]["name"] == "Run Capacitor 45 MFD"
    assert data["priority"] == "HIGH"
    assert data["total_billable_inr"] > 1000


def test_process_emergency_plumbing_note():
    payload = {
        "raw_transcript": "Emergency call tha Andheri West mein Patil sir ke bungalow pe. Main brass ball valve leak kar raha tha. Flooding ho rahi thi. Dhai ghante lag gaye."
    }
    response = client.post("/api/v1/workorders/process", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["trade"] == "PLUMBING"
    assert data["labor_hours"] == 2.5
    assert data["priority"] == "EMERGENCY"
    assert data["total_parts_cost_inr"] == 320.0
