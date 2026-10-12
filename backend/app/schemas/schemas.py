from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


# ============ Auth Schemas ============
class UserCreate(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=6)
    full_name: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    full_name: Optional[str]
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# ============ Preference Schemas ============
class PreferenceUpdate(BaseModel):
    favorite_activities: Optional[List[str]] = None
    food_preferences: Optional[List[str]] = None
    hotel_preference: Optional[str] = None
    transportation_preference: Optional[str] = None
    typical_budget_range: Optional[str] = None
    preferred_activity_times: Optional[Dict[str, str]] = None


class PreferenceResponse(BaseModel):
    id: int
    user_id: int
    favorite_activities: List[str]
    food_preferences: List[str]
    hotel_preference: Optional[str]
    transportation_preference: Optional[str]
    typical_budget_range: Optional[str]
    preferred_activity_times: Dict[str, str]
    created_at: datetime
    
    class Config:
        from_attributes = True


# ============ Traveler Schemas ============
class TravelerCreate(BaseModel):
    name: str
    age: Optional[int] = None
    interests: List[str] = []
    budget_preference: Optional[str] = None
    activity_intensity: Optional[str] = None
    dietary_restrictions: List[str] = []
    accessibility_needs: Optional[str] = None


class TravelerResponse(BaseModel):
    id: int
    trip_id: int
    name: str
    age: Optional[int]
    interests: List[str]
    budget_preference: Optional[str]
    activity_intensity: Optional[str]
    dietary_restrictions: List[str]
    accessibility_needs: Optional[str]
    
    class Config:
        from_attributes = True


# ============ Activity Schemas ============
class ActivityCreate(BaseModel):
    name: str
    category: str
    time_start: Optional[str] = None
    time_end: Optional[str] = None
    duration_minutes: Optional[int] = None
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    estimated_cost: Optional[float] = None
    currency: str = "INR"
    recommendation_reason: Optional[str] = None
    booking_url: Optional[str] = None
    priority: int = 1


class ActivityResponse(BaseModel):
    id: int
    itinerary_day_id: int
    name: str
    category: str
    time_start: Optional[str]
    time_end: Optional[str]
    duration_minutes: Optional[int]
    location: str
    latitude: Optional[float]
    longitude: Optional[float]
    estimated_cost: Optional[float]
    currency: str
    recommendation_reason: Optional[str]
    booking_url: Optional[str]
    priority: int
    
    class Config:
        from_attributes = True


# ============ ItineraryDay Schemas ============
class ItineraryDayCreate(BaseModel):
    day_number: int
    date: datetime
    theme: Optional[str] = None


class ItineraryDayResponse(BaseModel):
    id: int
    trip_id: int
    day_number: int
    date: datetime
    theme: Optional[str]
    activities: List[ActivityResponse] = []
    
    class Config:
        from_attributes = True


# ============ Budget Schemas ============
class BudgetItemCreate(BaseModel):
    category: str
    description: Optional[str] = None
    estimated_cost: float
    actual_cost: Optional[float] = None
    currency: str = "INR"
    per_person: bool = False
    quantity: int = 1


class BudgetItemResponse(BaseModel):
    id: int
    trip_id: int
    category: str
    description: Optional[str]
    estimated_cost: float
    actual_cost: Optional[float]
    currency: str
    per_person: bool
    quantity: int
    
    class Config:
        from_attributes = True


class BudgetSummary(BaseModel):
    total_budget: float
    estimated_cost: float
    remaining_budget: float
    utilization_percentage: float
    cost_per_traveler: float
    breakdown: Dict[str, float]  # Category -> Cost
    currency: str


# ============ Trip Schemas ============
class TripCreate(BaseModel):
    title: str
    description: Optional[str] = None
    starting_location: str
    destination: str
    start_date: datetime
    end_date: datetime
    num_travelers: int = 1
    total_budget: float
    currency: str = "INR"
    travel_style: Optional[str] = None


class TripUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    starting_location: Optional[str] = None
    destination: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    num_travelers: Optional[int] = None
    total_budget: Optional[float] = None
    currency: Optional[str] = None
    travel_style: Optional[str] = None
    status: Optional[str] = None


class TripResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: Optional[str]
    starting_location: str
    destination: str
    start_date: datetime
    end_date: datetime
    num_travelers: int
    total_budget: float
    currency: str
    travel_style: Optional[str]
    status: str
    readiness_score: float
    is_demo: bool
    generated_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class TripDetailResponse(TripResponse):
    travelers: List[TravelerResponse] = []
    itinerary_days: List[ItineraryDayResponse] = []
    budget_items: List[BudgetItemResponse] = []
    risk_items: List['RiskItemResponse'] = []


# ============ Agent Schemas ============
class AgentResultResponse(BaseModel):
    id: int
    run_id: int
    agent_name: str
    status: str
    input_data: Optional[Dict[str, Any]]
    output_data: Optional[Dict[str, Any]]
    error_message: Optional[str]
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class AgentRunResponse(BaseModel):
    id: int
    trip_id: int
    run_type: str
    status: str
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime
    agent_results: List[AgentResultResponse] = []
    
    class Config:
        from_attributes = True


# ============ Risk Schemas ============
class RiskItemResponse(BaseModel):
    id: int
    trip_id: int
    severity: str
    category: str
    description: str
    affected_date: Optional[datetime]
    affected_activity: Optional[str]
    mitigation_suggestion: Optional[str]
    is_resolved: bool
    
    class Config:
        from_attributes = True


class RiskAnalysisResponse(BaseModel):
    risks: List[RiskItemResponse]
    risk_count: int
    high_severity_count: int
    critical_count: int


# ============ Readiness Schemas ============
class ReadinessCheckResponse(BaseModel):
    item: str
    status: str  # Completed, Pending, Not Started
    weight: float


class BookingCreate(BaseModel):
    booking_type: str  # flight, hotel, activity, transport, other
    item_name: str
    estimated_cost: float
    destination: Optional[str] = None
    booking_provider: str = "Demo"
    booking_details: Optional[Dict[str, Any]] = None


class BookingResponse(BaseModel):
    id: int
    trip_id: int
    booking_type: str
    item_name: str
    estimated_cost: float
    destination: Optional[str]
    status: str
    reference_number: Optional[str]
    confirmation_date: Optional[datetime]
    booking_provider: str
    currency: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ReadinessScoreResponse(BaseModel):
    overall_score: float  # 0-100
    checks: List[ReadinessCheckResponse]
    calculation_method: str
    recommendation: str


# ============ Simulation Schemas ============
class SimulationRequest(BaseModel):
    budget: Optional[float] = None
    num_travelers: Optional[int] = None
    trip_duration: Optional[int] = None
    hotel_quality: Optional[str] = None
    activity_intensity: Optional[str] = None
    transportation_preference: Optional[str] = None


class SimulationResponse(BaseModel):
    id: int
    trip_id: int
    name: Optional[str]
    changed_parameters: Dict[str, Any]
    simulated_budget: float
    simulated_cost: float
    cost_difference: float
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True


# ============ Trip Generation Request ============
class TripGenerationRequest(BaseModel):
    travelers: List[TravelerCreate]
    interests: List[str]
    food_preferences: List[str]
    hotel_preference: Optional[str] = None
    transportation_preference: Optional[str] = None
    special_requirements: Optional[str] = None


# ============ AI Decision Explanation ============
class DecisionExplanation(BaseModel):
    decision: str
    reason: str
    alternatives_considered: List[str]
    impact: Optional[str]


class TripWithDecisions(BaseModel):
    trip: TripDetailResponse
    decisions: List[DecisionExplanation]

# Backward-compatible alias for trip services
TravelCreate = TravelerCreate
