from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import Optional

from app.database.config import get_db
from app.models.models import User, Preference
from app.schemas.schemas import PreferenceUpdate, PreferenceResponse
from app.api.auth import get_current_user

router = APIRouter(prefix="/preferences")


def get_authenticated_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> User:
    """Get authenticated user from Bearer token or raise error"""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )

    user = get_current_user(authorization, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

    return user


@router.get("", response_model=PreferenceResponse)
async def get_preferences(
    user: User = Depends(get_authenticated_user),
    db: Session = Depends(get_db)
):
    """Get user preferences"""

    # Get or create preferences
    preferences = db.query(Preference).filter(Preference.user_id == user.id).first()

    if not preferences:
        # Create default preferences
        preferences = Preference(user_id=user.id)
        db.add(preferences)
        db.commit()
        db.refresh(preferences)

    return preferences


@router.put("", response_model=PreferenceResponse)
async def update_preferences(
    preference_update: PreferenceUpdate,
    user: User = Depends(get_authenticated_user),
    db: Session = Depends(get_db)
):
    """Update user preferences"""

    # Get or create preferences
    preferences = db.query(Preference).filter(Preference.user_id == user.id).first()

    if not preferences:
        preferences = Preference(user_id=user.id)
        db.add(preferences)
        db.commit()
        db.refresh(preferences)

    # Update fields
    update_data = preference_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(preferences, field, value)

    db.add(preferences)
    db.commit()
    db.refresh(preferences)

    return preferences
