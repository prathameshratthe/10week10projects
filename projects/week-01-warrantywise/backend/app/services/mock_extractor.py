import re
from datetime import datetime, timedelta
from typing import List, Optional, Tuple
from app.models.schemas import LineItemSchema, ReceiptExtractionResult
from app.services.extractor_interface import BaseExtractor


class HeuristicRuleExtractor(BaseExtractor):
    """
    High-fidelity deterministic & heuristic extractor for receipts.
    Extracts structured data from raw OCR/PDF text, or falls back to synthetic receipt patterns.
    Guarantees strict zero-fabrication: explicit warranty/return flags are ONLY true if textual evidence exists.
    """

    MONTH_MAP = {
        "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
        "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12,
        "january": 1, "february": 2, "march": 3, "april": 4, "june": 6,
        "july": 7, "august": 8, "september": 9, "october": 10, "november": 11, "december": 12
    }

    async def extract(
        self,
        file_bytes: bytes,
        filename: str,
        mime_type: str,
        extracted_text: Optional[str] = None
    ) -> ReceiptExtractionResult:
        text = extracted_text or ""
        if not text:
            # If no raw text (e.g. image without external OCR), attempt utf-8 decode or fallback sample
            try:
                text = file_bytes.decode("utf-8", errors="ignore")
            except Exception:
                text = ""

        # Normalize text
        lines = [line.strip() for line in text.split("\n") if line.strip()]

        merchant_name = self._extract_merchant(lines, filename)
        purchase_date = self._extract_date(text)
        currency, total_amount = self._extract_total(text)
        tax_amount = self._extract_tax(text)
        invoice_number = self._extract_invoice_number(text)
        payment_method = self._extract_payment_method(text)
        items = self._extract_items(lines)

        # Warranty extraction
        has_warranty, duration_months, warranty_notes = self._extract_warranty(text)
        warranty_end_date = None
        if has_warranty and purchase_date and duration_months:
            warranty_end_date = self._calculate_end_date(purchase_date, months=duration_months)

        # Return policy extraction
        has_return, return_days, return_notes = self._extract_return_policy(text)
        return_deadline = None
        if has_return and purchase_date and return_days:
            return_deadline = self._calculate_end_date(purchase_date, days=return_days)

        return ReceiptExtractionResult(
            merchant_name=merchant_name,
            purchase_date=purchase_date,
            total_amount=total_amount,
            tax_amount=tax_amount,
            currency=currency,
            invoice_number=invoice_number,
            payment_method=payment_method,
            items=items,
            has_explicit_warranty=has_warranty,
            warranty_duration_months=duration_months,
            warranty_end_date=warranty_end_date,
            warranty_notes=warranty_notes,
            has_explicit_return_policy=has_return,
            return_window_days=return_days,
            return_deadline=return_deadline,
            return_notes=return_notes,
            confidence_score=0.92 if (merchant_name and purchase_date and total_amount) else 0.70,
            extraction_method="heuristic_rules",
            raw_text=text[:2000] if text else None
        )

    def _extract_merchant(self, lines: List[str], filename: str) -> str:
        # First non-trivial line usually represents merchant
        for line in lines[:5]:
            clean = re.sub(r"[^\w\s&.,'#\-]", "", line).strip()
            if len(clean) >= 3 and not re.search(r"(receipt|invoice|tax|bill|date|order|cashier)", clean, re.I):
                return clean
        # Fallback to sanitized filename
        base = filename.rsplit(".", 1)[0]
        cleaned_base = re.sub(r"[_\-]+", " ", base).title()
        return cleaned_base or "Store Merchant"

    def _extract_date(self, text: str) -> Optional[str]:
        # YYYY-MM-DD
        m = re.search(r"\b(20\d{2})[-/.](0[1-9]|1[0-2])[-/.](0[1-9]|[12]\d|3[01])\b", text)
        if m:
            return f"{m.group(1)}-{m.group(2)}-{m.group(3)}"

        # DD/MM/YYYY or DD-MM-YYYY
        m = re.search(r"\b(0[1-9]|[12]\d|3[01])[-/.](0[1-9]|1[0-2])[-/.](20\d{2})\b", text)
        if m:
            return f"{m.group(3)}-{m.group(2)}-{m.group(1)}"

        # Month DD, YYYY or DD Month YYYY
        m = re.search(r"\b([A-Za-z]{3,9})\s+([0-3]?\d)(?:st|nd|rd|th)?,?\s+(20\d{2})\b", text)
        if m:
            month_str = m.group(1).lower()
            month_num = self.MONTH_MAP.get(month_str, self.MONTH_MAP.get(month_str[:3], 1))
            day_num = int(m.group(2))
            return f"{m.group(3)}-{month_num:02d}-{day_num:02d}"

        # DD Month YYYY
        m = re.search(r"\b([0-3]?\d)\s+([A-Za-z]{3,9})\s+(20\d{2})\b", text)
        if m:
            month_str = m.group(2).lower()
            month_num = self.MONTH_MAP.get(month_str, self.MONTH_MAP.get(month_str[:3], 1))
            day_num = int(m.group(1))
            return f"{m.group(3)}-{month_num:02d}-{day_num:02d}"

        return None

    def _extract_total(self, text: str) -> Tuple[str, Optional[float]]:
        currency = "USD"
        if "₹" in text or "INR" in text or "Rs." in text or "Rs " in text:
            currency = "INR"
        elif "€" in text or "EUR" in text:
            currency = "EUR"
        elif "£" in text or "GBP" in text:
            currency = "GBP"

        # Search for Total patterns
        patterns = [
            r"(?:grand\s+total|total\s+amount|net\s+total|total\s+due|amount\s+paid|total)\s*[:=]?\s*(?:[\$₹€£]|INR|USD|EUR)?\s*([0-9,]+\.[0-9]{2})",
            r"(?:[\$₹€£]|INR|USD|EUR)\s*([0-9,]+\.[0-9]{2})\s*(?:total)?",
            r"\b([0-9,]+\.[0-9]{2})\s*(?:total)\b"
        ]
        for pattern in patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                try:
                    val_str = matches[-1].replace(",", "")
                    val = float(val_str)
                    if val > 0:
                        return currency, val
                except ValueError:
                    continue

        return currency, None

    def _extract_tax(self, text: str) -> Optional[float]:
        m = re.search(r"(?:tax|gst|vat|sales\s+tax)\s*[:=]?\s*(?:[\$₹€£]|INR|USD|EUR)?\s*([0-9,]+\.[0-9]{2})", text, re.I)
        if m:
            try:
                return float(m.group(1).replace(",", ""))
            except ValueError:
                pass
        return None

    def _extract_invoice_number(self, text: str) -> Optional[str]:
        m = re.search(r"(?:invoice|receipt|bill|order|txn)\s*(?:#|no\.?|id|num)?\s*[:=]?\s*([A-Za-z0-9\-_/]{4,25})", text, re.I)
        if m:
            return m.group(1).strip()
        return None

    def _extract_payment_method(self, text: str) -> Optional[str]:
        for method in ["UPI", "Credit Card", "Debit Card", "Visa", "MasterCard", "Amex", "Cash", "Net Banking", "Apple Pay", "Google Pay"]:
            if re.search(rf"\b{re.escape(method)}\b", text, re.I):
                return method
        return None

    def _extract_items(self, lines: List[str]) -> List[LineItemSchema]:
        items: List[LineItemSchema] = []
        for line in lines:
            # Pattern matching item name followed by price e.g. "Wireless Mouse   1   24.99" or "Item name ... $25.00"
            m = re.search(r"^([A-Za-z0-9\s\-_/()&]{3,40})\s+(\d+)?\s*(?:[\$₹€£])?\s*([0-9,]+\.[0-9]{2})$", line)
            if m:
                name = m.group(1).strip()
                # Skip summary lines
                if re.search(r"(total|subtotal|tax|discount|change|balance|cash)", name, re.I):
                    continue
                qty = int(m.group(2)) if m.group(2) else 1
                price = float(m.group(3).replace(",", ""))
                items.append(LineItemSchema(
                    name=name,
                    quantity=qty,
                    total_price=price,
                    unit_price=round(price / qty, 2)
                ))
        return items

    def _extract_warranty(self, text: str) -> Tuple[bool, Optional[int], Optional[str]]:
        # Look for explicit warranty patterns
        patterns = [
            (r"\b(\d+)\s*(?:years?|yrs?)(?:\s+[\w\-]+){0,3}\s+warranty\b", 12),
            (r"\bwarranty\s*[:=]?\s*(\d+)\s*(?:years?|yrs?)\b", 12),
            (r"\b(\d+)\s*(?:months?|mos?)(?:\s+[\w\-]+){0,3}\s+warranty\b", 1),
            (r"\bwarranty\s*[:=]?\s*(\d+)\s*(?:months?|mos?)\b", 1),
            (r"\b(one|two|three|five)\s+year(?:s)?(?:\s+[\w\-]+){0,3}\s+warranty\b", 12),
            (r"\bmanufacturer\s+warranty\s*[:=]?\s*(\d+)\s*(?:years?|yrs?)\b", 12),
        ]

        word_map = {"one": 1, "two": 2, "three": 3, "five": 5}

        for pattern, multiplier in patterns:
            m = re.search(pattern, text, re.IGNORECASE)
            if m:
                raw_num = m.group(1).lower()
                num = word_map.get(raw_num, None)
                if num is None:
                    try:
                        num = int(raw_num)
                    except ValueError:
                        continue
                duration_months = num * multiplier
                notes = m.group(0).strip()
                return True, duration_months, notes

        # Generic warranty statement check
        if re.search(r"\bstandard\s+1\s*year\s+warranty\b", text, re.I):
            return True, 12, "Standard 1 year warranty"

        return False, None, None

    def _extract_return_policy(self, text: str) -> Tuple[bool, Optional[int], Optional[str]]:
        # Look for return policy patterns
        patterns = [
            r"\b(\d+)\s*(?:day|days)\s+(?:return|exchange|replacement|money[- ]back)\s+(?:policy|guarantee|window)\b",
            r"(?:returns?|exchange)\s+(?:window|policy|accepted\s+within)\s*[:=]?\s*(\d+)\s*(?:day|days)\b",
            r"\breturns?\s+(?:accepted\s+)?(?:within|valid\s+for)\s+(\d+)\s+days\b",
            r"\b(\d+)[- ]day\s+returns?\b"
        ]

        for pattern in patterns:
            m = re.search(pattern, text, re.IGNORECASE)
            if m:
                days = int(m.group(1))
                return True, days, m.group(0).strip()

        return False, None, None

    def _calculate_end_date(self, start_date_str: str, months: int = 0, days: int = 0) -> Optional[str]:
        try:
            start_dt = datetime.strptime(start_date_str, "%Y-%m-%d")
            if days > 0:
                end_dt = start_dt + timedelta(days=days)
            elif months > 0:
                # Approximate month addition safely
                year = start_dt.year + (start_dt.month + months - 1) // 12
                month = (start_dt.month + months - 1) % 12 + 1
                day = min(start_dt.day, 28)  # safe day clamp
                end_dt = datetime(year, month, day)
            else:
                end_dt = start_dt
            return end_dt.strftime("%Y-%m-%d")
        except Exception:
            return None
