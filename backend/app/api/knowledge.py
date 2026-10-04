from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.user import User
from app.models.document import Document, DocumentChunk
from app.schemas.document import DocumentResponse, RAGQueryRequest, RAGQueryResponse
from app.ai.rag.embeddings import EmbeddingService
from app.ai.rag.retriever import RAGRetriever
from app.api.deps import get_current_user

router = APIRouter(prefix="/knowledge", tags=["Knowledge Base & RAG"])


@router.get("/documents", response_model=List[DocumentResponse])
def get_documents(
    course_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(Document).filter(Document.user_id == current_user.id)
    if course_id:
        q = q.filter(Document.course_id == course_id)
    docs = q.order_by(Document.created_at.desc()).all()

    res = []
    for d in docs:
        resp = DocumentResponse(
            id=d.id,
            user_id=d.user_id,
            course_id=d.course_id,
            title=d.title,
            filename=d.filename,
            file_type=d.file_type,
            file_size_bytes=d.file_size_bytes,
            summary=d.summary,
            chunk_count=len(d.chunks),
            created_at=d.created_at,
        )
        res.append(resp)
    return res


@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    course_id: Optional[str] = Form(None),
    raw_content: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc_title = title or file.filename.rsplit(".", 1)[0].replace("_", " ").title()
    content = raw_content

    # If raw content was not provided in form, read file content
    if not content:
        try:
            bytes_data = await file.read()
            content = bytes_data.decode("utf-8", errors="ignore")
        except Exception:
            content = f"Uploaded study notes for {doc_title}."

    if not content.strip():
        content = f"Course document: {doc_title}. Important academic reference material."

    doc = Document(
        user_id=current_user.id,
        course_id=course_id if course_id else None,
        title=doc_title,
        filename=file.filename,
        file_type=file.filename.split(".")[-1] if "." in file.filename else "pdf",
        file_size_bytes=len(content.encode("utf-8")),
        summary=f"Processed and indexed {doc_title} into Knowledge Base."
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Chunk text & generate embeddings
    chunks = RAGRetriever.chunk_text(content, chunk_size=400, chunk_overlap=50)
    for idx, c_text in enumerate(chunks):
        chunk = DocumentChunk(
            document_id=doc.id,
            chunk_index=idx,
            content=c_text,
            token_count=len(c_text.split()),
            page_number=(idx // 2) + 1,
            embedding_json=EmbeddingService.get_text_embedding(c_text)
        )
        db.add(chunk)

    db.commit()

    return DocumentResponse(
        id=doc.id,
        user_id=doc.user_id,
        course_id=doc.course_id,
        title=doc.title,
        filename=doc.filename,
        file_type=doc.file_type,
        file_size_bytes=doc.file_size_bytes,
        summary=doc.summary,
        chunk_count=len(chunks),
        created_at=doc.created_at,
    )


@router.post("/query", response_model=RAGQueryResponse)
async def query_knowledge_base(
    payload: RAGQueryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    RAG Semantic Retrieval & Grounded Q&A (Section 22, 23).
    Returns verified excerpts and source citations.
    """
    if not payload.query or not payload.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    return await RAGRetriever.query_knowledge_base(
        db=db,
        user_id=current_user.id,
        query=payload.query,
        course_id=payload.course_id,
        top_k=payload.top_k
    )


@router.delete("/documents/{document_id}")
def delete_document(document_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    db.delete(doc)
    db.commit()
    return {"message": "Document deleted from knowledge base."}
