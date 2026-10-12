from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid
from app.models.models import (
    Trip, User, Traveler, ItineraryDay, Activity, BudgetItem,
    AgentRun, AgentResult, RiskItem, TripSimulation, Booking
)
from app.schemas.schemas import (
    TripCreate, TripUpdate, TravelCreate, ActivityCreate,
    BudgetItemCreate
)


class ReadinessService:
    """Service for calculating trip readiness - SINGLE SOURCE OF TRUTH"""

    @staticmethod
    def calculate_readiness(db: Session, trip: Trip) -> Dict[str, Any]:
        """
        Calculate trip readiness from CURRENT database state.
        This is the AUTHORITATIVE calculation used by all endpoints.
        """
        # Check each readiness criterion from ACTUAL current data
        # BookingService is defined in this module, use it directly
        flight_booked = BookingService.count_confirmed_bookings(db, trip.id, "flight") > 0
        hotel_booked = BookingService.count_confirmed_bookings(db, trip.id, "hotel") > 0
        activities_scheduled = len(trip.itinerary_days) > 0 and any(len(day.activities) > 0 for day in trip.itinerary_days)
        budget_allocated = trip.total_budget > 0
        itinerary_generated = trip.status in ["generated", "ready", "completed"]

        # Get actual documents status from database
        from app.models.models import Document
        total_docs = 6  # Passport, Visa, Insurance, ID, Flight, Hotel
        ready_docs = db.query(Document).filter(
            Document.trip_id == trip.id,
            Document.status == "ready"
        ).count()
        documents_ready = (ready_docs == total_docs)

        # Define all checks with their status and weight
        checks = [
            {"item": "Flights booked", "status": "Completed" if flight_booked else "Pending", "weight": 0.25},
            {"item": "Accommodation booked", "status": "Completed" if hotel_booked else "Pending", "weight": 0.25},
            {"item": "Activities scheduled", "status": "Completed" if activities_scheduled else "Pending", "weight": 0.20},
            {"item": "Budget allocated", "status": "Completed" if budget_allocated else "Pending", "weight": 0.10},
            {"item": "Itinerary generated", "status": "Completed" if itinerary_generated else "Pending", "weight": 0.10},
            {"item": "Documents ready", "status": "Completed" if documents_ready else "Pending", "weight": 0.10},
        ]

        # Calculate score as percentage of completed items
        completed = len([c for c in checks if c["status"] == "Completed"])
        total = len(checks)
        overall_score = (completed / total * 100) if total > 0 else 0

        return {
            "overall_score": overall_score,
            "checks": checks,
            "completed_count": completed,
            "total_count": total,
            "calculation_method": "Real-time completion of planning tasks",
            "recommendation": "Complete remaining tasks for full trip readiness"
        }

    @staticmethod
    def update_trip_readiness_score(db: Session, trip: Trip) -> Trip:
        """
        Update the stored readiness_score from current calculated value.
        Call this to sync the database with current state.
        """
        readiness_data = ReadinessService.calculate_readiness(db, trip)
        trip.readiness_score = readiness_data["overall_score"]
        db.add(trip)
        db.commit()
        db.refresh(trip)
        return trip


