from fastapi import APIRouter, Depends, HTTPException, status, Header
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database.config import get_db
from app.models.models import User, Trip, Document
from app.schemas.schemas import TripDetailResponse
from app.api.auth import get_current_user


class DocumentStatusUpdate(BaseModel):
    status: str


class DocumentResponse(BaseModel):
    id: int
    trip_id: int
    document_type: str
    status: str
    created_at: str
    updated_at: str


router = APIRouter(prefix="/trips")

# Required documents for trip completion
REQUIRED_DOCUMENTS = [
    "Passport",
    "Visa",
    "Travel Insurance",
    "ID Proof",
    "Flight Ticket",
    "Hotel Confirmation"
]


@router.get("/{trip_id}/documents")
async def get_trip_documents(
    trip_id: int,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """Get all documents for a trip"""
    user = get_current_user(authorization, db)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # Verify trip ownership
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    # Get or create documents
    documents = []
    for doc_type in REQUIRED_DOCUMENTS:
        doc = db.query(Document).filter(
            Document.trip_id == trip_id,
            Document.user_id == user.id,
            Document.document_type == doc_type
        ).first()

        # Create if doesn't exist
        if not doc:
            doc = Document(
                trip_id=trip_id,
                user_id=user.id,
                document_type=doc_type,
                status="pending"
            )
            db.add(doc)
            db.commit()
            db.refresh(doc)

        documents.append({
            "id": doc.id,
            "trip_id": doc.trip_id,
            "document_type": doc.document_type,
            "status": doc.status,
            "created_at": doc.created_at.isoformat(),
            "updated_at": doc.updated_at.isoformat()
        })

    return documents


@router.put("/{trip_id}/documents/{document_type}")
async def update_document_status(
    trip_id: int,
    document_type: str,
    body: DocumentStatusUpdate,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """Update document status (pending or ready)"""
    user = get_current_user(authorization, db)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # Verify trip ownership
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    # Validate status
    if body.status not in ["pending", "ready"]:
        raise HTTPException(status_code=400, detail="Invalid status. Must be 'pending' or 'ready'")

    # Validate document type
    if document_type not in REQUIRED_DOCUMENTS:
        raise HTTPException(status_code=400, detail=f"Invalid document type: {document_type}")

    # Get or create document
    doc = db.query(Document).filter(
        Document.trip_id == trip_id,
        Document.user_id == user.id,
        Document.document_type == document_type
    ).first()

    if not doc:
        doc = Document(
            trip_id=trip_id,
            user_id=user.id,
            document_type=document_type,
            status=body.status
        )
        db.add(doc)
    else:
        doc.status = body.status
        doc.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(doc)

    return {
        "id": doc.id,
        "trip_id": doc.trip_id,
        "document_type": doc.document_type,
        "status": doc.status,
        "updated_at": doc.updated_at.isoformat()
    }


@router.get("/{trip_id}/documents-summary")
async def get_documents_summary(
    trip_id: int,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """Get summary of documents (all ready or not)"""
    user = get_current_user(authorization, db)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # Verify trip ownership
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    # Get or create all documents and calculate summary
    total = len(REQUIRED_DOCUMENTS)
    ready_count = 0

    for doc_type in REQUIRED_DOCUMENTS:
        doc = db.query(Document).filter(
            Document.trip_id == trip_id,
            Document.user_id == user.id,
            Document.document_type == doc_type
        ).first()

        # Create if doesn't exist
        if not doc:
            doc = Document(
                trip_id=trip_id,
                user_id=user.id,
                document_type=doc_type,
                status="pending"
            )
            db.add(doc)
        else:
            if doc.status == "ready":
                ready_count += 1

    db.commit()

    all_ready = ready_count == total

    return {
        "trip_id": trip_id,
        "ready_count": ready_count,
        "total": total,
        "all_ready": all_ready,
        "documents_ready": all_ready
    }
