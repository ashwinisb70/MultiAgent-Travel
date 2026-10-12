"""
AI Provider abstraction - supports both demo and real AI modes
"""
import os
import json
from enum import Enum
from typing import Dict, Any, Optional
from datetime import datetime

class AIMode(str, Enum):
    DEMO = "demo"
    ANTHROPIC = "anthropic"
    GEMINI = "gemini"

class AIProvider:
    """Abstract base for AI providers"""

    @staticmethod
    def get_mode() -> AIMode:
        """Get configured AI mode"""
        mode = os.getenv("LLM_PROVIDER", "demo").lower()
        if mode == "demo":
            return AIMode.DEMO
        elif mode == "gemini":
            return AIMode.GEMINI
        else:
            return AIMode.ANTHROPIC

    @staticmethod
    def is_real_ai() -> bool:
        """Check if real AI is configured and has API key"""
        mode = AIProvider.get_mode()
        if mode == AIMode.ANTHROPIC:
            return bool(os.getenv("ANTHROPIC_API_KEY"))
        elif mode == AIMode.GEMINI:
            return bool(os.getenv("GEMINI_API_KEY"))
        return False

    @staticmethod
    def has_api_key() -> bool:
        """Check if ANTHROPIC_API_KEY is configured"""
        return bool(os.getenv("ANTHROPIC_API_KEY"))

    @staticmethod
    def get_provider_status() -> Dict[str, Any]:
        """Get current AI provider status"""
        mode = AIProvider.get_mode()
        anthropic_key = bool(os.getenv("ANTHROPIC_API_KEY"))
        gemini_key = bool(os.getenv("GEMINI_API_KEY"))

        is_active_anthropic = mode == AIMode.ANTHROPIC and anthropic_key
        is_active_gemini = mode == AIMode.GEMINI and gemini_key

        return {
            "mode": mode.value,
            "is_demo": mode == AIMode.DEMO,
            "is_real": is_active_anthropic or is_active_gemini,
            "anthropic_key_configured": anthropic_key,
            "gemini_key_configured": gemini_key,
            "anthropic_configured_but_not_active": mode != AIMode.ANTHROPIC and anthropic_key,
            "gemini_configured_but_not_active": mode != AIMode.GEMINI and gemini_key,
            "status": "REAL AI (Anthropic Claude)" if is_active_anthropic else
                     "REAL AI (Google Gemini)" if is_active_gemini else
                     "ANTHROPIC CONFIGURED (switch LLM_PROVIDER=anthropic in .env)" if anthropic_key else
                     "GEMINI CONFIGURED (switch LLM_PROVIDER=gemini in .env)" if gemini_key else
                     "DEMO MODE (active)",
            "note": ""
        }

class DemoAIProvider:
    """Demo AI provider - returns realistic demo data"""

    @staticmethod
    def generate_trip_itinerary(destination: str, duration: int, budget: float, travelers: int,
                               start_date: str = None, interests: list = None) -> Dict[str, Any]:
        """Generate demo trip itinerary"""
        return {
            "status": "success",
            "is_demo": True,
            "message": f"Demo: Generated {duration}-day trip to {destination}",
            "itinerary_days": [
                {
                    "day_number": i,
                    "date": start_date,
                    "theme": "Cultural" if i % 2 == 0 else "Adventure",
                    "activities": [
                        {
                            "name": f"Activity {j}",
                            "category": "Tour",
                            "duration_minutes": 120,
                            "estimated_cost": budget * 0.1 / (duration * travelers),
                            "description": f"Demo activity {j} on day {i}"
                        }
                        for j in range(1, 3)
                    ]
                }
                for i in range(1, duration + 1)
            ]
        }

