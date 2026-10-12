from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import List, Optional
import asyncio
from datetime import datetime, timedelta

from app.database.config import get_db
from app.models.models import User, Trip
from app.schemas.schemas import (
    TripCreate, TripUpdate, TripResponse, TripDetailResponse,
    AgentRunResponse, ReadinessScoreResponse, BudgetSummary,
    SimulationRequest, SimulationResponse, TravelCreate,
    TripGenerationRequest
)
from app.services.trip_service import (
    TripService, TravelerService, ItineraryService,
    BudgetService, AgentService, RiskService, BookingService
)
from app.services.ai_provider import AIProvider
from app.agents.orchestrator import AgentOrchestrator
from app.api.auth import get_current_user

router = APIRouter(prefix="/trips")

orchestrator = AgentOrchestrator()


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


@router.post("", response_model=TripResponse, status_code=status.HTTP_201_CREATED)
async def create_trip(
    trip_data: TripCreate,
    user: User = Depends(get_authenticated_user),
    db: Session = Depends(get_db)
):
    """Create a new trip"""
    trip = TripService.create_trip(db, user.id, trip_data)
    return trip


@router.get("", response_model=List[TripResponse])
async def get_trips(
    skip: int = 0,
    limit: int = 10,
    user: User = Depends(get_authenticated_user),
    db: Session = Depends(get_db)
):
    """Get all trips for current user"""
    trips = TripService.get_user_trips(db, user.id, skip, limit)
    return trips


@router.get("/{trip_id}", response_model=TripDetailResponse)
async def get_trip(
    trip_id: int,
    user: User = Depends(get_authenticated_user),
    db: Session = Depends(get_db)
):
    """Get trip details"""
    trip = TripService.get_trip(db, trip_id, user.id)

    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found"
        )

    return trip


@router.put("/{trip_id}", response_model=TripResponse)
async def update_trip(
    trip_id: int,
    trip_update: TripUpdate,
    user: User = Depends(get_authenticated_user),
    db: Session = Depends(get_db)
):
    """Update trip"""
    trip = TripService.get_trip(db, trip_id, user.id)

    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found"
        )

    trip = TripService.update_trip(db, trip, trip_update)
    return trip


@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_trip(
    trip_id: int,
    user: User = Depends(get_authenticated_user),
    db: Session = Depends(get_db)
):
    """Delete trip"""
    trip = TripService.get_trip(db, trip_id, user.id)

    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found"
        )

    TripService.delete_trip(db, trip)
    return None


@router.post("/{trip_id}/generate", response_model=AgentRunResponse)
async def generate_trip(
    trip_id: int,
    generation_data: TripGenerationRequest,
    user: User = Depends(get_authenticated_user),
    db: Session = Depends(get_db)
):
    """Generate trip using multi-agent system"""
    trip = TripService.get_trip(db, trip_id, user.id)

    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found"
        )

    # Create agent run
    run = AgentService.create_agent_run(db, trip_id, "generation")

    try:
        # Prepare input for agents
        trip_input = {
            "trip_id": trip_id,
            "destination": trip.destination,
            "starting_location": trip.starting_location,
            "start_date": trip.start_date.isoformat(),
            "end_date": trip.end_date.isoformat(),
            "num_travelers": trip.num_travelers,
            "total_budget": trip.total_budget,
            "currency": trip.currency,
            "interests": generation_data.interests,
            "travelers": [t.model_dump() for t in generation_data.travelers],
            "duration_days": (trip.end_date - trip.start_date).days,
            "food_preferences": generation_data.food_preferences,
            "hotel_preference": generation_data.hotel_preference,
            "transportation_preference": generation_data.transportation_preference
        }

        # Execute agent orchestration
        result = await orchestrator.generate_trip(trip_input)

        # Update run status
        AgentService.update_agent_run_status(db, run, "completed")

        # Save agent results
        for agent_name, agent_result in result["results"].items():
            AgentService.save_agent_result(
                db,
                run.id,
                agent_result["agent_name"],
                agent_result["status"],
                agent_result.get("data", {}),
                agent_result.get("data", {}),
                None if agent_result["status"] == "success" else " ".join(agent_result.get("errors", []))
            )

        # Save generated itinerary to database
        try:
            ItineraryService.save_generated_itinerary(db, trip, result)
        except Exception as e:
            print(f"Warning: Failed to save itinerary: {str(e)}")
            # Don't fail the entire operation if itinerary save fails

        # Update trip status and score
        TripService.mark_trip_generated(db, trip)
        TripService.update_readiness_score(db, trip, result["summary"].get("readiness_score", 0))

        return run

    except Exception as e:
        AgentService.update_agent_run_status(db, run, "failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Trip generation failed: {str(e)}"
        )


@router.get("/{trip_id}/budget", response_model=BudgetSummary)
async def get_budget(
    trip_id: int,
    user: User = Depends(get_authenticated_user),
    db: Session = Depends(get_db)
):
    """Get trip budget summary"""
    trip = TripService.get_trip(db, trip_id, user.id)

    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found"
        )

    budget_summary = BudgetService.calculate_budget_summary(db, trip_id)
    return budget_summary


