import os
import io
import uuid
from pathlib import Path
from typing import Optional, Tuple
from fastapi import HTTPException, UploadFile
from PIL import Image
import pypdf
from app.core.config import get_settings

settings = get_settings()

ALLOWED_MIME_TYPES = {
    "application/pdf": ".pdf",
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "text/plain": ".txt",
}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


class FileProcessor:
    @staticmethod
    def ensure_upload_dir() -> Path:
        upload_path = Path(settings.UPLOAD_DIR)
        upload_path.mkdir(parents=True, exist_ok=True)
        return upload_path

    @classmethod
    async def process_and_save_upload(
        cls, file: UploadFile
    ) -> Tuple[str, bytes, str, Optional[str]]:
        """
        Validates, saves the uploaded receipt file, and extracts raw text if PDF.
        Returns: (saved_filename, raw_bytes, mime_type, extracted_text)
        """
        content_type = file.content_type or ""
        if content_type not in ALLOWED_MIME_TYPES:
            # Fallback by filename extension
            ext = Path(file.filename or "").suffix.lower()
            matching = [mime for mime, e in ALLOWED_MIME_TYPES.items() if e == ext]
            if matching:
                content_type = matching[0]
            else:
                raise HTTPException(
                    status_code=400,
                    detail=f"Unsupported file type '{content_type}'. Allowed: PDF, JPG, PNG, WEBP."
                )

        raw_bytes = await file.read()
        if len(raw_bytes) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File exceeds maximum size limit of {MAX_FILE_SIZE // (1024 * 1024)} MB."
            )

        upload_dir = cls.ensure_upload_dir()
        unique_name = f"{uuid.uuid4().hex}_{Path(file.filename or 'receipt').name}"
        save_path = upload_dir / unique_name
        with open(save_path, "wb") as f:
            f.write(raw_bytes)

        extracted_text = None
        if content_type == "application/pdf":
            try:
                reader = pypdf.PdfReader(io.BytesIO(raw_bytes))
                text_pages = [page.extract_text() or "" for page in reader.pages]
                extracted_text = "\n".join(text_pages).strip()
            except Exception as e:
                extracted_text = f"[PDF Text Extraction Warning: {str(e)}]"

        return unique_name, raw_bytes, content_type, extracted_text
