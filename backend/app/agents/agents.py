from datetime import datetime, timedelta
from typing import Dict, Any, List
from app.agents.base_agent import BaseAgent, AgentOutput, DemoDataProvider
import json


class FlightAgent(BaseAgent):
    """Handles flight search and booking"""
    
    def __init__(self):
        super().__init__("Flight Agent")
    
    async def process(self, input_data: Dict[str, Any]) -> AgentOutput:
        """Process flight bookings"""
        try:
            destination = input_data.get("destination", "Paris")
            num_travelers = input_data.get("num_travelers", 1)
            budget = input_data.get("total_budget", 0)
            
            # Get demo data (in production, this would call real APIs)
            flights = DemoDataProvider.get_demo_flights(destination, num_travelers, budget)
            
            return AgentOutput(
                agent_name=self.name,
                status="success",
                data={
                    "flights": flights["options"],
                    "selected_flight": flights["options"][0] if flights["options"] else None,
                    "note": flights["note"]
                }
            )
        except Exception as e:
            return AgentOutput(
                agent_name=self.name,
                status="failed",
                data={},
                errors=[str(e)]
            )
    
    def get_input_schema(self) -> Dict[str, Any]:
        return {
            "destination": "string",
            "num_travelers": "integer",
            "start_date": "datetime",
            "end_date": "datetime",
            "total_budget": "float"
        }
    
    def get_output_schema(self) -> Dict[str, Any]:
        return {
            "flights": "list",
            "selected_flight": "object",
            "note": "string"
        }


class HotelAgent(BaseAgent):
    """Handles hotel search and recommendations"""
    
    def __init__(self):
        super().__init__("Hotel Agent")
    
    async def process(self, input_data: Dict[str, Any]) -> AgentOutput:
        """Process hotel bookings"""
        try:
            destination = input_data.get("destination", "Paris")
            num_travelers = input_data.get("num_travelers", 1)
            start_date = input_data.get("start_date")
            end_date = input_data.get("end_date")
            budget = input_data.get("total_budget", 0)
            
            # Calculate duration
            duration_days = 5  # Default
            if start_date and end_date:
                duration_days = (datetime.fromisoformat(end_date) - datetime.fromisoformat(start_date)).days
            
            hotels = DemoDataProvider.get_demo_hotels(destination, num_travelers, duration_days, budget)
            
            return AgentOutput(
                agent_name=self.name,
                status="success",
                data={
                    "hotels": hotels["options"],
                    "selected_hotel": hotels["options"][1] if len(hotels["options"]) > 1 else hotels["options"][0],
                    "note": hotels["note"]
                }
            )
        except Exception as e:
            return AgentOutput(
                agent_name=self.name,
                status="failed",
                data={},
                errors=[str(e)]
            )
    
    def get_input_schema(self) -> Dict[str, Any]:
        return {
            "destination": "string",
            "num_travelers": "integer",
            "start_date": "datetime",
            "end_date": "datetime",
            "total_budget": "float"
        }
    
    def get_output_schema(self) -> Dict[str, Any]:
        return {
            "hotels": "list",
            "selected_hotel": "object",
            "note": "string"
        }


class ActivityAgent(BaseAgent):
    """Handles activity recommendations"""
    
    def __init__(self):
        super().__init__("Activity Agent")
    
    async def process(self, input_data: Dict[str, Any]) -> AgentOutput:
        """Process activity recommendations"""
        try:
            destination = input_data.get("destination", "Paris")
            interests = input_data.get("interests", ["Museums", "Food"])
            
            activities = DemoDataProvider.get_demo_activities(destination, interests)
            
            return AgentOutput(
                agent_name=self.name,
                status="success",
                data={
                    "activities": activities["activities"],
                    "recommended_activities": activities["activities"][:3],
                    "note": activities["note"]
                }
            )
        except Exception as e:
            return AgentOutput(
                agent_name=self.name,
                status="failed",
                data={},
                errors=[str(e)]
            )
    
    def get_input_schema(self) -> Dict[str, Any]:
        return {
            "destination": "string",
            "interests": "array",
            "budget": "float"
        }
    
    def get_output_schema(self) -> Dict[str, Any]:
        return {
            "activities": "list",
            "recommended_activities": "list"
        }


