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
    assert response.json()["service"] == "BillMatch"


def test_reconcile_tds_deduction():
    payload = {
        "invoices": [
            {
                "invoice_no": "INV-2026-101",
                "vendor_name": "Apex Cloud Infotech Pvt Ltd",
                "invoice_date": "2026-10-01",
                "gross_amount": 100000.0,
                "tds_rate_pct": 10.0,
                "expected_net_payable": 90000.0
            }
        ],
        "transactions": [
            {
                "txn_id": "TXN-8801",
                "txn_date": "2026-10-02",
                "narration": "NEFT/CMS/APEX CLD/HDFC0001/INV-2026-101",
                "debit_amount": 90000.0,
                "reference_utr": "HDFCN26275001"
            }
        ]
    }
    response = client.post("/api/v1/reconcile/", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["matched_count"] == 1
    assert data["reconciliation_rate_pct"] == 100.0
    match = data["matches"][0]
    assert match["match_status"] == "MATCHED_TDS"
    assert match["tds_deducted"] == 10000.0


def test_unmatched_phantom_debit():
    payload = {
        "invoices": [],
        "transactions": [
            {
                "txn_id": "TXN-9999",
                "txn_date": "2026-10-28",
                "narration": "BANK SERVICE CHARGE",
                "debit_amount": 500.0
            }
        ]
    }
    response = client.post("/api/v1/reconcile/", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["unmatched_txns_count"] == 1
    assert data["matches"][0]["match_status"] == "UNMATCHED_BANK_TXN"
