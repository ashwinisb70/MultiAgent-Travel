#!/usr/bin/env python
"""
Script to seed demo data into the database
Run from project root: python scripts/seed_demo_data.py
"""

import sys
from datetime import datetime, timedelta
sys.path.insert(0, 'backend')

from sqlalchemy.orm import Session
from app.database.config import SessionLocal, Base, engine
from app.models.models import (
    User, Preference, Trip, Traveler, ItineraryDay,
    Activity, BudgetItem, AgentRun, AgentResult, RiskItem
)
from app.core.security import hash_password

def create_demo_data():
    """Create demo data"""
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Check if demo user already exists
        existing_user = db.query(User).filter(User.email == "demo@tripgenie.com").first()
        if existing_user:
            print("Demo data already exists. Skipping...")
            return
        
        # Create demo user
        demo_user = User(
            email="demo@tripgenie.com",
            username="demouser",
            hashed_password=hash_password("Demo123!"),
            full_name="Demo User",
            is_active=True
        )
        db.add(demo_user)
        db.flush()
        
        # Create user preferences
        preferences = Preference(
            user_id=demo_user.id,
            favorite_activities=["Museums", "Food", "Shopping", "Photography"],
            food_preferences=["French", "Italian", "Asian"],
            hotel_preference="Comfort",
            transportation_preference="Flight",
            typical_budget_range="Medium"
        )
        db.add(preferences)
        
        # Create demo trip
        start_date = datetime(2024, 12, 10)
        end_date = datetime(2024, 12, 15)
        
        trip = Trip(
            user_id=demo_user.id,
            title="Paris Holiday - Demo Trip",
            description="A perfect 5-day trip to Paris with focus on food, museums, and shopping",
            starting_location="Bengaluru",
            destination="Paris",
            start_date=start_date,
            end_date=end_date,
            num_travelers=2,
            total_budget=150000,
            currency="INR",
            travel_style="Culture & Food",
            status="generated",
            readiness_score=87,
            is_demo=True,
            generated_at=datetime.utcnow()
        )
        db.add(trip)
        db.flush()
        
        # Create travelers
        traveler1 = Traveler(
            trip_id=trip.id,
            name="Ashwini",
            age=25,
            interests=["Museums", "Food", "Photography"],
            budget_preference="Medium",
            activity_intensity="Moderate",
            dietary_restrictions=[],
            accessibility_needs=None
        )
        
        traveler2 = Traveler(
            trip_id=trip.id,
            name="Friend",
            age=24,
            interests=["Shopping", "Food", "Adventure"],
            budget_preference="Medium",
            activity_intensity="High",
            dietary_restrictions=[],
            accessibility_needs=None
        )
        db.add_all([traveler1, traveler2])
        
        # Create itinerary days
        for day_num in range(1, 6):
            current_date = start_date + timedelta(days=day_num-1)
            day = ItineraryDay(
                trip_id=trip.id,
                day_number=day_num,
                date=current_date,
                theme="Cultural" if day_num % 2 == 1 else "Leisure"
            )
            db.add(day)
        
        db.flush()
        
        # Add activities
        activities_data = [
            ("Eiffel Tower Visit", "Attraction", "09:00", "12:00", 180, "Eiffel Tower, Paris", 15000, "Must-see landmark"),
            ("Louvre Museum", "Museum", "13:00", "17:00", 240, "Louvre, Paris", 12000, "World's largest art museum"),
            ("French Cooking Class", "Food Experience", "10:00", "13:00", 180, "Le Cordon Bleu, Paris", 8000, "Learn authentic French cooking"),
            ("Seine River Cruise", "Tour", "19:00", "20:30", 90, "Seine River, Paris", 5000, "Evening scenic cruise"),
            ("Montmartre Walking Tour", "Tour", "14:00", "16:00", 120, "Montmartre, Paris", 4000, "Artistic neighborhood tour"),
        ]
        
        itinerary_days = db.query(ItineraryDay).filter(ItineraryDay.trip_id == trip.id).all()
        
        for idx, activity_data in enumerate(activities_data):
            if idx < len(itinerary_days):
                activity = Activity(
                    itinerary_day_id=itinerary_days[idx].id,
                    name=activity_data[0],
                    category=activity_data[1],
                    time_start=activity_data[2],
                    time_end=activity_data[3],
                    duration_minutes=activity_data[4],
                    location=activity_data[5],
                    estimated_cost=activity_data[6],
                    currency="INR",
                    recommendation_reason=activity_data[7],
                    priority=1,
                    latitude=48.8584 + (idx * 0.001),
                    longitude=2.2945 + (idx * 0.001)
                )
                db.add(activity)
        
        # Add budget items
        budget_items = [
            BudgetItem(
                trip_id=trip.id,
                category="Flights",
                description="Round-trip flights Bengaluru to Paris",
                estimated_cost=45000,
                currency="INR",
                per_person=True,
                quantity=2
            ),
            BudgetItem(
                trip_id=trip.id,
                category="Accommodation",
                description="Hotel stays (5 nights)",
                estimated_cost=50000,
                currency="INR",
                per_person=False,
                quantity=1
            ),
            BudgetItem(
                trip_id=trip.id,
                category="Food",
                description="Meals and dining",
                estimated_cost=20000,
                currency="INR",
                per_person=False,
                quantity=1
            ),
            BudgetItem(
                trip_id=trip.id,
                category="Activities",
                description="Activities and attractions",
                estimated_cost=12000,
                currency="INR",
                per_person=False,
                quantity=1
            ),
        ]
        db.add_all(budget_items)
        
        # Add risks
        risks = [
            RiskItem(
                trip_id=trip.id,
                severity="low",
                category="Budget Utilization",
                description="Trip budget is 87% utilized with limited contingency",
                mitigation_suggestion="Consider adding 10% to budget for emergencies"
            ),
            RiskItem(
                trip_id=trip.id,
                severity="medium",
                category="Missing Booking",
                description="Travel insurance not yet booked",
                mitigation_suggestion="Book travel insurance before departure"
            ),
        ]
        db.add_all(risks)
        
        # Create agent run
        agent_run = AgentRun(
            trip_id=trip.id,
            run_type="generation",
            status="completed",
            started_at=datetime.utcnow() - timedelta(minutes=2),
            completed_at=datetime.utcnow()
        )
        db.add(agent_run)
        db.flush()
        
        # Add agent results
        agents = [
            ("Flight Agent", "success"),
            ("Hotel Agent", "success"),
            ("Activity Agent", "success"),
            ("Budget Agent", "success"),
            ("Preference Agent", "success"),
            ("Risk Agent", "success"),
            ("Debate Agent", "success"),
            ("Itinerary Agent", "success"),
            ("Validator Agent", "success"),
        ]
        
        for agent_name, status in agents:
            result = AgentResult(
                run_id=agent_run.id,
                agent_name=agent_name,
                status=status,
                input_data={"destination": "Paris", "budget": 150000},
                output_data={"status": "completed"},
                started_at=datetime.utcnow() - timedelta(minutes=1),
                completed_at=datetime.utcnow()
            )
            db.add(result)
        
        # Commit all changes
        db.commit()
        
        print("✓ Demo data created successfully!")
        print(f"  - User: demo@tripgenie.com (password: Demo123!)")
        print(f"  - Demo Trip: Paris Holiday (Dec 10-15, 2024)")
        print(f"  - Budget: ₹1,50,000")
        print(f"  - Travelers: 2")
        print(f"  - Readiness Score: 87%")
        
    except Exception as e:
        print(f"✗ Error creating demo data: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_demo_data()
