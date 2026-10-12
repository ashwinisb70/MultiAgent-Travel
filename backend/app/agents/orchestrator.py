import asyncio
from typing import Dict, List, Any
from datetime import datetime
from app.agents.agents import (
    FlightAgent, HotelAgent, ActivityAgent, BudgetAgent,
    RiskAgent, DebateAgent, ItineraryAgent, PreferenceAgent,
    ReplanningAgent, ValidatorAgent
)
from app.agents.base_agent import AgentOutput


class AgentOrchestrator:
    """Orchestrates multi-agent trip planning execution"""
    
    def __init__(self):
        # Initialize all agents
        self.agents = {
            "flight": FlightAgent(),
            "hotel": HotelAgent(),
            "activity": ActivityAgent(),
            "budget": BudgetAgent(),
            "preference": PreferenceAgent(),
            "risk": RiskAgent(),
            "debate": DebateAgent(),
            "itinerary": ItineraryAgent(),
            "replan": ReplanningAgent(),
            "validator": ValidatorAgent()
        }
        
        self.execution_history = []
        self.results = {}
    
    async def generate_trip(self, trip_input: Dict[str, Any]) -> Dict[str, Any]:
        """Execute full trip generation workflow"""
        
        # Phase 1: Parallel independent tasks
        independent_tasks = [
            self.agents["flight"].process(trip_input),
            self.agents["hotel"].process(trip_input),
            self.agents["activity"].process(trip_input),
            self.agents["budget"].process(trip_input),
            self.agents["preference"].process(trip_input),
        ]
        
        results = await asyncio.gather(*independent_tasks)
        
        # Store results
        flight_result = results[0]
        hotel_result = results[1]
        activity_result = results[2]
        budget_result = results[3]
        preference_result = results[4]
        
        self.results["flight"] = flight_result
        self.results["hotel"] = hotel_result
        self.results["activity"] = activity_result
        self.results["budget"] = budget_result
        self.results["preference"] = preference_result
        
        # Phase 2: Risk analysis (depends on budget)
        risk_input = {
            **trip_input,
            "estimated_cost": budget_result.data.get("estimated_cost", 0),
            "budget_breakdown": budget_result.data.get("breakdown", {})
        }
        risk_result = await self.agents["risk"].process(risk_input)
        self.results["risk"] = risk_result
        
        # Phase 3: Debate/Critique (depends on all previous results)
        debate_input = {
            "selected_hotel": hotel_result.data.get("selected_hotel", {}),
            "selected_flight": flight_result.data.get("selected_flight", {}),
            "activities": activity_result.data.get("recommended_activities", []),
            "budget_breakdown": budget_result.data.get("breakdown", {})
        }
        debate_result = await self.agents["debate"].process(debate_input)
        self.results["debate"] = debate_result
        
        # Phase 4: Itinerary generation
        itinerary_input = {
            "activities": activity_result.data.get("recommended_activities", []),
            "start_date": trip_input.get("start_date"),
            "duration_days": trip_input.get("duration_days", 5)
        }
        itinerary_result = await self.agents["itinerary"].process(itinerary_input)
        self.results["itinerary"] = itinerary_result
        
        # Phase 5: Final validation
        validator_input = {
            "trip_plan": {
                "flights": flight_result.data.get("flights", []),
                "hotel": hotel_result.data.get("selected_hotel"),
                "activities": activity_result.data.get("activities", []),
                "budget": budget_result.data
            }
        }
        validator_result = await self.agents["validator"].process(validator_input)
        self.results["validator"] = validator_result
        
        # Compile all results
        return {
            "status": "success",
            "trip": trip_input,
            "agents_executed": list(self.results.keys()),
            "results": {
                key: {
                    "agent_name": result.agent_name,
                    "status": result.status,
                    "data": result.data,
                    "errors": result.errors
                }
                for key, result in self.results.items()
            },
            "summary": {
                "flights": flight_result.data.get("flights", []),
                "hotel": hotel_result.data.get("selected_hotel"),
                "activities": activity_result.data.get("recommended_activities", []),
                "budget": budget_result.data,
                "risks": risk_result.data.get("risks", []),
                "decisions": debate_result.data.get("decisions", []),
                "readiness_score": validator_result.data.get("readiness_score", 0)
            }
        }
    
    async def replan_trip(self, trip_input: Dict[str, Any], issue_type: str) -> Dict[str, Any]:
        """Replan trip based on changes"""
        
        replan_input = {
            **trip_input,
            "issue_type": issue_type,
            "current_itinerary": trip_input.get("current_itinerary", {})
        }
        
        replan_result = await self.agents["replan"].process(replan_input)
        
        # Re-run validator if changes made
        if replan_result.data.get("total_changes", 0) > 0:
            validator_result = await self.agents["validator"].process(trip_input)
            return {
                "status": "success",
                "recommendations": replan_result.data.get("recommendations", []),
                "new_readiness_score": validator_result.data.get("readiness_score", 0)
            }
        
        return {
            "status": "success",
            "recommendations": replan_result.data.get("recommendations", []),
            "message": "No changes needed"
        }
    
    async def simulate_changes(self, trip_input: Dict[str, Any], changes: Dict[str, Any]) -> Dict[str, Any]:
        """Simulate trip changes"""
        
        # Create modified input
        simulated_input = {
            **trip_input,
            **changes  # Override with simulated changes
        }
        
        # Run affected agents
        budget_result = await self.agents["budget"].process(simulated_input)
        risk_result = await self.agents["risk"].process({
            **simulated_input,
            "estimated_cost": budget_result.data.get("estimated_cost", 0)
        })
        
        return {
            "status": "success",
            "changed_parameters": changes,
            "new_budget": budget_result.data.get("estimated_cost", 0),
            "original_budget": trip_input.get("estimated_cost", 0),
            "cost_difference": budget_result.data.get("estimated_cost", 0) - trip_input.get("estimated_cost", 0),
            "new_risks": risk_result.data.get("risks", [])
        }
    
    def get_agent(self, agent_name: str) -> Any:
        """Get a specific agent"""
        return self.agents.get(agent_name)
    
    def get_all_agents(self) -> Dict[str, Any]:
        """Get all agents"""
        return self.agents
