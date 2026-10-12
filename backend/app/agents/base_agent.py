from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from pydantic import BaseModel
from datetime import datetime
import json


class AgentInput(BaseModel):
    """Base input for all agents"""
    trip_id: int
    destination: str
    start_date: str
    end_date: str
    num_travelers: int
    total_budget: float
    currency: str = "INR"


class AgentOutput(BaseModel):
    """Base output for all agents"""
    agent_name: str
    status: str  # success, partial, failed
    data: Dict[str, Any]
    errors: List[str] = []
    timestamp: datetime = None

    def __init__(self, **data):
        super().__init__(**data)
        if self.timestamp is None:
            self.timestamp = datetime.utcnow()


class BaseAgent(ABC):
    """Abstract base class for all agents"""
    
    def __init__(self, name: str):
        self.name = name
        self.status = "initialized"
    
    @abstractmethod
    async def process(self, input_data: Dict[str, Any]) -> AgentOutput:
        """Process the input and return output"""
        pass
    
    @abstractmethod
    def get_input_schema(self) -> Dict[str, Any]:
        """Return the input schema for this agent"""
        pass
    
    @abstractmethod
    def get_output_schema(self) -> Dict[str, Any]:
        """Return the output schema for this agent"""
        pass
    
    def validate_input(self, data: Dict[str, Any]) -> bool:
        """Validate input against the schema"""
        # Basic validation - can be overridden
        return True


