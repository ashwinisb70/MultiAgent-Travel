from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, ForeignKey, Text, JSON, Enum
from sqlalchemy.orm import relationship
from app.database.config import Base
import enum


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    trips = relationship("Trip", back_populates="owner", cascade="all, delete-orphan")
    preferences = relationship("Preference", back_populates="user", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="owner", cascade="all, delete-orphan")


class Preference(Base):
    __tablename__ = "preferences"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Travel preferences
    favorite_activities = Column(JSON, default=list)  # List of activity types
    food_preferences = Column(JSON, default=list)
    hotel_preference = Column(String(100))  # Budget, Comfort, Luxury, Adventure
    transportation_preference = Column(String(100))  # Flight, Train, Car, Eco
    typical_budget_range = Column(String(100))  # Low, Medium, High
    preferred_activity_times = Column(JSON, default=dict)  # Morning, Afternoon, Evening
    previous_trips = Column(JSON, default=list)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="preferences")


class Trip(Base):
    __tablename__ = "trips"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Basic info
    title = Column(String(255), nullable=False)
    description = Column(Text)
    starting_location = Column(String(255), nullable=False)
    destination = Column(String(255), nullable=False)
    
    # Dates
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    
    # Trip details
    num_travelers = Column(Integer, default=1)
    total_budget = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    travel_style = Column(String(100))  # Adventure, Relaxation, Culture, Food, Budget
    
    # Status
    status = Column(String(50), default="draft")  # draft, planning, generated, confirmed
    readiness_score = Column(Float, default=0.0)
    
    # Generated content
    generated_at = Column(DateTime)
    is_demo = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    owner = relationship("User", back_populates="trips")
    travelers = relationship("Traveler", back_populates="trip", cascade="all, delete-orphan")
    itinerary_days = relationship("ItineraryDay", back_populates="trip", cascade="all, delete-orphan")
    budget_items = relationship("BudgetItem", back_populates="trip", cascade="all, delete-orphan")
    agent_runs = relationship("AgentRun", back_populates="trip", cascade="all, delete-orphan")
    simulations = relationship("TripSimulation", back_populates="trip", cascade="all, delete-orphan")
    risk_items = relationship("RiskItem", back_populates="trip", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="trip", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="trip", cascade="all, delete-orphan")


class Traveler(Base):
    __tablename__ = "travelers"
    
    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False)
    
    name = Column(String(255), nullable=False)
    age = Column(Integer)
    interests = Column(JSON, default=list)  # Food, Museums, Shopping, Adventure, etc.
    budget_preference = Column(String(100))  # Low, Medium, High
    activity_intensity = Column(String(100))  # Light, Moderate, Intense
    dietary_restrictions = Column(JSON, default=list)
    accessibility_needs = Column(String(255))
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    trip = relationship("Trip", back_populates="travelers")


class ItineraryDay(Base):
    __tablename__ = "itinerary_days"
    
    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False)
    
    day_number = Column(Integer, nullable=False)
    date = Column(DateTime, nullable=False)
    theme = Column(String(255))  # Cultural, Food, Shopping, Adventure, etc.
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    trip = relationship("Trip", back_populates="itinerary_days")
    activities = relationship("Activity", back_populates="itinerary_day", cascade="all, delete-orphan")


class Activity(Base):
    __tablename__ = "activities"
    
    id = Column(Integer, primary_key=True, index=True)
    itinerary_day_id = Column(Integer, ForeignKey("itinerary_days.id"), nullable=False)
    
    name = Column(String(255), nullable=False)
    category = Column(String(100))  # Attraction, Restaurant, Shopping, Transfer, Hotel
    time_start = Column(String(10))  # HH:MM format
    time_end = Column(String(10))
    duration_minutes = Column(Integer)
    location = Column(String(255))
    latitude = Column(Float)
    longitude = Column(Float)
    estimated_cost = Column(Float)
    currency = Column(String(10), default="INR")
    recommendation_reason = Column(Text)
    booking_url = Column(String(500))
    priority = Column(Integer, default=1)  # 1 = Must do, 2 = Should do, 3 = Optional
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    itinerary_day = relationship("ItineraryDay", back_populates="activities")


