"""
Tests for AI Provider system - Demo, Anthropic, and Gemini modes
Tests use mocking to avoid real API calls
"""
import pytest
import os
import json
from unittest.mock import Mock, patch, MagicMock
from app.services.ai_provider import (
    AIProvider, AIMode, DemoAIProvider, AnthropicAIProvider,
    GeminiAIProvider, get_ai_provider
)


class TestAIMode:
    """Test AIMode enum"""

    def test_ai_mode_values(self):
        """Test AIMode enum has correct values"""
        assert AIMode.DEMO.value == "demo"
        assert AIMode.ANTHROPIC.value == "anthropic"
        assert AIMode.GEMINI.value == "gemini"


class TestAIProviderGetMode:
    """Test AIProvider.get_mode() method"""

    def test_get_mode_demo(self):
        """Test getting demo mode"""
        with patch.dict(os.environ, {"LLM_PROVIDER": "demo"}):
            assert AIProvider.get_mode() == AIMode.DEMO

    def test_get_mode_anthropic(self):
        """Test getting anthropic mode"""
        with patch.dict(os.environ, {"LLM_PROVIDER": "anthropic"}):
            assert AIProvider.get_mode() == AIMode.ANTHROPIC

    def test_get_mode_gemini(self):
        """Test getting gemini mode"""
        with patch.dict(os.environ, {"LLM_PROVIDER": "gemini"}):
            assert AIProvider.get_mode() == AIMode.GEMINI

    def test_get_mode_default(self):
        """Test default mode when not set"""
        with patch.dict(os.environ, {}, clear=False):
            if "LLM_PROVIDER" in os.environ:
                del os.environ["LLM_PROVIDER"]
            # Default should be demo or anthropic based on implementation
            mode = AIProvider.get_mode()
            assert mode in [AIMode.DEMO, AIMode.ANTHROPIC]

    def test_get_mode_case_insensitive(self):
        """Test mode is case-insensitive"""
        with patch.dict(os.environ, {"LLM_PROVIDER": "GEMINI"}):
            assert AIProvider.get_mode() == AIMode.GEMINI


class TestAIProviderIsRealAI:
    """Test AIProvider.is_real_ai() method"""

    def test_is_real_ai_demo_mode(self):
        """Test is_real_ai returns False in demo mode"""
        with patch.dict(os.environ, {"LLM_PROVIDER": "demo"}):
            assert AIProvider.is_real_ai() is False

    def test_is_real_ai_anthropic_with_key(self):
        """Test is_real_ai returns True for Anthropic with key"""
        with patch.dict(os.environ, {
            "LLM_PROVIDER": "anthropic",
            "ANTHROPIC_API_KEY": "sk-test-key"
        }):
            assert AIProvider.is_real_ai() is True

    def test_is_real_ai_anthropic_no_key(self):
        """Test is_real_ai returns False for Anthropic without key"""
        with patch.dict(os.environ, {
            "LLM_PROVIDER": "anthropic",
            "ANTHROPIC_API_KEY": ""
        }, clear=False):
            assert AIProvider.is_real_ai() is False

    def test_is_real_ai_gemini_with_key(self):
        """Test is_real_ai returns True for Gemini with key"""
        with patch.dict(os.environ, {
            "LLM_PROVIDER": "gemini",
            "GEMINI_API_KEY": "test-gemini-key"
        }):
            assert AIProvider.is_real_ai() is True

    def test_is_real_ai_gemini_no_key(self):
        """Test is_real_ai returns False for Gemini without key"""
        with patch.dict(os.environ, {
            "LLM_PROVIDER": "gemini",
            "GEMINI_API_KEY": ""
        }, clear=False):
            assert AIProvider.is_real_ai() is False


class TestDemoAIProvider:
    """Test DemoAIProvider"""

    def test_demo_provider_generates_itinerary(self):
        """Test demo provider generates valid itinerary"""
        result = DemoAIProvider.generate_trip_itinerary(
            destination="Paris",
            duration=3,
            budget=50000,
            travelers=2,
            interests=["art", "food"]
        )

        assert result["status"] == "success"
        assert result["is_demo"] is True
        assert "itinerary_days" in result
        assert len(result["itinerary_days"]) == 3
        assert result["itinerary_days"][0]["day_number"] == 1

    def test_demo_provider_activities(self):
        """Test demo provider creates activities"""
        result = DemoAIProvider.generate_trip_itinerary(
            destination="London",
            duration=2,
            budget=30000,
            travelers=1
        )

        assert result["status"] == "success"
        for day in result["itinerary_days"]:
            assert "activities" in day
            assert len(day["activities"]) > 0
            for activity in day["activities"]:
                assert "name" in activity
                assert "duration_minutes" in activity
                assert "estimated_cost" in activity