class DemoDataProvider:
    """Provides demo/mock data when real APIs are not available"""
    
    @staticmethod
    def get_demo_flights(destination: str, num_travelers: int, budget: float) -> Dict[str, Any]:
        """Return demo flight options"""
        return {
            "options": [
                {
                    "airline": "Air India",
                    "departure": "2024-12-10 08:00",
                    "arrival": "2024-12-10 18:30",
                    "price": budget * 0.3,
                    "duration_hours": 10.5,
                    "stops": 0,
                    "is_demo": True,
                    "label": "DEMO DATA"
                },
                {
                    "airline": "Qatar Airways",
                    "departure": "2024-12-10 14:00",
                    "arrival": "2024-12-11 08:00",
                    "price": budget * 0.35,
                    "duration_hours": 14,
                    "stops": 1,
                    "is_demo": True,
                    "label": "DEMO DATA"
                },
                {
                    "airline": "Indigo",
                    "departure": "2024-12-10 22:00",
                    "arrival": "2024-12-11 08:30",
                    "price": budget * 0.25,
                    "duration_hours": 9.5,
                    "stops": 1,
                    "is_demo": True,
                    "label": "DEMO DATA"
                }
            ],
            "note": "DEMO DATA - NOT LIVE PRICING OR AVAILABILITY"
        }
    
    @staticmethod
    def get_demo_hotels(destination: str, num_travelers: int, duration_days: int, budget: float) -> Dict[str, Any]:
        """Return demo hotel options"""
        daily_hotel_budget = (budget * 0.35) / duration_days
        
        return {
            "options": [
                {
                    "name": f"Budget Hotel in {destination}",
                    "location": destination,
                    "rating": 3.8,
                    "price_per_night": daily_hotel_budget * 0.5,
                    "currency": "INR",
                    "amenities": ["WiFi", "AC", "Breakfast"],
                    "is_demo": True,
                    "label": "DEMO DATA"
                },
                {
                    "name": f"Comfort Hotel in {destination}",
                    "location": destination,
                    "rating": 4.3,
                    "price_per_night": daily_hotel_budget,
                    "currency": "INR",
                    "amenities": ["WiFi", "AC", "Breakfast", "Gym", "Pool"],
                    "is_demo": True,
                    "label": "DEMO DATA"
                },
                {
                    "name": f"Luxury Hotel in {destination}",
                    "location": destination,
                    "rating": 4.8,
                    "price_per_night": daily_hotel_budget * 1.5,
                    "currency": "INR",
                    "amenities": ["WiFi", "AC", "Breakfast", "Gym", "Pool", "Spa", "Restaurant"],
                    "is_demo": True,
                    "label": "DEMO DATA"
                }
            ],
            "note": "DEMO DATA - NOT LIVE PRICING OR AVAILABILITY"
        }
    
    @staticmethod
    def get_demo_activities(destination: str, interests: List[str]) -> Dict[str, Any]:
        """Return demo activity options"""
        tokyo_activities = [
            {"name": "Senso-ji Temple", "category": "Attraction", "cost": 2000, "duration_minutes": 90, "rating": 4.7, "reason": "Ancient Buddhist temple"},
            {"name": "Tokyo Skytree", "category": "Attraction", "cost": 3000, "duration_minutes": 120, "rating": 4.6, "reason": "Observation decks"},
            {"name": "Sushi Making Class", "category": "Food Experience", "cost": 5000, "duration_minutes": 120, "rating": 4.9, "reason": "Traditional preparation"},
            {"name": "Shibuya Crossing", "category": "Tour", "cost": 2000, "duration_minutes": 60, "rating": 4.5, "reason": "Famous pedestrian crossing"},
            {"name": "Meiji Shrine & Forest", "category": "Attraction", "cost": 1500, "duration_minutes": 120, "rating": 4.6, "reason": "Peaceful Shinto shrine"},
            {"name": "Akihabara Electronics", "category": "Shopping", "cost": 3000, "duration_minutes": 180, "rating": 4.4, "reason": "Tech district"},
            {"name": "Harajuku Street Fashion", "category": "Tour", "cost": 2500, "duration_minutes": 120, "rating": 4.5, "reason": "Youth culture hub"},
            {"name": "Ramen Cooking Class", "category": "Food Experience", "cost": 4000, "duration_minutes": 120, "rating": 4.8, "reason": "Noodle making"},
            {"name": "Traditional Tea Ceremony", "category": "Cultural", "cost": 3500, "duration_minutes": 90, "rating": 4.7, "reason": "Japanese tradition"}
        ]

        activity_db = {
            "Paris": [
                {"name": "Eiffel Tower Visit", "category": "Attraction", "cost": 15000, "duration_minutes": 180, "rating": 4.7, "reason": "UNESCO World Heritage site"},
                {"name": "Louvre Museum", "category": "Museum", "cost": 12000, "duration_minutes": 240, "rating": 4.6, "reason": "World's largest art museum"},
                {"name": "French Cooking Class", "category": "Food Experience", "cost": 8000, "duration_minutes": 180, "rating": 4.9, "reason": "Authentic French cuisine"},
                {"name": "Seine River Cruise", "category": "Tour", "cost": 5000, "duration_minutes": 90, "rating": 4.5, "reason": "Scenic landmark views"},
                {"name": "Montmartre Walking Tour", "category": "Tour", "cost": 4000, "duration_minutes": 120, "rating": 4.6, "reason": "Artistic neighborhood"},
                {"name": "Versailles Palace Tour", "category": "Attraction", "cost": 10000, "duration_minutes": 300, "rating": 4.8, "reason": "Royal residence and gardens"},
                {"name": "Wine Tasting Experience", "category": "Food Experience", "cost": 6000, "duration_minutes": 120, "rating": 4.7, "reason": "French wine education"},
                {"name": "Notre-Dame Cathedral", "category": "Attraction", "cost": 8000, "duration_minutes": 120, "rating": 4.6, "reason": "Historic Gothic architecture"},
                {"name": "Latin Quarter Exploration", "category": "Tour", "cost": 3000, "duration_minutes": 180, "rating": 4.4, "reason": "Student area with charm"}
            ],
            "Tokyo": tokyo_activities,
            "Japan": tokyo_activities,
            "Bengaluru": [
                {"name": "Vidhana Soudha", "category": "Attraction", "cost": 2500, "duration_minutes": 90, "rating": 4.5, "reason": "Neo-Gothic architecture"},
                {"name": "Lalbagh Botanical Garden", "category": "Attraction", "cost": 1000, "duration_minutes": 120, "rating": 4.6, "reason": "Historic gardens"},
                {"name": "IT Park Tour", "category": "Tour", "cost": 1500, "duration_minutes": 90, "rating": 4.3, "reason": "Tech industry hub"},
                {"name": "South Indian Cooking Class", "category": "Food Experience", "cost": 4000, "duration_minutes": 120, "rating": 4.8, "reason": "Traditional cuisine"},
                {"name": "Nandi Temple Visit", "category": "Cultural", "cost": 2000, "duration_minutes": 90, "rating": 4.4, "reason": "Ancient temple"},
                {"name": "Forum Mall Shopping", "category": "Shopping", "cost": 3000, "duration_minutes": 180, "rating": 4.2, "reason": "Modern mall"},
                {"name": "Bangalore Palace Tour", "category": "Attraction", "cost": 2000, "duration_minutes": 120, "rating": 4.5, "reason": "Victorian mansion"},
                {"name": "Coffee Plantation Visit", "category": "Food Experience", "cost": 3500, "duration_minutes": 180, "rating": 4.7, "reason": "Coffee tasting"}
            ],
            "Kerala": [
                {"name": "Backwater Houseboat Cruise", "category": "Tour", "cost": 8000, "duration_minutes": 480, "rating": 4.9, "reason": "Scenic lagoon experience"},
                {"name": "Periyar Wildlife Sanctuary", "category": "Attraction", "cost": 5000, "duration_minutes": 240, "rating": 4.6, "reason": "Elephant and nature viewing"},
                {"name": "Ayurveda Spa Treatment", "category": "Food Experience", "cost": 4000, "duration_minutes": 120, "rating": 4.8, "reason": "Traditional wellness"},
                {"name": "Kathakali Dance Performance", "category": "Cultural", "cost": 3000, "duration_minutes": 120, "rating": 4.7, "reason": "Classical art form"},
                {"name": "Tea Plantation Walk", "category": "Tour", "cost": 2500, "duration_minutes": 180, "rating": 4.6, "reason": "Green hills tour"},
                {"name": "Beach Sunset Experience", "category": "Tour", "cost": 2000, "duration_minutes": 120, "rating": 4.5, "reason": "Arabian Sea views"},
                {"name": "Spice Market Tour", "category": "Tour", "cost": 1500, "duration_minutes": 90, "rating": 4.4, "reason": "Spice trading history"},
                {"name": "Fish Curry Cooking", "category": "Food Experience", "cost": 3000, "duration_minutes": 120, "rating": 4.7, "reason": "Kerala seafood"}
            ]
        }

        activities = activity_db.get(destination, activity_db.get("Paris"))

        return {
            "activities": activities,
            "note": "DEMO DATA - NOT LIVE AVAILABILITY OR PRICING"
        }

    @staticmethod
    def get_demo_itinerary(destination: str, duration: int, budget: float, travelers: int,
                          start_date: str = None, interests: List[str] = None) -> Dict[str, Any]:
        """Return demo itinerary with day-by-day activities"""
        activities = DemoDataProvider.get_demo_activities(destination, interests or [])["activities"]

        itinerary_days = []
        themes = ["Cultural", "Adventure", "Food", "Shopping", "Nature", "Relaxation"]

        for day in range(1, duration + 1):
            # Distribute activities across days
            day_activity_count = max(1, len(activities) // duration) if activities else 0
            start_idx = (day - 1) * day_activity_count
            end_idx = start_idx + day_activity_count
            day_activities = activities[start_idx:end_idx] if activities else []

            # Ensure at least one activity per day if activities available
            if not day_activities and activities:
                day_activities = [activities[(day - 1) % len(activities)]]

            day_data = {
                "day_number": day,
                "theme": themes[(day - 1) % len(themes)],
                "activities": [
                    {
                        "name": activity.get("name", f"Activity {i+1}"),
                        "category": activity.get("category", "Tour"),
                        "duration_minutes": activity.get("duration_minutes", 120),
                        "estimated_cost": activity.get("cost", 0),
                        "description": activity.get("reason", f"Experience activity on day {day}")
                    }
                    for i, activity in enumerate(day_activities)
                ]
            }
            itinerary_days.append(day_data)

        return {
            "status": "success",
            "is_demo": True,
            "itinerary_days": itinerary_days,
            "note": "DEMO DATA - NOT REAL ITINERARY"
        }
    
    @staticmethod
    def get_demo_weather(destination: str, date: str) -> Dict[str, Any]:
        """Return demo weather data"""
        return {
            "date": date,
            "destination": destination,
            "temperature": 12,
            "condition": "Partly Cloudy",
            "humidity": 65,
            "wind_speed": 12,
            "is_demo": True,
            "label": "DEMO DATA"
        }
