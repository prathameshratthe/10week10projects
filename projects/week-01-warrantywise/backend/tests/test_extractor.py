import pytest
from app.services.mock_extractor import HeuristicRuleExtractor


@pytest.mark.asyncio
async def test_extractor_with_explicit_warranty():
    sample_text = """
    BEST BUY #481
    123 Tech Boulevard, San Jose, CA
    Date: 2026-03-15
    Invoice #: BB-994821

    Dell XPS 15 Laptop   1   $1,499.00
    Logitech MX Master   1   $99.00

    Subtotal: $1,598.00
    Tax: $143.82
    Total: $1,741.82
    Payment: Credit Card

    * 2 Years Manufacturer Limited Warranty Included *
    * 30-day return policy with original packaging *
    """
    extractor = HeuristicRuleExtractor()
    result = await extractor.extract(
        file_bytes=sample_text.encode("utf-8"),
        filename="best_buy_receipt.txt",
        mime_type="text/plain",
        extracted_text=sample_text,
    )

    assert result.merchant_name == "BEST BUY #481"
    assert result.purchase_date == "2026-03-15"
    assert result.total_amount == 1741.82
    assert result.currency == "USD"
    assert result.has_explicit_warranty is True
    assert result.warranty_duration_months == 24
    assert result.warranty_end_date == "2028-03-15"
    assert result.has_explicit_return_policy is True
    assert result.return_window_days == 30
    assert result.return_deadline == "2026-04-14"


@pytest.mark.asyncio
async def test_extractor_without_warranty_no_hallucination():
    sample_text = """
    WHOLE FOODS MARKET
    Date: 2026-04-02
    Order ID: WF-10492

    Organic Milk        $4.50
    Fresh Bread         $3.20
    Avocados 4pk        $5.99

    Total: $13.69
    Payment: Apple Pay
    Thank you for shopping organic!
    """
    extractor = HeuristicRuleExtractor()
    result = await extractor.extract(
        file_bytes=sample_text.encode("utf-8"),
        filename="grocery_receipt.txt",
        mime_type="text/plain",
        extracted_text=sample_text,
    )

    assert result.merchant_name == "WHOLE FOODS MARKET"
    assert result.purchase_date == "2026-04-02"
    assert result.total_amount == 13.69
    assert result.has_explicit_warranty is False
    assert result.warranty_duration_months is None
    assert result.warranty_end_date is None
    assert result.has_explicit_return_policy is False


@pytest.mark.asyncio
async def test_extractor_inr_receipt():
    sample_text = """
    CROMA ELECTRONICS
    Phoenix Marketcity, Pune
    Date: 12/08/2026
    Invoice No: CR-772910

    Samsung 55 Inch 4K QLED TV   1   Rs. 64,990.00
    Installation & Demo          1   Rs. 0.00

    Grand Total: ₹64,990.00
    Payment Method: UPI / GPay

    Warranty: 1 Year Manufacturer Warranty on Product
    Panel Warranty: 2 Years
    Returns accepted within 7 days for defective units
    """
    extractor = HeuristicRuleExtractor()
    result = await extractor.extract(
        file_bytes=sample_text.encode("utf-8"),
        filename="croma_tv_receipt.txt",
        mime_type="text/plain",
        extracted_text=sample_text,
    )

    assert result.merchant_name == "CROMA ELECTRONICS"
    assert result.purchase_date == "2026-08-12"
    assert result.total_amount == 64990.00
    assert result.currency == "INR"
    assert result.has_explicit_warranty is True
    assert result.warranty_duration_months == 12
    assert result.has_explicit_return_policy is True
    assert result.return_window_days == 7
