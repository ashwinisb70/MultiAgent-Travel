import pytest
import asyncio
from app.agents.agents import (
    FlightAgent, HotelAgent, ActivityAgent, BudgetAgent,
    RiskAgent, DebateAgent, ItineraryAgent
)
from app.agents.orchestrator import AgentOrchestrator


@pytest.mark.asyncio
async def test_flight_agent():
    """Test Flight Agent"""
    agent = FlightAgent()
    input_data = {
        "destination": "Paris",
        "num_travelers": 2,
        "total_budget": 100000,
        "start_date": "2024-12-10T00:00:00",
        "end_date": "2024-12-15T00:00:00"
    }
    
    result = await agent.process(input_data)
    
    assert result.agent_name == "Flight Agent"
    assert result.status == "success"
    assert "flights" in result.data
    assert "selected_flight" in result.data


@pytest.mark.asyncio
async def test_hotel_agent():
    """Test Hotel Agent"""
    agent = HotelAgent()
    input_data = {
        "destination": "Paris",
        "num_travelers": 2,
        "total_budget": 100000,
        "start_date": "2024-12-10T00:00:00",
        "end_date": "2024-12-15T00:00:00"
    }
    
    result = await agent.process(input_data)
    
    assert result.agent_name == "Hotel Agent"
    assert result.status == "success"
    assert "hotels" in result.data


@pytest.mark.asyncio
async def test_budget_agent():
    """Test Budget Agent"""
    agent = BudgetAgent()
    input_data = {
        "total_budget": 100000,
        "num_travelers": 2,
        "duration_days": 5
    }
    
    result = await agent.process(input_data)
    
    assert result.agent_name == "Budget Agent"
    assert result.status == "success"
    assert "breakdown" in result.data
    assert "estimated_cost" in result.data
    assert "remaining_budget" in result.data


@pytest.mark.asyncio
async def test_risk_agent():
    """Test Risk Agent"""
    agent = RiskAgent()
    input_data = {
        "total_budget": 100000,
        "estimated_cost": 95000,
        "num_travelers": 2
    }
    
    result = await agent.process(input_data)
    
    assert result.agent_name == "Risk Agent"
    assert result.status == "success"
    assert "risks" in result.data


@pytest.mark.asyncio
async def test_orchestrator():
    """Test Agent Orchestrator"""
    orchestrator = AgentOrchestrator()
    
    trip_input = {
        "trip_id": 1,
        "destination": "Paris",
        "starting_location": "Bengaluru",
        "start_date": "2024-12-10T00:00:00",
        "end_date": "2024-12-15T00:00:00",
        "num_travelers": 2,
        "total_budget": 150000,
        "currency": "INR",
        "interests": ["Museums", "Food"],
        "travelers": [],
        "duration_days": 5
    }
    
    result = await orchestrator.generate_trip(trip_input)
    
    assert result["status"] == "success"
    assert "results" in result
    assert "summary" in result
    assert len(result["agents_executed"]) > 0
