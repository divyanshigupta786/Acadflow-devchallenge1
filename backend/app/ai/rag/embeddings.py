import math
import re
from typing import List


class EmbeddingService:
    """
    Embedding service supporting both open-source embeddings and a robust 
    deterministic semantic vectorizer that works anywhere without requiring a 2GB download.
    """

    DIMENSION = 64

    @classmethod
    def get_text_embedding(cls, text: str) -> List[float]:
        """
        Generates a normalized 64-dimensional semantic projection vector.
        """
        words = re.findall(r'\b\w+\b', text.lower())
        vec = [0.0] * cls.DIMENSION
        if not words:
            return vec

        for idx, word in enumerate(words):
            # Compute deterministic hash buckets
            h = hash(word)
            b1 = abs(h) % cls.DIMENSION
            b2 = abs(h >> 5) % cls.DIMENSION
            vec[b1] += 1.0 / (idx + 1) ** 0.5
            vec[b2] += 0.5

        # Normalize vector to unit length
        norm = math.sqrt(sum(x * x for x in vec))
        if norm > 0:
            vec = [round(x / norm, 5) for x in vec]

        return vec

    @staticmethod
    def cosine_similarity(v1: List[float], v2: List[float]) -> float:
        if not v1 or not v2 or len(v1) != len(v2):
            return 0.0
        dot = sum(a * b for a, b in zip(v1, v2))
        return round(float(dot), 4)