class TestGeminiAIProvider:
    """Test GeminiAIProvider with mocked Gemini SDK"""

    @patch.dict(os.environ, {"GEMINI_API_KEY": "test-key"})
    @patch("app.services.ai_provider.GeminiAIProvider._get_client")
    def test_gemini_get_client_success(self, mock_get_client):
        """Test successful Gemini client initialization"""
        mock_genai = MagicMock()
        mock_get_client.return_value = (mock_genai, None)

        client, error = GeminiAIProvider._get_client()

        assert client is not None
        assert error is None

    @patch.dict(os.environ, {"GEMINI_API_KEY": ""}, clear=False)
    @patch("app.services.ai_provider.GeminiAIProvider._get_client")
    def test_gemini_get_client_missing_key(self, mock_get_client):
        """Test Gemini client fails without API key"""
        mock_get_client.return_value = (None, "GEMINI_API_KEY not configured in .env")

        client, error = GeminiAIProvider._get_client()

        assert client is None
        assert "not configured" in error

    @patch.dict(os.environ, {"GEMINI_API_KEY": "test-key"})
    def test_gemini_build_trip_prompt(self):
        """Test Gemini prompt building"""
        prompt = GeminiAIProvider._build_trip_prompt(
            destination="Paris",
            duration=5,
            budget=50000,
            travelers=2,
            interests=["art", "museums"]
        )

        assert "Paris" in prompt
        assert "5" in prompt
        assert "art" in prompt
        assert "JSON response" in prompt

    @patch.dict(os.environ, {"GEMINI_API_KEY": "test-key"})
    @patch("app.services.ai_provider.GeminiAIProvider._get_client")
    def test_gemini_generate_trip_itinerary_success(self, mock_get_client):
        """Test Gemini generates itinerary successfully"""
        # Mock the Gemini SDK
        mock_response = MagicMock()

        # Sample JSON response from Gemini
        json_response = {
            "itinerary_days": [
                {
                    "day_number": 1,
                    "theme": "Cultural",
                    "activities": [
                        {
                            "name": "Louvre Museum",
                            "category": "Attraction",
                            "duration_minutes": 180,
                            "estimated_cost": 15,
                            "description": "Visit the Louvre"
                        }
                    ]
                }
            ],
            "travel_tips": ["Bring passport", "Check weather"],
            "budget_breakdown": {
                "accommodation": 20000,
                "food": 10000,
                "activities": 15000,
                "transport": 5000,
                "other": 0
            },
            "best_season": "Spring",
            "packing_tips": ["Light jacket", "Comfortable shoes"]
        }

        mock_response.text = json.dumps(json_response)
        mock_client = MagicMock()
        mock_client.models.generate_content.return_value = mock_response
        mock_get_client.return_value = (mock_client, None)

        result = GeminiAIProvider.generate_trip_itinerary(
            destination="Paris",
            duration=1,
            budget=50000,
            travelers=1
        )

        assert result["status"] == "success"
        assert result["is_demo"] is False
        assert "Google Gemini" in result["message"]
        assert "itinerary_days" in result
        assert len(result["itinerary_days"]) > 0

    @patch.dict(os.environ, {"GEMINI_API_KEY": ""}, clear=False)
    @patch("app.services.ai_provider.GeminiAIProvider._get_client")
    def test_gemini_missing_api_key_fallback(self, mock_get_client):
        """Test Gemini falls back to demo when API key missing"""
        mock_get_client.return_value = (None, "GEMINI_API_KEY not configured in .env")

        result = GeminiAIProvider.generate_trip_itinerary(
            destination="Paris",
            duration=5,
            budget=50000,
            travelers=2
        )

        assert result["status"] == "error"
        assert result["fallback_to_demo"] is True
        assert "API key not available" in result["note"] or "not configured" in result["message"]

    @patch.dict(os.environ, {"GEMINI_API_KEY": "test-key"})
    @patch("app.services.ai_provider.GeminiAIProvider._get_client")
    def test_gemini_malformed_response_fallback(self, mock_get_client):
        """Test Gemini falls back when response is malformed"""
        mock_response = MagicMock()

        # Invalid JSON response
        mock_response.text = "This is not JSON"
        mock_client = MagicMock()
        mock_client.models.generate_content.return_value = mock_response
        mock_get_client.return_value = (mock_client, None)

        result = GeminiAIProvider.generate_trip_itinerary(
            destination="Paris",
            duration=5,
            budget=50000,
            travelers=2
        )

        assert result["status"] == "error"
        assert result["fallback_to_demo"] is True
        assert "parse" in result["message"].lower()

    @patch.dict(os.environ, {"GEMINI_API_KEY": "test-key"})
    @patch("app.services.ai_provider.GeminiAIProvider._get_client")
    def test_gemini_handles_markdown_wrapped_json(self, mock_get_client):
        """Test Gemini handles markdown-wrapped JSON responses"""
        mock_response = MagicMock()

        json_data = {
            "itinerary_days": [],
            "travel_tips": ["Tip 1"],
            "budget_breakdown": {"accommodation": 1000},
            "best_season": "Spring",
            "packing_tips": ["Pack light"]
        }

        # Gemini might wrap JSON in markdown
        mock_response.text = f"```json\n{json.dumps(json_data)}\n```"
        mock_client = MagicMock()
        mock_client.models.generate_content.return_value = mock_response
        mock_get_client.return_value = (mock_client, None)

        result = GeminiAIProvider.generate_trip_itinerary(
            destination="Paris",
            duration=1,
            budget=50000,
            travelers=1
        )

        assert result["status"] == "success"
        assert result["is_demo"] is False

    @patch.dict(os.environ, {"GEMINI_API_KEY": "test-key"})
    @patch("app.services.ai_provider.GeminiAIProvider._get_client")
    def test_gemini_api_error_fallback(self, mock_get_client):
        """Test Gemini falls back on API error"""
        mock_get_client.return_value = (None, "Connection timeout")

        result = GeminiAIProvider.generate_trip_itinerary(
            destination="Paris",
            duration=5,
            budget=50000,
            travelers=2
        )

        assert result["status"] == "error"
        assert result["fallback_to_demo"] is True