class AnthropicAIProvider:
    """Real AI provider using Anthropic Claude API"""

    MODEL = "claude-3-5-sonnet-20241022"

    @staticmethod
    def _get_client():
        """Get Anthropic client - will fail if no API key"""
        try:
            import anthropic
            api_key = os.getenv("ANTHROPIC_API_KEY")
            if not api_key:
                return None, "ANTHROPIC_API_KEY not configured in .env"
            return anthropic.Anthropic(api_key=api_key), None
        except ImportError:
            return None, "Anthropic SDK not installed"
        except Exception as e:
            return None, f"Error initializing Anthropic client: {str(e)}"

    @staticmethod
    def _build_trip_prompt(destination: str, duration: int, budget: float, travelers: int,
                          start_date: str = None, interests: list = None,
                          hotel_preference: str = None, transportation_preference: str = None) -> str:
        """Build detailed prompt for trip planning"""

        interests_str = ", ".join(interests) if interests else "general tourism"

        prompt = f"""You are an expert travel planner. Create a detailed {duration}-day itinerary for:

Destination: {destination}
Duration: {duration} days
Number of travelers: {travelers}
Total Budget: ₹{budget:,.0f}
Interests: {interests_str}
Hotel Preference: {hotel_preference or 'comfort'}
Transportation Preference: {transportation_preference or 'flexible'}
{"Start Date: " + start_date if start_date else ""}

Generate a JSON response with this exact structure (no markdown, just JSON):
{{
    "itinerary_days": [
        {{
            "day_number": 1,
            "theme": "string (e.g., 'Cultural', 'Adventure', 'Food')",
            "activities": [
                {{
                    "name": "activity name",
                    "category": "string (e.g., 'Attraction', 'Restaurant', 'Shopping')",
                    "duration_minutes": number,
                    "estimated_cost": number,
                    "description": "brief description"
                }}
            ]
        }}
    ],
    "travel_tips": ["tip1", "tip2"],
    "budget_breakdown": {{
        "accommodation": number,
        "food": number,
        "activities": number,
        "transport": number,
        "other": number
    }},
    "best_season": "string",
    "packing_tips": ["tip1", "tip2"]
}}

Create realistic, actionable activities that fit the budget and interests. Ensure day themes vary."""

        return prompt

    @staticmethod
    def generate_trip_itinerary(destination: str, duration: int, budget: float, travelers: int,
                               start_date: str = None, interests: list = None,
                               hotel_preference: str = None, transportation_preference: str = None) -> Dict[str, Any]:
        """Generate trip itinerary using real Anthropic API"""

        client, error = AnthropicAIProvider._get_client()
        if not client:
            return {
                "status": "error",
                "is_demo": False,
                "message": f"Cannot call Anthropic API: {error}",
                "fallback_to_demo": True,
                "note": "API key not available - using demo data as fallback" if "not configured" in error else error
            }

        try:
            prompt = AnthropicAIProvider._build_trip_prompt(
                destination, duration, budget, travelers, start_date, interests,
                hotel_preference, transportation_preference
            )

            message = client.messages.create(
                model=AnthropicAIProvider.MODEL,
                max_tokens=2048,
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )

            # Extract response text
            response_text = message.content[0].text.strip()

            # Parse JSON from response
            # Claude might wrap JSON in markdown, so extract it
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()

            itinerary_data = json.loads(response_text)

            return {
                "status": "success",
                "is_demo": False,
                "message": "Generated using Anthropic Claude API",
                "model": AnthropicAIProvider.MODEL,
                "itinerary_days": itinerary_data.get("itinerary_days", []),
                "travel_tips": itinerary_data.get("travel_tips", []),
                "budget_breakdown": itinerary_data.get("budget_breakdown", {}),
                "best_season": itinerary_data.get("best_season", ""),
                "packing_tips": itinerary_data.get("packing_tips", [])
            }

        except json.JSONDecodeError as e:
            return {
                "status": "error",
                "is_demo": False,
                "message": f"Failed to parse Anthropic response as JSON: {str(e)}",
                "fallback_to_demo": True,
                "note": "Response parsing error - will use demo data"
            }
        except Exception as e:
            return {
                "status": "error",
                "is_demo": False,
                "message": f"Anthropic API error: {str(e)}",
                "fallback_to_demo": True,
                "note": "API error - will use demo data as fallback"
            }


