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
    assert response.json()["service"] == "SchemeSathi"


def test_evaluate_eligible_small_farmer():
    payload = {
        "name": "Ramesh Patil",
        "age": 42,
        "gender": "MALE",
        "state": "Maharashtra",
        "annual_income_inr": 120000,
        "occupation": "FARMER",
        "landholding_acres": 2.5,
        "owns_pucca_house": False,
        "has_girl_child_under_10": False,
        "is_income_tax_payer": False
    }
    response = client.post("/api/v1/schemes/evaluate", json=payload)
    assert response.status_code == 200
    data = response.json()
    eligible_codes = [s["scheme_code"] for s in data["eligible_schemes"]]
    assert "PM_KISAN" in eligible_codes
    assert "AYUSHMAN_BHARAT" in eligible_codes
    assert "PM_AWAS" in eligible_codes
    assert data["total_potential_benefit_inr"] > 600000


def test_evaluate_disqualified_taxpayer():
    payload = {
        "name": "Vikram Singh",
        "age": 38,
        "gender": "MALE",
        "state": "Delhi",
        "annual_income_inr": 1800000,
        "occupation": "SALARIED_PRIVATE",
        "landholding_acres": 0.0,
        "owns_pucca_house": True,
        "has_girl_child_under_10": False,
        "is_income_tax_payer": True
    }
    response = client.post("/api/v1/schemes/evaluate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["eligible_schemes"]) == 0
    assert len(data["ineligible_schemes"]) == 6
    assert data["abstention_count"] == 6
