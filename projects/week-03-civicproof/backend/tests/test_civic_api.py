import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
    assert response.json()["service"] == "CivicProof"


def test_analyze_urgent_manhole():
    payload = {
        "description": "Massive open manhole cover missing on footpath, very dangerous for pedestrians",
        "location_address": "Indiranagar 100ft Road, Bangalore"
    }
    response = client.post("/api/v1/reports/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["category"] == "OPEN_MANHOLE"
    assert data["severity"] == "CRITICAL"
    assert data["department"] == "Stormwater Drainage & Disaster Safety"
    assert data["is_duplicate"] is True  # Seed DB has #102 at Indiranagar 100ft Road


def test_create_and_fetch_report():
    create_payload = {
        "category": "FALLEN_TREE",
        "department": "Horticulture & Emergency Clearance",
        "severity": "HIGH",
        "actionable_title": "Fallen Tree Blocking Road",
        "description": "Fallen banyan tree blocking road after thunderstorm",
        "location_address": "Koregaon Park Lane 4, Pune",
        "reporter_name": "Rohan Deshmukh",
        "reporter_phone": "+91 98765 43210"
    }
    create_res = client.post("/api/v1/reports/", json=create_payload)
    assert create_res.status_code == 201
    report = create_res.json()
    assert report["category"] == "FALLEN_TREE"
    assert report["status"] == "OPEN"
    assert report["ticket_id"].startswith("CIVIC-")

    # Fetch all reports
    list_res = client.get("/api/v1/reports/")
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 4
