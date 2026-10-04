from abc import ABC, abstractmethod
from typing import Dict, Any, Optional


class BaseLLMProvider(ABC):
    @abstractmethod
    async def generate_text(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        """Generates plain text response."""
        pass

    @abstractmethod
    async def generate_json(self, prompt: str, schema: Optional[Dict[str, Any]] = None, system_prompt: Optional[str] = None) -> Dict[str, Any]:
        """Generates structured JSON response conforming to a schema."""
        pass

    @abstractmethod
    async def is_available(self) -> bool:
        """Health check for provider availability."""
        pass
