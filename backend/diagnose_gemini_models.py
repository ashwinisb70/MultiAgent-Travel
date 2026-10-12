#!/usr/bin/env python
"""
Gemini Models Diagnostic Tool

Lists available Gemini models for the configured API key.
Does NOT attempt to generate content; only lists model availability.

Usage:
    python diagnose_gemini_models.py

Output:
    Lists model IDs that support content generation (if capability data available)
"""

import sys
from typing import Optional


def diagnose_models() -> int:
    """
    Diagnose available Gemini models using the configured API key.

    Returns:
        Exit code: 0 = success, 1 = error, 2 = missing key
    """

    # Load API key from settings (Pydantic)
    try:
        sys.path.insert(0, 'app')
        from core.config import settings
        api_key = settings.GEMINI_API_KEY
    except ImportError as e:
        print(f"[ERROR] Failed to import settings: {e}")
        return 1

    if not api_key:
        print("[ERROR] GEMINI_API_KEY not configured in .env")
        print()
        print("To configure:")
        print("  1. Open backend/.env")
        print("  2. Add: GEMINI_API_KEY=your-actual-key")
        print("  3. Save file")
        print()
        return 2

    # Create client and list models
    try:
        from google import genai

        print("[INFO] Connecting to Gemini API...")
        client = genai.Client(api_key=api_key)

        print("[INFO] Fetching available models...")
        models = client.models.list()

        # Collect model info
        model_list = []
        for model in models:
            # Extract model information
            if hasattr(model, 'name'):
                model_name = model.name
                # Clean up the name (remove 'models/' prefix if present)
                if model_name.startswith('models/'):
                    model_name = model_name[7:]
            else:
                model_name = str(model)

            # Check for content generation capability
            has_content_gen = "generateContent" in str(model) if model else False

            model_list.append({
                'name': model_name,
                'has_content_gen': has_content_gen,
                'raw': str(model)
            })

        # Print results
        print()
        print("[OK] Available Gemini Models:")
        print("=" * 60)

        if not model_list:
            print("  (No models returned - check API key permissions)")
        else:
            for model in model_list:
                print(f"  - {model['name']}")

        print()
        print(f"[INFO] Total models: {len(model_list)}")
        print()
        print("Recommended models for content generation:")
        print("  - gemini-2.5-flash (latest, recommended)")
        print("  - gemini-2.0-flash (stable alternative)")
        print("  - gemini-2.0-pro (more capable, slower)")
        print()

        return 0

    except Exception as e:
        exc_type = type(e).__name__
        exc_msg = str(e)

        print(f"[ERROR] {exc_type}")
        print()

        # Categorize error
        error_lower = exc_msg.lower()

        if "authentication" in error_lower or "invalid" in error_lower or "unauthorized" in error_lower:
            print("Issue: Authentication failed")
            print("  - Check GEMINI_API_KEY is correct")
            print("  - Verify key hasn't expired")
            print("  - Confirm you have API access")
        elif "permission" in error_lower or "forbidden" in error_lower:
            print("Issue: Permission denied")
            print("  - Check API key has Gemini API access")
            print("  - Verify project has Gemini API enabled")
        elif "quota" in error_lower or "rate" in error_lower:
            print("Issue: Quota or rate limit")
            print("  - API quota may be exhausted")
            print("  - Check billing/quota in Google Cloud Console")
        elif "connection" in error_lower or "timeout" in error_lower or "network" in error_lower:
            print("Issue: Network connectivity")
            print("  - Check internet connection")
            print("  - Verify firewall allows HTTPS to Google APIs")
        else:
            print(f"Issue: {exc_msg[:200]}")

        print()
        return 1


def main():
    """Entry point."""
    print()
    print("Gemini Models Diagnostic Tool")
    print("=" * 60)
    print()

    exit_code = diagnose_models()

    if exit_code == 0:
        print("[OK] Diagnostic complete")
    elif exit_code == 1:
        print("[ERROR] Diagnostic failed")
    elif exit_code == 2:
        print("[ERROR] Configuration incomplete")

    print()
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