class BudgetAgent(BaseAgent):
    """Calculates and manages budget"""
    
    def __init__(self):
        super().__init__("Budget Agent")
    
    async def process(self, input_data: Dict[str, Any]) -> AgentOutput:
        """Process budget calculation"""
        try:
            total_budget = input_data.get("total_budget", 100000)
            num_travelers = input_data.get("num_travelers", 1)
            duration_days = input_data.get("duration_days", 5)
            
            # Allocate budget
            flights_cost = total_budget * 0.3
            accommodation_cost = total_budget * 0.35
            food_cost = total_budget * 0.15
            activities_cost = total_budget * 0.12
            transport_cost = total_budget * 0.05
            miscellaneous = total_budget * 0.03
            
            total_estimated = (flights_cost + accommodation_cost + food_cost + 
                             activities_cost + transport_cost + miscellaneous)
            
            return AgentOutput(
                agent_name=self.name,
                status="success",
                data={
                    "total_budget": total_budget,
                    "estimated_cost": total_estimated,
                    "remaining_budget": total_budget - total_estimated,
                    "utilization_percentage": (total_estimated / total_budget * 100) if total_budget > 0 else 0,
                    "cost_per_traveler": total_estimated / num_travelers if num_travelers > 0 else 0,
                    "breakdown": {
                        "Flights": flights_cost,
                        "Accommodation": accommodation_cost,
                        "Food": food_cost,
                        "Activities": activities_cost,
                        "Local Transport": transport_cost,
                        "Miscellaneous": miscellaneous
                    }
                }
            )
        except Exception as e:
            return AgentOutput(
                agent_name=self.name,
                status="failed",
                data={},
                errors=[str(e)]
            )
    
    def get_input_schema(self) -> Dict[str, Any]:
        return {
            "total_budget": "float",
            "num_travelers": "integer",
            "duration_days": "integer"
        }
    
    def get_output_schema(self) -> Dict[str, Any]:
        return {
            "total_budget": "float",
            "estimated_cost": "float",
            "remaining_budget": "float",
            "breakdown": "object"
        }


class RiskAgent(BaseAgent):
    """Identifies and assesses travel risks"""
    
    def __init__(self):
        super().__init__("Risk Agent")
    
    async def process(self, input_data: Dict[str, Any]) -> AgentOutput:
        """Identify risks in the trip"""
        try:
            total_budget = input_data.get("total_budget", 100000)
            estimated_cost = input_data.get("estimated_cost", 80000)
            num_travelers = input_data.get("num_travelers", 1)
            
            risks = []
            
            # Check budget overrun
            if estimated_cost > total_budget:
                risks.append({
                    "severity": "high",
                    "category": "Budget Overrun",
                    "description": f"Estimated cost (₹{estimated_cost}) exceeds budget (₹{total_budget})",
                    "mitigation": "Consider reducing accommodation quality or activity count"
                })
            
            # Check budget utilization
            utilization = (estimated_cost / total_budget * 100) if total_budget > 0 else 0
            if utilization > 90:
                risks.append({
                    "severity": "medium",
                    "category": "High Budget Utilization",
                    "description": f"Trip budget is {utilization:.1f}% utilized, leaving minimal contingency",
                    "mitigation": "Consider increasing budget for emergencies"
                })
            
            return AgentOutput(
                agent_name=self.name,
                status="success",
                data={
                    "risks": risks,
                    "risk_count": len(risks),
                    "high_severity_count": len([r for r in risks if r["severity"] == "high"])
                }
            )
        except Exception as e:
            return AgentOutput(
                agent_name=self.name,
                status="failed",
                data={},
                errors=[str(e)]
            )
    
    def get_input_schema(self) -> Dict[str, Any]:
        return {
            "total_budget": "float",
            "estimated_cost": "float",
            "num_travelers": "integer"
        }
    
    def get_output_schema(self) -> Dict[str, Any]:
        return {
            "risks": "list",
            "risk_count": "integer"
        }


