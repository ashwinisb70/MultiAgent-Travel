from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database.config import get_db
from app.models.models import User
from app.schemas.schemas import BookingCreate, BookingResponse
from app.services.trip_service import BookingService, TripService
from app.api.auth import get_current_user

router = APIRouter(prefix="/trips")


def get_authenticated_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> User:
    """Get authenticated user from Bearer token"""
    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    user = get_current_user(authorization, db)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    return user


@router.post("/{trip_id}/bookings", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_booking(
    trip_id: int,
    booking_data: BookingCreate,
    user: User = Depends(get_authenticated_user),
    db: Session = Depends(get_db)
):
    """Create a new booking for a trip"""
    from app.services.trip_service import ReadinessService

    trip = TripService.get_trip(db, trip_id, user.id)
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")

    booking = BookingService.create_booking(
        db=db,
        trip_id=trip_id,
        user_id=user.id,
        booking_type=booking_data.booking_type,
        item_name=booking_data.item_name,
        estimated_cost=booking_data.estimated_cost,
        destination=booking_data.destination,
        booking_provider=booking_data.booking_provider,
        booking_details=booking_data.booking_details
    )

    # Update trip readiness score after booking is created
    ReadinessService.update_trip_readiness_score(db, trip)

    return booking


@router.get("/{trip_id}/bookings", response_model=List[BookingResponse])
async def get_trip_bookings(
    trip_id: int,
    user: User = Depends(get_authenticated_user),
    db: Session = Depends(get_db)
):
    """Get all bookings for a trip"""
    trip = TripService.get_trip(db, trip_id, user.id)
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")

    bookings = BookingService.get_trip_bookings(db, trip_id)
    return bookings


@router.get("/{trip_id}/bookings/{booking_id}", response_model=BookingResponse)
async def get_booking(
    trip_id: int,
    booking_id: int,
    user: User = Depends(get_authenticated_user),
    db: Session = Depends(get_db)
):
    """Get a specific booking"""
    trip = TripService.get_trip(db, trip_id, user.id)
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")

    booking = BookingService.get_booking(db, booking_id)
    if not booking or booking.trip_id != trip_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    return booking


@router.post("/{trip_id}/bookings/{booking_id}/confirm", response_model=BookingResponse)
async def confirm_booking(
    trip_id: int,
    booking_id: int,
    user: User = Depends(get_authenticated_user),
    db: Session = Depends(get_db)
):
    """Confirm a booking"""
    from app.services.trip_service import ReadinessService

    trip = TripService.get_trip(db, trip_id, user.id)
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")

    booking = BookingService.get_booking(db, booking_id)
    if not booking or booking.trip_id != trip_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    confirmed_booking = BookingService.confirm_booking(db, booking_id)

    # Update trip readiness score after booking status changes
    ReadinessService.update_trip_readiness_score(db, trip)

    return confirmed_booking


@router.post("/{trip_id}/bookings/{booking_id}/cancel", response_model=BookingResponse)
async def cancel_booking(
    trip_id: int,
    booking_id: int,
    user: User = Depends(get_authenticated_user),
    db: Session = Depends(get_db)
):
    """Cancel a booking"""
    from app.services.trip_service import ReadinessService

    trip = TripService.get_trip(db, trip_id, user.id)
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")

    booking = BookingService.get_booking(db, booking_id)
    if not booking or booking.trip_id != trip_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    cancelled_booking = BookingService.cancel_booking(db, booking_id)

    # Update trip readiness score after booking status changes
    ReadinessService.update_trip_readiness_score(db, trip)

    return cancelled_booking