class TripService:
    """Service for trip operations"""

    @staticmethod
    def create_trip(db: Session, user_id: int, trip_create: TripCreate) -> Trip:
        """Create a new trip"""
        trip = Trip(
            user_id=user_id,
            title=trip_create.title,
            description=trip_create.description,
            starting_location=trip_create.starting_location,
            destination=trip_create.destination,
            start_date=trip_create.start_date,
            end_date=trip_create.end_date,
            num_travelers=trip_create.num_travelers,
            total_budget=trip_create.total_budget,
            currency=trip_create.currency,
            travel_style=trip_create.travel_style,
            status="draft"
        )
        db.add(trip)
        db.commit()
        db.refresh(trip)
        return trip
    
    @staticmethod
    def get_trip(db: Session, trip_id: int, user_id: int) -> Optional[Trip]:
        """Get a specific trip"""
        return db.query(Trip).filter(
            Trip.id == trip_id,
            Trip.user_id == user_id
        ).first()
    
    @staticmethod
    def get_user_trips(db: Session, user_id: int, skip: int = 0, limit: int = 10) -> List[Trip]:
        """Get all trips for a user"""
        return db.query(Trip).filter(
            Trip.user_id == user_id
        ).order_by(desc(Trip.created_at)).offset(skip).limit(limit).all()
    
    @staticmethod
    def update_trip(db: Session, trip: Trip, trip_update: TripUpdate) -> Trip:
        """Update a trip"""
        update_data = trip_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(trip, field, value)
        db.add(trip)
        db.commit()
        db.refresh(trip)
        return trip
    
    @staticmethod
    def delete_trip(db: Session, trip: Trip) -> bool:
        """Delete a trip"""
        db.delete(trip)
        db.commit()
        return True
    
    @staticmethod
    def mark_trip_generated(db: Session, trip: Trip) -> Trip:
        """Mark trip as generated"""
        trip.status = "generated"
        trip.generated_at = datetime.utcnow()
        db.add(trip)
        db.commit()
        db.refresh(trip)
        return trip
    
    @staticmethod
    def update_readiness_score(db: Session, trip: Trip, score: float) -> Trip:
        """Update trip readiness score"""
        trip.readiness_score = score
        db.add(trip)
        db.commit()
        db.refresh(trip)
        return trip
    
    @staticmethod
    def duplicate_trip(db: Session, trip: Trip, user_id: int) -> Trip:
        """Duplicate a trip"""
        new_trip = Trip(
            user_id=user_id,
            title=f"{trip.title} (Copy)",
            description=trip.description,
            starting_location=trip.starting_location,
            destination=trip.destination,
            start_date=trip.start_date,
            end_date=trip.end_date,
            num_travelers=trip.num_travelers,
            total_budget=trip.total_budget,
            currency=trip.currency,
            travel_style=trip.travel_style,
            status="draft"
        )
        db.add(new_trip)
        db.commit()
        db.refresh(new_trip)
        
        # Duplicate budget items
        for budget_item in trip.budget_items:
            new_budget = BudgetItem(
                trip_id=new_trip.id,
                category=budget_item.category,
                description=budget_item.description,
                estimated_cost=budget_item.estimated_cost,
                currency=budget_item.currency,
                per_person=budget_item.per_person,
                quantity=budget_item.quantity
            )
            db.add(new_budget)
        
        db.commit()
        return new_trip


class TravelerService:
    """Service for traveler operations"""
    
    @staticmethod
    def add_travelers(db: Session, trip_id: int, travelers: List[TravelCreate]) -> List[Traveler]:
        """Add travelers to a trip"""
        traveler_objs = []
        for traveler_data in travelers:
            traveler = Traveler(
                trip_id=trip_id,
                name=traveler_data.name,
                age=traveler_data.age,
                interests=traveler_data.interests,
                budget_preference=traveler_data.budget_preference,
                activity_intensity=traveler_data.activity_intensity,
                dietary_restrictions=traveler_data.dietary_restrictions,
                accessibility_needs=traveler_data.accessibility_needs
            )
            db.add(traveler)
            traveler_objs.append(traveler)
        
        db.commit()
        for traveler in traveler_objs:
            db.refresh(traveler)
        
        return traveler_objs