class DebateAgent(BaseAgent):
    """Reviews and critiques other agent decisions"""
    
    def __init__(self):
        super().__init__("Debate/Critic Agent")
    
    async def process(self, input_data: Dict[str, Any]) -> AgentOutput:
        """Critique and review decisions"""
        try:
            selected_hotel = input_data.get("selected_hotel", {})
            selected_flight = input_data.get("selected_flight", {})
            activities = input_data.get("activities", [])
            budget_breakdown = input_data.get("budget_breakdown", {})
            
            decisions = []
            
            # Review hotel selection
            if selected_hotel:
                decisions.append({
                    "decision": f"Selected {selected_hotel.get('name', 'Hotel')}",
                    "reason": "Balances comfort and cost within budget",
                    "alternatives": ["Budget option for more savings", "Luxury option for premium experience"],
                    "impact": "Accommodation is 35% of total budget"
                })
            
            # Review flight selection
            if selected_flight:
                decisions.append({
                    "decision": f"Selected {selected_flight.get('airline', 'Airline')} flight",
                    "reason": "Best balance of price, duration, and convenience",
                    "alternatives": ["Cheaper flight with longer duration", "Premium flight with better timing"],
                    "impact": "Flight is 30% of total budget"
                })
            
            # Review activities
            if activities:
                decisions.append({
                    "decision": f"Selected {len(activities)} activities",
                    "reason": "Mix of must-see attractions and authentic experiences",
                    "alternatives": ["More museums for cultural focus", "More food experiences for culinary focus"],
                    "impact": f"Activities are {len(activities)} curated recommendations"
                })
            
            return AgentOutput(
                agent_name=self.name,
                status="success",
                data={
                    "decisions": decisions,
                    "overall_recommendation": "Trip plan is well-balanced and achievable",
                    "confidence": 0.85
                }
            )
        except Exception as e:
            return AgentOutput(
                agent_name=self.name,
                status="failed",
                data={},
                errors=[str(e)]
            )
    
    def get_input_schema(self) -> Dict[str, Any]:
        return {
            "selected_hotel": "object",
            "selected_flight": "object",
            "activities": "array",
            "budget_breakdown": "object"
        }
    
    def get_output_schema(self) -> Dict[str, Any]:
        return {
            "decisions": "list",
            "overall_recommendation": "string"
        }


class ItineraryAgent(BaseAgent):
    """Creates day-by-day itinerary using AI or demo data"""

    def __init__(self):
        super().__init__("Itinerary Agent")

    async def process(self, input_data: Dict[str, Any]) -> AgentOutput:
        """Create itinerary using real AI or demo data"""
        try:
            from app.services.ai_provider import get_ai_provider, AIProvider

            # Check if real AI is available
            provider = get_ai_provider()
            is_real_ai = AIProvider.is_real_ai()

            destination = input_data.get("destination", "")
            duration_days = input_data.get("duration_days", 5)
            budget = input_data.get("total_budget", 0)
            travelers = input_data.get("num_travelers", 1)
            start_date = input_data.get("start_date")
            interests = input_data.get("interests", [])
            hotel_preference = input_data.get("hotel_preference")
            transportation_preference = input_data.get("transportation_preference")

            # Generate itinerary using selected provider
            result = provider.generate_trip_itinerary(
                destination=destination,
                duration=duration_days,
                budget=budget,
                travelers=travelers,
                start_date=start_date,
                interests=interests,
                hotel_preference=hotel_preference,
                transportation_preference=transportation_preference
            )

            # Extract itinerary days or create from activities
            if result.get("status") == "success" and "itinerary_days" in result:
                itinerary_days = result["itinerary_days"]
            elif result.get("status") == "error" and result.get("fallback_to_demo"):
                # Fallback to demo if real AI failed
                fallback_result = DemoDataProvider.get_demo_itinerary(
                    destination, duration_days, budget, travelers, start_date, interests
                )
                itinerary_days = fallback_result.get("itinerary_days", [])
            else:
                # Use demo data if not using real AI
                activities = input_data.get("activities", [])
                itinerary_days = []
                for day in range(1, duration_days + 1):
                    itinerary_days.append({
                        "day_number": day,
                        "theme": "Cultural" if day % 2 == 0 else "Adventure",
                        "activities": activities[day-1:day+1] if day < len(activities) else activities[-1:] if activities else []
                    })

            return AgentOutput(
                agent_name=self.name,
                status="success",
                data={
                    "itinerary_days": itinerary_days,
                    "total_days": duration_days,
                    "activities_scheduled": sum(len(day.get("activities", [])) for day in itinerary_days),
                    "ai_provider": "Anthropic (Claude)" if is_real_ai else "Demo",
                    "ai_status": result.get("status"),
                    "ai_message": result.get("message", "")
                }
            )
        except Exception as e:
            return AgentOutput(
                agent_name=self.name,
                status="failed",
                data={},
                errors=[str(e)]
            )
    
    def get_input_schema(self) -> Dict[str, Any]:
        return {
            "activities": "array",
            "start_date": "datetime",
            "duration_days": "integer"
        }
    
    def get_output_schema(self) -> Dict[str, Any]:
        return {
            "itinerary_days": "list",
            "total_days": "integer"
        }