@router.post("/{trip_id}/simulate", response_model=dict)
async def simulate_trip(
    trip_id: int,
    simulation_data: SimulationRequest,
    user: User = Depends(get_authenticated_user),
    db: Session = Depends(get_db)
):
    """Simulate trip changes"""
    trip = TripService.get_trip(db, trip_id, user.id)

    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found"
        )

    try:
        trip_input = {
            "trip_id": trip_id,
            "destination": trip.destination,
            "start_date": trip.start_date.isoformat(),
            "end_date": trip.end_date.isoformat(),
            "num_travelers": simulation_data.num_travelers or trip.num_travelers,
            "total_budget": simulation_data.budget or trip.total_budget,
            "estimated_cost": 80000,  # Mock value
            "currency": trip.currency
        }

        changes = simulation_data.model_dump(exclude_none=True)
        result = await orchestrator.simulate_changes(trip_input, changes)

        return result

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Simulation failed: {str(e)}"
        )


@router.get("/{trip_id}/risks", response_model=dict)
async def get_risks(
    trip_id: int,
    user: User = Depends(get_authenticated_user),
    db: Session = Depends(get_db)
):
    """Get trip risks"""
    trip = TripService.get_trip(db, trip_id, user.id)

    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found"
        )

    risks = RiskService.get_trip_risks(db, trip_id)

    return {
        "risks": risks,
        "risk_count": len(risks),
        "high_severity_count": len([r for r in risks if r.severity == "high"])
    }


@router.get("/{trip_id}/readiness", response_model=ReadinessScoreResponse)
async def get_readiness(
    trip_id: int,
    user: User = Depends(get_authenticated_user),
    db: Session = Depends(get_db)
):
    """Get trip readiness score using authoritative calculation"""
    trip = TripService.get_trip(db, trip_id, user.id)

    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found"
        )

    # Use the AUTHORITATIVE readiness calculation service
    from app.services.trip_service import ReadinessService
    readiness_data = ReadinessService.calculate_readiness(db, trip)

    return {
        "overall_score": readiness_data["overall_score"],
        "checks": readiness_data["checks"],
        "calculation_method": readiness_data["calculation_method"],
        "recommendation": readiness_data["recommendation"]
    }


@router.post("/{trip_id}/duplicate", response_model=TripResponse)
async def duplicate_trip(
    trip_id: int,
    user: User = Depends(get_authenticated_user),
    db: Session = Depends(get_db)
):
    """Duplicate a trip"""
    trip = TripService.get_trip(db, trip_id, user.id)

    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found"
        )

    new_trip = TripService.duplicate_trip(db, trip, user.id)
    return new_trip


@router.get("/ai-provider-status")
async def get_ai_provider_status(
    user: User = Depends(get_authenticated_user),
    db: Session = Depends(get_db)
):
    """Get current AI provider status (demo vs real)"""
    return AIProvider.get_provider_status()


@router.get("/ai/test-connection")
async def test_ai_connection(
    user: User = Depends(get_authenticated_user),
    db: Session = Depends(get_db)
):
    """Test Anthropic API connection (if configured)"""
    status = AIProvider.get_provider_status()

    # If not using Anthropic, return current status
    if status.get("mode") != "anthropic":
        return {
            "status": "OK",
            "message": "Demo mode active - Anthropic testing not applicable",
            "provider_info": status,
            "can_test_anthropic": False,
            "anthropic_available": AIProvider.has_api_key()
        }

    # If Anthropic selected but no key, report that
    if not AIProvider.has_api_key():
        return {
            "status": "INCOMPLETE",
            "message": "Anthropic configured as provider but ANTHROPIC_API_KEY not set in .env",
            "provider_info": status,
            "can_test_anthropic": False,
            "anthropic_available": False,
            "next_steps": "Add ANTHROPIC_API_KEY=sk-ant-... to backend/.env and restart backend"
        }

    # Try to initialize Anthropic client
    from app.services.ai_provider import AnthropicAIProvider
    client, error = AnthropicAIProvider._get_client()

    if not client:
        return {
            "status": "ERROR",
            "message": f"Cannot initialize Anthropic client: {error}",
            "provider_info": status,
            "can_test_anthropic": False,
            "anthropic_available": True,
            "error_details": error
        }

    # Try a simple API call
    try:
        test_message = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=50,
            messages=[
                {
                    "role": "user",
                    "content": "Reply with 'OK' if you can see this."
                }
            ]
        )

        return {
            "status": "OK",
            "message": "Anthropic API connection successful!",
            "provider_info": status,
            "can_test_anthropic": True,
            "anthropic_available": True,
            "api_response": test_message.content[0].text[:100],
            "model": "claude-3-5-sonnet-20241022"
        }
    except Exception as e:
        error_msg = str(e)
        if "401" in error_msg or "authentication" in error_msg.lower():
            return {
                "status": "AUTH_ERROR",
                "message": "Anthropic API key authentication failed",
                "provider_info": status,
                "can_test_anthropic": False,
                "anthropic_available": True,
                "error_details": "API key is invalid or expired",
                "next_steps": "Check ANTHROPIC_API_KEY in .env"
            }
        elif "rate_limit" in error_msg.lower():
            return {
                "status": "RATE_LIMIT",
                "message": "Anthropic API rate limit exceeded",
                "provider_info": status,
                "can_test_anthropic": False,
                "anthropic_available": True,
                "error_details": error_msg
            }
        else:
            return {
                "status": "ERROR",
                "message": f"Anthropic API error: {error_msg}",
                "provider_info": status,
                "can_test_anthropic": False,
                "anthropic_available": True,
                "error_details": error_msg
            }

