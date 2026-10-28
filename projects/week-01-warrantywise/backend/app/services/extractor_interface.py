from abc import ABC, abstractmethod
from typing import Optional
from app.models.schemas import ReceiptExtractionResult


class BaseExtractor(ABC):
    @abstractmethod
    async def extract(
        self,
        file_bytes: bytes,
        filename: str,
        mime_type: str,
        extracted_text: Optional[str] = None
    ) -> ReceiptExtractionResult:
        """
        Extracts structured purchase details and explicit warranty/return information
        from the given receipt bytes or pre-extracted text.
        """
        pass