class PreferenceAgent(BaseAgent):
    """Analyzes group preferences"""
    
    def __init__(self):
        super().__init__("Preference Agent")
    
    async def process(self, input_data: Dict[str, Any]) -> AgentOutput:
        """Analyze preferences"""
        try:
            travelers = input_data.get("travelers", [])
            
            # Aggregate preferences
            preference_analysis = {
                "travelers": len(travelers),
                "interests": {},
                "budget_preferences": {},
                "activity_preferences": {}
            }
            
            for traveler in travelers:
                for interest in traveler.get("interests", []):
                    preference_analysis["interests"][interest] = preference_analysis["interests"].get(interest, 0) + 1
            
            return AgentOutput(
                agent_name=self.name,
                status="success",
                data=preference_analysis
            )
        except Exception as e:
            return AgentOutput(
                agent_name=self.name,
                status="failed",
                data={},
                errors=[str(e)]
            )
    
    def get_input_schema(self) -> Dict[str, Any]:
        return {
            "travelers": "array"
        }
    
    def get_output_schema(self) -> Dict[str, Any]:
        return {
            "travelers": "integer",
            "interests": "object"
        }


class ReplanningAgent(BaseAgent):
    """Handles dynamic replanning"""
    
    def __init__(self):
        super().__init__("Replanning Agent")
    
    async def process(self, input_data: Dict[str, Any]) -> AgentOutput:
        """Replan trip based on changes"""
        try:
            issue_type = input_data.get("issue_type", "weather")
            
            recommendations = []
            
            if issue_type == "weather":
                recommendations.append({
                    "issue": "Rainy weather forecast",
                    "change": "Move indoor activities to rainy day",
                    "affected_day": 1,
                    "impact": "Minimal schedule changes"
                })
            elif issue_type == "budget":
                recommendations.append({
                    "issue": "Budget overrun",
                    "change": "Replace expensive restaurant with local cuisine",
                    "savings": 5000,
                    "impact": "Similar experience, significant savings"
                })
            
            return AgentOutput(
                agent_name=self.name,
                status="success",
                data={
                    "recommendations": recommendations,
                    "total_changes": len(recommendations)
                }
            )
        except Exception as e:
            return AgentOutput(
                agent_name=self.name,
                status="failed",
                data={},
                errors=[str(e)]
            )
    
    def get_input_schema(self) -> Dict[str, Any]:
        return {
            "issue_type": "string",
            "current_itinerary": "object"
        }
    
    def get_output_schema(self) -> Dict[str, Any]:
        return {
            "recommendations": "list",
            "total_changes": "integer"
        }


class ValidatorAgent(BaseAgent):
    """Final validation of trip plan"""
    
    def __init__(self):
        super().__init__("Final Validator Agent")
    
    async def process(self, input_data: Dict[str, Any]) -> AgentOutput:
        """Validate complete trip plan"""
        try:
            checks = [
                {"item": "All flights booked", "status": "Completed"},
                {"item": "All accommodations reserved", "status": "Completed"},
                {"item": "Activities scheduled", "status": "Completed"},
                {"item": "Budget allocated", "status": "Completed"},
                {"item": "Visas/documents", "status": "Pending"},
                {"item": "Travel insurance", "status": "Pending"}
            ]
            
            completed = len([c for c in checks if c["status"] == "Completed"])
            total = len(checks)
            readiness_score = (completed / total * 100) if total > 0 else 0
            
            return AgentOutput(
                agent_name=self.name,
                status="success",
                data={
                    "checks": checks,
                    "readiness_score": readiness_score,
                    "is_ready": readiness_score >= 70
                }
            )
        except Exception as e:
            return AgentOutput(
                agent_name=self.name,
                status="failed",
                data={},
                errors=[str(e)]
            )
    
    def get_input_schema(self) -> Dict[str, Any]:
        return {
            "trip_plan": "object"
        }
    
    def get_output_schema(self) -> Dict[str, Any]:
        return {
            "checks": "list",
            "readiness_score": "float"
        }