class ItineraryService:
    """Service for itinerary operations"""
    
    @staticmethod
    def create_itinerary_days(db: Session, trip_id: int, start_date, num_days: int) -> List[ItineraryDay]:
        """Create itinerary days for a trip"""
        itinerary_days = []
        
        from datetime import timedelta
        current_date = start_date
        
        for day_num in range(1, num_days + 1):
            day = ItineraryDay(
                trip_id=trip_id,
                day_number=day_num,
                date=current_date
            )
            db.add(day)
            itinerary_days.append(day)
            current_date += timedelta(days=1)
        
        db.commit()
        for day in itinerary_days:
            db.refresh(day)
        
        return itinerary_days
    
    @staticmethod
    def add_activity(db: Session, itinerary_day_id: int, activity_data: ActivityCreate) -> Activity:
        """Add activity to an itinerary day"""
        activity = Activity(
            itinerary_day_id=itinerary_day_id,
            name=activity_data.name,
            category=activity_data.category,
            time_start=activity_data.time_start,
            time_end=activity_data.time_end,
            duration_minutes=activity_data.duration_minutes,
            location=activity_data.location,
            latitude=activity_data.latitude,
            longitude=activity_data.longitude,
            estimated_cost=activity_data.estimated_cost,
            currency=activity_data.currency,
            recommendation_reason=activity_data.recommendation_reason,
            booking_url=activity_data.booking_url,
            priority=activity_data.priority
        )
        db.add(activity)
        db.commit()
        db.refresh(activity)
        return activity

    @staticmethod
    def save_generated_itinerary(db: Session, trip: Trip, orchestrator_result: dict) -> List[ItineraryDay]:
        """Save generated itinerary from AI agents to database"""
        from datetime import timedelta

        # Get itinerary data from orchestrator result
        itinerary_data = orchestrator_result.get("results", {}).get("itinerary", {}).get("data", {})
        activities_data = orchestrator_result.get("summary", {}).get("activities", [])
        flights_data = orchestrator_result.get("summary", {}).get("flights", [])

        itinerary_days_info = itinerary_data.get("itinerary_days", [])
        total_days = itinerary_data.get("total_days", len(itinerary_days_info) or 5)

        # Create itinerary days
        itinerary_days = []
        current_date = trip.start_date

        for day_num in range(1, total_days + 1):
            # Find matching day info
            day_info = next((d for d in itinerary_days_info if d.get("day_number") == day_num), {})

            day = ItineraryDay(
                trip_id=trip.id,
                day_number=day_num,
                date=current_date,
                theme=day_info.get("theme", "")
            )
            db.add(day)
            db.flush()

            # Add activities for this day
            if activities_data:
                # Distribute activities across days
                activities_per_day = max(1, len(activities_data) // total_days)
                day_activities = activities_data[
                    (day_num - 1) * activities_per_day : day_num * activities_per_day
                ]

                for idx, activity_info in enumerate(day_activities):
                    activity = Activity(
                        itinerary_day_id=day.id,
                        name=activity_info.get("name", "Activity"),
                        category=activity_info.get("category", "Tour"),
                        location=trip.destination,
                        duration_minutes=activity_info.get("duration_minutes", 120),
                        estimated_cost=activity_info.get("cost", 0),
                        currency=trip.currency,
                        recommendation_reason=activity_info.get("reason", ""),
                        priority=idx + 1
                    )
                    db.add(activity)

            itinerary_days.append(day)
            current_date += timedelta(days=1)

        db.commit()
        for day in itinerary_days:
            db.refresh(day)

        return itinerary_days


class BudgetService:
    """Service for budget operations"""
    
    @staticmethod
    def add_budget_item(db: Session, trip_id: int, item_data: BudgetItemCreate) -> BudgetItem:
        """Add a budget item"""
        budget_item = BudgetItem(
            trip_id=trip_id,
            category=item_data.category,
            description=item_data.description,
            estimated_cost=item_data.estimated_cost,
            actual_cost=item_data.actual_cost,
            currency=item_data.currency,
            per_person=item_data.per_person,
            quantity=item_data.quantity
        )
        db.add(budget_item)
        db.commit()
        db.refresh(budget_item)
        return budget_item
    
    @staticmethod
    def calculate_budget_summary(db: Session, trip_id: int) -> dict:
        """Calculate budget summary for a trip"""
        trip = db.query(Trip).filter(Trip.id == trip_id).first()
        if not trip:
            return {}

        # Get budget items from BudgetItem table
        budget_items = db.query(BudgetItem).filter(BudgetItem.trip_id == trip_id).all()
        budget_items_cost = sum(item.estimated_cost for item in budget_items)

        # Get activity costs from itinerary
        itinerary_days = db.query(ItineraryDay).filter(ItineraryDay.trip_id == trip_id).all()
        activity_costs = {}
        total_activity_cost = 0

        for day in itinerary_days:
            activities = db.query(Activity).filter(Activity.itinerary_day_id == day.id).all()
            for activity in activities:
                category = activity.category or "Activities"
                if category not in activity_costs:
                    activity_costs[category] = 0
                activity_costs[category] += activity.estimated_cost or 0
                total_activity_cost += activity.estimated_cost or 0

        # Get confirmed booking costs
        bookings = db.query(Booking).filter(
            Booking.trip_id == trip_id,
            Booking.status == "confirmed"
        ).all()
        booking_costs = {}
        total_booking_cost = 0

        for booking in bookings:
            # Map booking type to category
            category_map = {
                "flight": "Flights",
                "hotel": "Accommodation",
                "activity": "Activities",
                "transport": "Local Transport",
                "food": "Food",
                "other": "Miscellaneous"
            }
            category = category_map.get(booking.booking_type, "Miscellaneous")
            if category not in booking_costs:
                booking_costs[category] = 0
            booking_costs[category] += booking.estimated_cost or 0
            total_booking_cost += booking.estimated_cost or 0

        # Combine all costs
        total_estimated = budget_items_cost + total_activity_cost + total_booking_cost

        breakdown = {}

        # Add budget items to breakdown
        for item in budget_items:
            category = item.category
            if category not in breakdown:
                breakdown[category] = 0
            breakdown[category] += item.estimated_cost

        # Add activity costs to breakdown
        for category, cost in activity_costs.items():
            if category not in breakdown:
                breakdown[category] = 0
            breakdown[category] += cost

        # Add booking costs to breakdown
        for category, cost in booking_costs.items():
            if category not in breakdown:
                breakdown[category] = 0
            breakdown[category] += cost

        return {
            "total_budget": trip.total_budget,
            "estimated_cost": total_estimated,
            "remaining_budget": trip.total_budget - total_estimated,
            "utilization_percentage": (total_estimated / trip.total_budget * 100) if trip.total_budget > 0 else 0,
            "cost_per_traveler": total_estimated / trip.num_travelers if trip.num_travelers > 0 else 0,
            "breakdown": breakdown,
            "currency": trip.currency
        }


class AgentService:
    """Service for agent operations"""
    
    @staticmethod
    def create_agent_run(db: Session, trip_id: int, run_type: str = "generation") -> AgentRun:
        """Create an agent run"""
        run = AgentRun(
            trip_id=trip_id,
            run_type=run_type,
            status="pending",
            started_at=datetime.utcnow()
        )
        db.add(run)
        db.commit()
        db.refresh(run)
        return run
    
    @staticmethod
    def update_agent_run_status(db: Session, run: AgentRun, status: str) -> AgentRun:
        """Update agent run status"""
        run.status = status
        if status == "completed":
            run.completed_at = datetime.utcnow()
        db.add(run)
        db.commit()
        db.refresh(run)
        return run
    
    @staticmethod
    def save_agent_result(db: Session, run_id: int, agent_name: str, status: str,
                         input_data: dict, output_data: dict, error_message: str = None) -> AgentResult:
        """Save agent result"""
        result = AgentResult(
            run_id=run_id,
            agent_name=agent_name,
            status=status,
            input_data=input_data,
            output_data=output_data,
            error_message=error_message,
            started_at=datetime.utcnow(),
            completed_at=datetime.utcnow()
        )
        db.add(result)
        db.commit()
        db.refresh(result)
        return result


class RiskService:
    """Service for risk management"""
    
    @staticmethod
    def add_risk(db: Session, trip_id: int, severity: str, category: str,
                description: str, mitigation: str) -> RiskItem:
        """Add a risk item"""
        risk = RiskItem(
            trip_id=trip_id,
            severity=severity,
            category=category,
            description=description,
            mitigation_suggestion=mitigation
        )
        db.add(risk)
        db.commit()
        db.refresh(risk)
        return risk
    
    @staticmethod
    def get_trip_risks(db: Session, trip_id: int) -> List[RiskItem]:
        """Get all risks for a trip"""
        return db.query(RiskItem).filter(RiskItem.trip_id == trip_id).all()


class BookingService:
    """Service for booking operations"""

    @staticmethod
    def create_booking(db: Session, trip_id: int, user_id: int, booking_type: str,
                      item_name: str, estimated_cost: float, destination: str = None,
                      booking_provider: str = "Demo", booking_details: dict = None) -> Booking:
        """Create a new booking"""
        reference_number = f"TG-{booking_type.upper()[:3]}-{uuid.uuid4().hex[:6].upper()}"

        booking = Booking(
            trip_id=trip_id,
            user_id=user_id,
            booking_type=booking_type,
            booking_provider=booking_provider,
            status="pending",
            reference_number=reference_number,
            item_name=item_name,
            estimated_cost=estimated_cost,
            destination=destination,
            currency="INR",
            booking_details=booking_details or {}
        )
        db.add(booking)
        db.commit()
        db.refresh(booking)
        return booking

    @staticmethod
    def confirm_booking(db: Session, booking_id: int) -> Booking:
        """Confirm a booking (change status to confirmed)"""
        booking = db.query(Booking).filter(Booking.id == booking_id).first()
        if booking:
            booking.status = "confirmed"
            booking.confirmation_date = datetime.utcnow()
            booking.confirmation_token = uuid.uuid4().hex
            db.add(booking)
            db.commit()
            db.refresh(booking)
        return booking

    @staticmethod
    def cancel_booking(db: Session, booking_id: int) -> Booking:
        """Cancel a booking"""
        booking = db.query(Booking).filter(Booking.id == booking_id).first()
        if booking:
            booking.status = "cancelled"
            db.add(booking)
            db.commit()
            db.refresh(booking)
        return booking

    @staticmethod
    def get_trip_bookings(db: Session, trip_id: int) -> List[Booking]:
        """Get all bookings for a trip"""
        return db.query(Booking).filter(Booking.trip_id == trip_id).order_by(desc(Booking.created_at)).all()

    @staticmethod
    def get_booking(db: Session, booking_id: int) -> Optional[Booking]:
        """Get a specific booking"""
        return db.query(Booking).filter(Booking.id == booking_id).first()

    @staticmethod
    def count_confirmed_bookings(db: Session, trip_id: int, booking_type: str = None) -> int:
        """Count confirmed bookings for a trip (optionally by type)"""
        query = db.query(Booking).filter(
            Booking.trip_id == trip_id,
            Booking.status == "confirmed"
        )
        if booking_type:
            query = query.filter(Booking.booking_type == booking_type)
        return query.count()
