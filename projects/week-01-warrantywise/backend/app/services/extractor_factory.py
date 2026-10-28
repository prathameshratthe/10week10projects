from app.core.config import get_settings
from app.services.extractor_interface import BaseExtractor
from app.services.gemini_extractor import GeminiExtractor
from app.services.mock_extractor import HeuristicRuleExtractor
from app.services.openai_extractor import OpenAIExtractor

settings = get_settings()


def get_extractor() -> BaseExtractor:
    provider = settings.AI_PROVIDER.lower().strip()
    fallback = HeuristicRuleExtractor()

    if provider == "gemini":
        return GeminiExtractor(fallback_extractor=fallback)
    elif provider == "openai":
        return OpenAIExtractor(fallback_extractor=fallback)
    else:
        return fallback
