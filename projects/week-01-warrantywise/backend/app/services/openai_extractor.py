import base64
import json
import logging
from typing import Optional
from openai import AsyncOpenAI
from app.core.config import get_settings
from app.models.schemas import ReceiptExtractionResult
from app.services.extractor_interface import BaseExtractor
from app.services.mock_extractor import HeuristicRuleExtractor

logger = logging.getLogger(__name__)
settings = get_settings()


class OpenAIExtractor(BaseExtractor):
    def __init__(self, fallback_extractor: Optional[BaseExtractor] = None):
        self.fallback = fallback_extractor or HeuristicRuleExtractor()
        self.client = None
        if settings.OPENAI_API_KEY:
            try:
                self.client = AsyncOpenAI(
                    api_key=settings.OPENAI_API_KEY,
                    base_url=settings.OPENAI_BASE_URL
                )
            except Exception as e:
                logger.warning(f"Failed to initialize OpenAI Client: {e}")

    async def extract(
        self,
        file_bytes: bytes,
        filename: str,
        mime_type: str,
        extracted_text: Optional[str] = None
    ) -> ReceiptExtractionResult:
        if not self.client or not settings.OPENAI_API_KEY:
            return await self.fallback.extract(file_bytes, filename, mime_type, extracted_text)

        try:
            messages = [
                {
                    "role": "system",
                    "content": (
                        "You are an expert receipt & warranty analyzer. Extract structured receipt details. "
                        "CRITICAL: Set 'has_explicit_warranty' to true ONLY if warranty is explicitly stated in words. "
                        "Set 'has_explicit_return_policy' to true ONLY if return days are explicitly stated. "
                        "Output valid JSON conforming to the requested schema."
                    )
                }
            ]

            user_content = []
            if mime_type.startswith("image/"):
                b64 = base64.b64encode(file_bytes).decode("utf-8")
                user_content.append({
                    "type": "image_url",
                    "image_url": {"url": f"data:{mime_type};base64,{b64}"}
                })
                user_content.append({"type": "text", "text": "Extract all fields from this receipt image."})
            else:
                text_to_analyze = extracted_text or file_bytes.decode("utf-8", errors="ignore")
                user_content.append({
                    "type": "text",
                    "text": f"Extract fields from receipt document:\n{text_to_analyze}"
                })

            messages.append({"role": "user", "content": user_content})

            response = await self.client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=messages,
                response_format={"type": "json_object"},
                temperature=0.1
            )

            content = response.choices[0].message.content
            if content:
                data = json.loads(content)
                result = ReceiptExtractionResult(**data)
                result.extraction_method = f"openai-{settings.OPENAI_MODEL}"
                result.raw_text = extracted_text
                return result
            else:
                return await self.fallback.extract(file_bytes, filename, mime_type, extracted_text)

        except Exception as e:
            logger.error(f"OpenAI extraction failed: {e}. Falling back.")
            return await self.fallback.extract(file_bytes, filename, mime_type, extracted_text)
