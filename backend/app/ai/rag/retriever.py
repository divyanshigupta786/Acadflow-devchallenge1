from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from app.models.document import Document, DocumentChunk
from app.ai.rag.embeddings import EmbeddingService
from app.ai.providers import get_llm_provider
from app.schemas.document import SourceCitation, RAGQueryResponse


class RAGRetriever:
    @staticmethod
    def chunk_text(text: str, chunk_size: int = 500, chunk_overlap: int = 75) -> List[str]:
        chunks = []
        start = 0
        text_len = len(text)
        while start < text_len:
            end = min(start + chunk_size, text_len)
            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)
            if end >= text_len:
                break
            start += chunk_size - chunk_overlap
        return chunks

    @classmethod
    async def query_knowledge_base(
        cls,
        db: Session,
        user_id: str,
        query: str,
        course_id: Optional[str] = None,
        top_k: int = 4
    ) -> RAGQueryResponse:
        query_vec = EmbeddingService.get_text_embedding(query)

        # Fetch candidate chunks for the user
        chunk_query = (
            db.query(DocumentChunk, Document)
            .join(Document, DocumentChunk.document_id == Document.id)
            .filter(Document.user_id == user_id)
        )
        if course_id:
            chunk_query = chunk_query.filter(Document.course_id == course_id)

        candidates = chunk_query.all()

        scored = []
        for chunk, doc in candidates:
            sim = EmbeddingService.cosine_similarity(query_vec, chunk.embedding_json or [])
            # Also boost if keywords in chunk match query
            query_words = set(query.lower().split())
            chunk_words = set(chunk.content.lower().split())
            overlap = len(query_words.intersection(chunk_words))
            boosted_sim = min(1.0, sim + (overlap * 0.08))
            scored.append((boosted_sim, chunk, doc))

        # Sort by similarity descending
        scored.sort(key=lambda x: -x[0])
        top_matches = scored[:top_k]

        citations: List[SourceCitation] = []
        context_snippets = []

        for sim, chunk, doc in top_matches:
            citations.append(
                SourceCitation(
                    document_title=doc.title,
                    document_id=doc.id,
                    page_number=chunk.page_number,
                    excerpt=chunk.content[:200] + "...",
                    similarity_score=sim,
                )
            )
            context_snippets.append(
                f"[Document: {doc.title}, Page {chunk.page_number}]\n{chunk.content}"
            )

        context_text = "\n\n---\n\n".join(context_snippets)

        # Generate Grounded Answer using LLM
        provider = await get_llm_provider()
        system_prompt = (
            "You are AcadFlow's Grounded Academic Research Assistant. "
            "Answer the student's question ONLY using the provided verified course excerpts below. "
            "Always cite the source document when referencing information. "
            "If the information is not found in the excerpts, state clearly: "
            "'Based on your uploaded course documents, I could not find a direct answer to this question.'"
        )

        user_prompt = f"""
Student Question: {query}

Verified Course Excerpts:
{context_text if context_text else 'No matching course documents found.'}

Provide a concise, grounded, student-friendly answer with citations:
"""
        if context_snippets:
            try:
                answer = await provider.generate_text(user_prompt, system_prompt=system_prompt)
            except Exception:
                answer = f"Based on your notes in {citations[0].document_title}: {context_snippets[0][:300]}..."
        else:
            answer = "I couldn't find any relevant study materials or notes in your Knowledge Base for this query. Upload syllabus or lecture notes in the Knowledge section to enable grounded AI answers."

        return RAGQueryResponse(
            query=query,
            answer=answer,
            citations=citations,
            is_grounded=len(citations) > 0,
            ai_provider=provider.__class__.__name__,
        )
