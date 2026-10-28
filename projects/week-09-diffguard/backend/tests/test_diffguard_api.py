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
    assert response.json()["service"] == "DiffGuard"


def test_database_migration_risk():
    payload = {
        "pr_title": "db: drop users table column",
        "git_diff": "diff --git a/alembic/versions/004.py b/alembic/versions/004.py\n+ op.drop_column('users', 'user_phone')",
        "changed_files": ["alembic/versions/004.py"]
    }
    response = client.post("/api/v1/analyze/", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["risk_level"] == "CRITICAL"
    assert data["breaking_change_detected"] is True
    assert data["primary_change_type"] == "DATABASE_MIGRATION"
    assert "tests/test_database_migrations.py" in data["recommended_test_files"]


def test_documentation_only_change():
    payload = {
        "pr_title": "docs: update readme with setup notes",
        "git_diff": "diff --git a/README.md b/README.md\n+ # Setup Notes",
        "changed_files": ["README.md"]
    }
    response = client.post("/api/v1/analyze/", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["risk_level"] == "LOW"
    assert data["breaking_change_detected"] is False
    assert data["recommended_test_count"] == 0
    assert data["ci_time_saved_pct"] == 100.0