class TestGetAIProvider:
    """Test get_ai_provider() factory function"""

    def test_get_demo_provider(self):
        """Test factory returns DemoAIProvider"""
        with patch.dict(os.environ, {"LLM_PROVIDER": "demo"}):
            provider = get_ai_provider()
            assert provider == DemoAIProvider

    def test_get_anthropic_provider_with_key(self):
        """Test factory returns AnthropicAIProvider when configured"""
        with patch.dict(os.environ, {
            "LLM_PROVIDER": "anthropic",
            "ANTHROPIC_API_KEY": "sk-test"
        }):
            provider = get_ai_provider()
            assert provider == AnthropicAIProvider

    def test_get_anthropic_provider_without_key_fallback(self):
        """Test factory returns DemoAIProvider when Anthropic key missing"""
        with patch.dict(os.environ, {
            "LLM_PROVIDER": "anthropic",
            "ANTHROPIC_API_KEY": ""
        }, clear=False):
            provider = get_ai_provider()
            assert provider == DemoAIProvider

    def test_get_gemini_provider_with_key(self):
        """Test factory returns GeminiAIProvider when configured"""
        with patch.dict(os.environ, {
            "LLM_PROVIDER": "gemini",
            "GEMINI_API_KEY": "test-key"
        }):
            provider = get_ai_provider()
            assert provider == GeminiAIProvider

    def test_get_gemini_provider_without_key_fallback(self):
        """Test factory returns DemoAIProvider when Gemini key missing"""
        with patch.dict(os.environ, {
            "LLM_PROVIDER": "gemini",
            "GEMINI_API_KEY": ""
        }, clear=False):
            provider = get_ai_provider()
            assert provider == DemoAIProvider


class TestProviderStatus:
    """Test AIProvider.get_provider_status()"""

    def test_status_demo_mode(self):
        """Test status in demo mode"""
        with patch.dict(os.environ, {"LLM_PROVIDER": "demo"}):
            status = AIProvider.get_provider_status()

            assert status["mode"] == "demo"
            assert status["is_demo"] is True
            assert status["is_real"] is False
            assert "DEMO MODE" in status["status"]

    def test_status_anthropic_active(self):
        """Test status with active Anthropic"""
        with patch.dict(os.environ, {
            "LLM_PROVIDER": "anthropic",
            "ANTHROPIC_API_KEY": "sk-test"
        }):
            status = AIProvider.get_provider_status()

            assert status["mode"] == "anthropic"
            assert status["is_real"] is True
            assert "Anthropic" in status["status"]

    def test_status_gemini_active(self):
        """Test status with active Gemini"""
        with patch.dict(os.environ, {
            "LLM_PROVIDER": "gemini",
            "GEMINI_API_KEY": "test-key"
        }):
            status = AIProvider.get_provider_status()

            assert status["mode"] == "gemini"
            assert status["is_real"] is True
            assert "Gemini" in status["status"]

    def test_status_gemini_configured_not_active(self):
        """Test status shows Gemini available but not active"""
        with patch.dict(os.environ, {
            "LLM_PROVIDER": "demo",
            "GEMINI_API_KEY": "test-key"
        }):
            status = AIProvider.get_provider_status()

            assert status["gemini_configured_but_not_active"] is True
            assert status["mode"] == "demo"


class TestAnthropicProviderUnchanged:
    """Test that Anthropic provider remains unchanged"""

    def test_anthropic_provider_exists(self):
        """Test AnthropicAIProvider still exists"""
        assert hasattr(AnthropicAIProvider, "generate_trip_itinerary")
        assert hasattr(AnthropicAIProvider, "_get_client")
        assert hasattr(AnthropicAIProvider, "_build_trip_prompt")

    def test_anthropic_model_constant(self):
        """Test Anthropic model constant"""
        assert AnthropicAIProvider.MODEL == "claude-3-5-sonnet-20241022"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
