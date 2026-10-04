from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class DocumentChunkResponse(BaseModel):
    id: str
    chunk_index: int
    content: str
    page_number: int

    class Config:
        from_attributes = True


class DocumentResponse(BaseModel):
    id: str
    user_id: str
    course_id: Optional[str] = None
    title: str
    filename: str
    file_type: str
    file_size_bytes: int
    summary: Optional[str] = None
    chunk_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True


class SourceCitation(BaseModel):
    document_title: str
    document_id: str
    page_number: int
    excerpt: str
    similarity_score: float


class RAGQueryRequest(BaseModel):
    query: str
    course_id: Optional[str] = None
    top_k: int = 4


class RAGQueryResponse(BaseModel):
    query: str
    answer: str
    citations: List[SourceCitation]
    is_grounded: bool = True
    ai_provider: str