class BudgetItem(Base):
    __tablename__ = "budget_items"
    
    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False)
    
    category = Column(String(100), nullable=False)  # Flights, Accommodation, Food, Activities, Transport, Transfer, Misc
    description = Column(String(255))
    estimated_cost = Column(Float, nullable=False)
    actual_cost = Column(Float)
    currency = Column(String(10), default="INR")
    per_person = Column(Boolean, default=False)
    quantity = Column(Integer, default=1)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    trip = relationship("Trip", back_populates="budget_items")


class AgentRun(Base):
    __tablename__ = "agent_runs"
    
    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False)
    
    run_type = Column(String(50), default="generation")  # generation, replan, simulate
    status = Column(String(50), default="pending")  # pending, running, completed, failed
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    trip = relationship("Trip", back_populates="agent_runs")
    agent_results = relationship("AgentResult", back_populates="run", cascade="all, delete-orphan")


class AgentResult(Base):
    __tablename__ = "agent_results"
    
    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(Integer, ForeignKey("agent_runs.id"), nullable=False)
    
    agent_name = Column(String(100), nullable=False)  # Flight Agent, Hotel Agent, etc.
    status = Column(String(50), default="pending")  # pending, running, completed, failed, skipped
    input_data = Column(JSON)
    output_data = Column(JSON)
    error_message = Column(Text)
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    run = relationship("AgentRun", back_populates="agent_results")


class TripSimulation(Base):
    __tablename__ = "trip_simulations"
    
    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False)
    
    name = Column(String(255))
    changed_parameters = Column(JSON)  # What was changed
    simulated_budget = Column(Float)
    simulated_cost = Column(Float)
    cost_difference = Column(Float)
    changed_itinerary = Column(JSON)  # Modified itinerary
    status = Column(String(50), default="draft")  # draft, applied, rejected
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    trip = relationship("Trip", back_populates="simulations")


class RiskItem(Base):
    __tablename__ = "risk_items"
    
    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False)
    
    severity = Column(String(50))  # low, medium, high, critical
    category = Column(String(100))  # Budget, Schedule, Missing Booking, Weather, etc.
    description = Column(Text)
    affected_date = Column(DateTime)
    affected_activity = Column(String(255))
    mitigation_suggestion = Column(Text)
    is_resolved = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    trip = relationship("Trip", back_populates="risk_items")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Booking details
    booking_type = Column(String(50), nullable=False)  # flight, hotel, activity, transport, other
    booking_provider = Column(String(100), default="Demo")  # Demo, External provider name

    # Status workflow
    status = Column(String(50), default="pending")  # draft, pending, confirmed, cancelled, failed

    # Booking reference
    reference_number = Column(String(100), unique=True, nullable=True)

    # Item details
    item_name = Column(String(255), nullable=False)
    item_id = Column(Integer)  # Link to Activity if applicable
    destination = Column(String(255))

    # Dates
    booking_date = Column(DateTime, nullable=False, default=datetime.utcnow)
    confirmation_date = Column(DateTime)
    travel_start_date = Column(DateTime)
    travel_end_date = Column(DateTime)

    # Cost
    estimated_cost = Column(Float, nullable=False, default=0)
    actual_cost = Column(Float)
    currency = Column(String(10), default="INR")

    # Metadata
    booking_details = Column(JSON, default=dict)  # Store flight/hotel details as JSON
    confirmation_token = Column(String(255))

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    trip = relationship("Trip", back_populates="bookings")
    owner = relationship("User")


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Document details
    document_type = Column(String(100), nullable=False)  # Passport, Visa, Travel Insurance, ID Proof, Flight Ticket, Hotel Confirmation
    status = Column(String(50), default="pending")  # pending, ready

    # Optional file storage
    file_url = Column(String(500))  # URL to uploaded document if applicable
    file_name = Column(String(255))

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    trip = relationship("Trip", back_populates="documents")
    owner = relationship("User")
