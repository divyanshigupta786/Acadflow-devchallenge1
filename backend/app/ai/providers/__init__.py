import logging
from app.config import settings
from app.ai.providers.base import BaseLLMProvider
from app.ai.providers.ollama import OllamaProvider
from app.ai.providers.fallback import DeterministicFallbackProvider

logger = logging.getLogger(__name__)


async def get_llm_provider() -> BaseLLMProvider:
    """
    Returns configured LLM provider. Checks if Ollama is responsive;
    if unavailable, returns the deterministic fallback provider.
    """
    if settings.LLM_PROVIDER.lower() == "ollama":
        provider = OllamaProvider()
        if await provider.is_available():
            return provider
        logger.info("Ollama is not running at configured URL. Using DeterministicFallbackProvider.")
        return DeterministicFallbackProvider()

    return DeterministicFallbackProvider()
