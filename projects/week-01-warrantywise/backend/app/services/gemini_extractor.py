import base64
import json
import logging
from typing import Optional
from google import genai
from google.genai import types
from app.core.config import get_settings
from app.models.schemas import LineItemSchema, ReceiptExtractionResult
from app.services.extractor_interface import BaseExtractor
from app.services.mock_extractor import HeuristicRuleExtractor

logger = logging.getLogger(__name__)
settings = get_settings()

EXTRACTION_SYSTEM_INSTRUCTION = """
You are an expert financial and document intelligence AI specializing in receipt, invoice, and warranty analysis.
Analyze the provided receipt image/document and extract key purchase details with maximum precision.

CRITICAL RULES:
1. 'has_explicit_warranty': Must be TRUE ONLY if the receipt EXPLICITLY states a warranty duration (e.g., '1 year warranty', '24 months manufacturer warranty'). If no warranty is explicitly written, set to FALSE and leave warranty_duration_months and warranty_end_date NULL. NEVER hallucinate or assume a standard warranty.
2. 'has_explicit_return_policy': Must be TRUE ONLY if the receipt EXPLICITLY mentions a return window (e.g. '30-day return policy', 'Return within 14 days'). If not mentioned, set to FALSE.
3. 'purchase_date': Format strictly as YYYY-MM-DD.
4. 'total_amount': Extract the grand total / amount paid as a clean float.
5. 'currency': ISO code or symbol (USD, INR, EUR, GBP, etc.).
6. 'items': List individual items with item name, quantity, unit price, and total price.
"""


class GeminiExtractor(BaseExtractor):
    def __init__(self, fallback_extractor: Optional[BaseExtractor] = None):
        self.fallback = fallback_extractor or HeuristicRuleExtractor()
        self.client = None
        if settings.GEMINI_API_KEY:
            try:
                self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
            except Exception as e:
                logger.warning(f"Failed to initialize Gemini Client: {e}")

    async def extract(
        self,
        file_bytes: bytes,
        filename: str,
        mime_type: str,
        extracted_text: Optional[str] = None
    ) -> ReceiptExtractionResult:
        if not self.client or not settings.GEMINI_API_KEY:
            logger.info("GEMINI_API_KEY not configured. Using heuristic rule extractor.")
            return await self.fallback.extract(file_bytes, filename, mime_type, extracted_text)

        try:
            # Prepare contents
            contents = []
            if mime_type.startswith("image/"):
                contents.append(types.Part.from_bytes(data=file_bytes, mime_type=mime_type))
            elif mime_type == "application/pdf":
                # If PDF, pass as document part or extracted text
                if extracted_text:
                    contents.append(f"Receipt Document Text:\n{extracted_text}")
                else:
                    contents.append(types.Part.from_bytes(data=file_bytes, mime_type="application/pdf"))
            else:
                contents.append(f"Receipt Document Content:\n{extracted_text or file_bytes.decode('utf-8', errors='ignore')}")

            contents.append("Extract all receipt details and explicit warranty/return terms following the schema strictly.")

            response = self.client.models.generate_content(
                model="gemini-2.0-flash",
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=EXTRACTION_SYSTEM_INSTRUCTION,
                    response_mime_type="application/json",
                    response_schema=ReceiptExtractionResult,
                    temperature=0.1,
                ),
            )

            if response.text:
                data = json.loads(response.text)
                result = ReceiptExtractionResult(**data)
                result.extraction_method = "gemini-2.0-flash"
                result.raw_text = extracted_text
                return result
            else:
                logger.warning("Empty response from Gemini. Falling back.")
                return await self.fallback.extract(file_bytes, filename, mime_type, extracted_text)

        except Exception as e:
            logger.error(f"Error in Gemini extraction: {e}. Falling back to heuristic extractor.")
            return await self.fallback.extract(file_bytes, filename, mime_type, extracted_text)
