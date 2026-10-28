import pytest
from pydantic import ValidationError
from app.models.schemas import LineItemSchema, PurchaseRecordCreate, ReceiptExtractionResult


def test_line_item_schema_valid():
    item = LineItemSchema(name="Sony WH-1000XM5 Headphones", quantity=1, unit_price=399.99, total_price=399.99)
    assert item.name == "Sony WH-1000XM5 Headphones"
    assert item.quantity == 1
    assert item.total_price == 399.99


def test_line_item_schema_invalid_quantity():
    with pytest.raises(ValidationError):
        LineItemSchema(name="Test Item", quantity=0)


def test_purchase_record_create_date_validation():
    # Valid date
    record = PurchaseRecordCreate(
        merchant_name="Apple Store",
        purchase_date="2026-05-15",
        total_amount=1299.00,
        currency="USD",
        category="Electronics",
    )
    assert record.purchase_date == "2026-05-15"

    # Invalid date format
    with pytest.raises(ValidationError):
        PurchaseRecordCreate(
            merchant_name="Apple Store",
            purchase_date="15-05-2026",
            total_amount=1299.00,
        )


def test_purchase_record_negative_amount():
    with pytest.raises(ValidationError):
        PurchaseRecordCreate(
            merchant_name="Best Buy",
            purchase_date="2026-01-10",
            total_amount=-50.00,
        )


def test_receipt_extraction_result_defaults():
    res = ReceiptExtractionResult(merchant_name="Croma Electronics")
    assert res.has_explicit_warranty is False
    assert res.has_explicit_return_policy is False
    assert res.warranty_duration_months is None
    assert res.return_window_days is None
