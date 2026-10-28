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
    assert response.json()["service"] == "PackCheck"


def test_verify_approved_vendor():
    payload = {
        "vendor_registered_name": "Apex Cloud Infotech Pvt Ltd",
        "vendor_pan": "AAACA1234F",
        "vendor_gstin": "27AAACA1234F1Z5",
        "bank_account_holder": "Apex Cloud Infotech Pvt Ltd",
        "bank_ifsc": "HDFC0001234",
        "documents": [
            {
                "doc_type": "GST_CERTIFICATE",
                "document_name": "GST Certificate",
                "status": "PRESENT_VERIFIED",
                "extracted_identifier": "27AAACA1234F1Z5",
                "findings": "Active GSTIN."
            },
            {
                "doc_type": "PAN_CARD",
                "document_name": "PAN Card",
                "status": "PRESENT_VERIFIED",
                "extracted_identifier": "AAACA1234F",
                "findings": "Matched PAN."
            },
            {
                "doc_type": "BANK_CHEQUE",
                "document_name": "Bank Cheque",
                "status": "PRESENT_VERIFIED",
                "findings": "Account matching."
            }
        ]
    }
    response = client.post("/api/v1/verify/dossier", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["verdict"] == "APPROVED"
    assert data["compliance_score"] == 100.0
    assert len(data["red_flags"]) == 0


def test_verify_pan_mismatch_fraud():
    payload = {
        "vendor_registered_name": "Zenith Steel Traders",
        "vendor_pan": "ABCDE9999Z",
        "vendor_gstin": "27AAAAA1111A1Z1",
        "bank_account_holder": "Zenith Steel Traders",
        "documents": [
            {
                "doc_type": "GST_CERTIFICATE",
                "document_name": "GST Certificate",
                "status": "PRESENT_VERIFIED",
                "extracted_identifier": "27AAAAA1111A1Z1",
                "findings": "Different PAN in GSTIN."
            },
            {
                "doc_type": "PAN_CARD",
                "document_name": "PAN Card",
                "status": "PRESENT_VERIFIED",
                "extracted_identifier": "ABCDE9999Z",
                "findings": "Standalone PAN."
            },
            {
                "doc_type": "BANK_CHEQUE",
                "document_name": "Cancelled Cheque",
                "status": "PRESENT_VERIFIED",
                "findings": "Cheque submitted."
            }
        ]
    }
    response = client.post("/api/v1/verify/dossier", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["verdict"] == "REJECTED"
    assert any("Critical Entity Mismatch" in f for f in data["red_flags"])