class GeminiAIProvider:
    """Real AI provider using Google Gemini API"""

    MODEL = "gemini-2.5-flash"

    @staticmethod
    def _get_client():
        """Get Gemini client - will fail if no API key"""
        try:
            from google import genai
            api_key = os.getenv("GEMINI_API_KEY")
            if not api_key:
                return None, "GEMINI_API_KEY not configured in .env"
            client = genai.Client(api_key=api_key)
            return client, None
        except ImportError:
            return None, "Google Genai SDK not installed"
        except Exception as e:
            return None, f"Error initializing Gemini client: {str(e)}"

    @staticmethod
    def _build_trip_prompt(destination: str, duration: int, budget: float, travelers: int,
                          start_date: str = None, interests: list = None,
                          hotel_preference: str = None, transportation_preference: str = None) -> str:
        """Build detailed prompt for trip planning"""

        interests_str = ", ".join(interests) if interests else "general tourism"

        prompt = f"""You are an expert travel planner. Create a detailed {duration}-day itinerary for:

Destination: {destination}
Duration: {duration} days
Number of travelers: {travelers}
Total Budget: ₹{budget:,.0f}
Interests: {interests_str}
Hotel Preference: {hotel_preference or 'comfort'}
Transportation Preference: {transportation_preference or 'flexible'}
{"Start Date: " + start_date if start_date else ""}

Generate a JSON response with this exact structure (no markdown, just JSON):
{{
    "itinerary_days": [
        {{
            "day_number": 1,
            "theme": "string (e.g., 'Cultural', 'Adventure', 'Food')",
            "activities": [
                {{
                    "name": "activity name",
                    "category": "string (e.g., 'Attraction', 'Restaurant', 'Shopping')",
                    "duration_minutes": number,
                    "estimated_cost": number,
                    "description": "brief description"
                }}
            ]
        }}
    ],
    "travel_tips": ["tip1", "tip2"],
    "budget_breakdown": {{
        "accommodation": number,
        "food": number,
        "activities": number,
        "transport": number,
        "other": number
    }},
    "best_season": "string",
    "packing_tips": ["tip1", "tip2"]
}}

Create realistic, actionable activities that fit the budget and interests. Ensure day themes vary."""

        return prompt

    @staticmethod
    def generate_trip_itinerary(destination: str, duration: int, budget: float, travelers: int,
                               start_date: str = None, interests: list = None,
                               hotel_preference: str = None, transportation_preference: str = None) -> Dict[str, Any]:
        """Generate trip itinerary using Google Gemini API"""

        genai, error = GeminiAIProvider._get_client()
        if not genai:
            return {
                "status": "error",
                "is_demo": False,
                "message": f"Cannot call Gemini API: {error}",
                "fallback_to_demo": True,
                "note": "API key not available - using demo data as fallback" if "not configured" in error else error
            }

        try:
            prompt = GeminiAIProvider._build_trip_prompt(
                destination, duration, budget, travelers, start_date, interests,
                hotel_preference, transportation_preference
            )

            response = genai.models.generate_content(
                model=GeminiAIProvider.MODEL,
                contents=prompt
            )

            # Extract response text
            response_text = response.text.strip()

            # Parse JSON from response
            # Gemini might wrap JSON in markdown, so extract it
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()

            itinerary_data = json.loads(response_text)

            return {
                "status": "success",
                "is_demo": False,
                "message": "Generated using Google Gemini API",
                "model": GeminiAIProvider.MODEL,
                "itinerary_days": itinerary_data.get("itinerary_days", []),
                "travel_tips": itinerary_data.get("travel_tips", []),
                "budget_breakdown": itinerary_data.get("budget_breakdown", {}),
                "best_season": itinerary_data.get("best_season", ""),
                "packing_tips": itinerary_data.get("packing_tips", [])
            }

        except json.JSONDecodeError as e:
            return {
                "status": "error",
                "is_demo": False,
                "message": f"Failed to parse Gemini response as JSON: {str(e)}",
                "fallback_to_demo": True,
                "note": "Response parsing error - will use demo data"
            }
        except Exception as e:
            return {
                "status": "error",
                "is_demo": False,
                "message": f"Gemini API error: {str(e)}",
                "fallback_to_demo": True,
                "note": "API error - will use demo data as fallback"
            }


def get_ai_provider():
    """Factory function to get appropriate AI provider"""
    mode = AIProvider.get_mode()

    # Use provider if both selected AND key exists
    if mode == AIMode.ANTHROPIC and os.getenv("ANTHROPIC_API_KEY"):
        return AnthropicAIProvider
    elif mode == AIMode.GEMINI and os.getenv("GEMINI_API_KEY"):
        return GeminiAIProvider
    else:
        return DemoAIProvider
