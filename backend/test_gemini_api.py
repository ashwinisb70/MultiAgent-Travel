#!/usr/bin/env python
"""
Gemini API Smoke Test - Safe connectivity verification

This script tests Gemini API connectivity with minimal resource usage.
It does NOT use the provider factory, so LLM_PROVIDER=demo is unaffected.

Rules:
- Never prints the API key
- Uses only one short test prompt
- Reports only sanitized error categories
- Exits gracefully if key is missing
- No automatic retries (quota preservation)

Usage:
    python test_gemini_api.py

Expected output on success:
    [OK] Gemini API connection test passed
    Response: GEMINI_CONNECTION_OK

Expected output on missing key:
    [ERROR] GEMINI_API_KEY not configured
    Please add GEMINI_API_KEY to backend/.env

Expected output on API error:
    [ERROR] Gemini API error: [error_category]
    (e.g., authentication, quota, network, model_unavailable, unknown)
"""

import sys
from typing import Tuple, Optional
from app.core.config import settings


def sanitize_error(error: Exception) -> str:
    """
    Categorize API errors without exposing sensitive details.

    Args:
        error: The exception to categorize

    Returns:
        Sanitized error category
    """
    error_str = str(error).lower()
    exception_name = type(error).__name__

    # Categorize based on error content and type
    if ("authentication" in error_str or "unauthorized" in error_str or
        "invalid api key" in error_str or "invalid_argument" in error_str):
        return "authentication"
    elif "quota" in error_str or "rate_limit" in error_str or "429" in error_str:
        return "quota"
    elif ("connection" in error_str or "timeout" in error_str or "network" in error_str or
          "refused" in error_str or "unreachable" in error_str):
        return "network"
    elif ("modelnotfound" in error_str or "unavailable" in error_str or
          "model not found" in error_str or "404" in error_str):
        return "model_unavailable"
    elif "401" in error_str or "403" in error_str:
        return "authentication"
    elif "500" in error_str or "502" in error_str or "503" in error_str:
        return "server_error"
    else:
        return "unknown"


def test_gemini_connection() -> Tuple[bool, Optional[str], Optional[str], Optional[str]]:
    """
    Test Gemini API connectivity with a minimal request.

    Returns:
        Tuple of (success, response_text, error_category, error_details)
        - (True, response_text, None, None) on success
        - (False, None, category, details) on API error
        - (False, None, None, message) on configuration error
    """

    # Check for API key (loaded via Pydantic settings from .env)
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        return False, None, None, "GEMINI_API_KEY not configured in .env"

    try:
        # Import SDK (bypasses provider factory)
        from google import genai

        # Create client
        client = genai.Client(api_key=api_key)

        # Send minimal test prompt
        test_prompt = "Reply with exactly: GEMINI_CONNECTION_OK"
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=test_prompt
        )

        # Extract response text safely
        response_text = response.text.strip() if response and hasattr(response, 'text') else ""

        return True, response_text, None, None

    except ImportError:
        return False, None, "sdk_error", "Google Genai SDK not installed"
    except Exception as e:
        exc_type = type(e).__name__
        exc_msg = str(e)
        error_category = sanitize_error(e)
        error_details = f"{exc_type}: {exc_msg[:150]}"
        return False, None, error_category, error_details


def main():
    """
    Run the Gemini API smoke test and report results.

    Exit codes:
        0: Success
        1: API error
        2: Configuration missing
        3: SDK error
    """

    print("[INFO] Testing Gemini API connectivity...")
    print("[INFO] (This test sends one short prompt to verify connection)")
    print("[INFO] Model: gemini-2.5-flash")
    print()

    success, response_text, error_category, error_details = test_gemini_connection()

    if error_details and not success:
        # Configuration error or detailed error info
        if "not configured" in error_details:
            print("[ERROR] GEMINI_API_KEY not configured")
            print()
            print("To configure locally:")
            print("  1. Open backend/.env in a text editor")
            print("  2. Add or update the line: GEMINI_API_KEY=your-actual-key-here")
            print("  3. Save the file (do NOT commit to git - it's in .gitignore)")
            print()
            return 2
        elif error_category == "sdk_error":
            print("[ERROR] Gemini SDK error")
            print(f"  {error_details}")
            print()
            print("To fix:")
            print("  pip install google-genai==2.29.0")
            print()
            return 3
        else:
            # API error with category and details
            print(f"[ERROR] Gemini API error: {error_category}")
            print(f"  Exception: {error_details}")
            print()
            print("Troubleshooting:")
            if error_category == "authentication":
                print("  - Check that GEMINI_API_KEY is correct in backend/.env")
                print("  - Verify the key hasn't expired")
                print("  - Confirm you have access to Gemini API")
            elif error_category == "quota":
                print("  - API quota may be exhausted")
                print("  - Check your Google Cloud billing/quota status")
                print("  - Wait before retrying")
            elif error_category == "network":
                print("  - Network connectivity issue")
                print("  - Check internet connection")
                print("  - Verify firewall allows outbound HTTPS")
            elif error_category == "model_unavailable":
                print("  - gemini-2.5-flash model may not be available")
                print("  - Check project has Gemini API enabled in Google Cloud Console")
                print("  - Run: python diagnose_gemini_models.py (to verify available models)")
            elif error_category == "server_error":
                print("  - Google Gemini API server error (5xx)")
                print("  - Service may be temporarily unavailable")
                print("  - Try again after a few moments")
            else:
                print("  - See exception details above")
            print()
            return 1

    if not success:
        # Shouldn't reach here, but handle it
        print("[ERROR] Unknown error occurred")
        print()
        return 1

    # Success
    print("[OK] Gemini API connection test passed")
    print()
    print(f"Response: {response_text}")
    print()
    print("[INFO] Gemini provider is ready to use")
    print("[INFO] To activate: set LLM_PROVIDER=gemini in backend/.env")
    print()
    return 0


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
