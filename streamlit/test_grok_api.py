#!/usr/bin/env python3
"""
Quick test script to validate Grok API key and available models.
Run this before starting Streamlit to verify your setup.

Usage:
    python test_grok_api.py
"""

import requests
import sys
from pathlib import Path

def load_api_key():
    """Load API key from secrets.toml"""
    secrets_file = Path(".streamlit/secrets.toml")
    
    if not secrets_file.exists():
        print("❌ .streamlit/secrets.toml not found!")
        print("   Create it with: GROK_API_KEY = 'your-api-key'")
        return None
    
    # Simple toml parsing for this single key
    with open(secrets_file) as f:
        for line in f:
            if line.startswith("GROQ_API_KEY"):
                # Extract value between quotes
                start = line.find('"')
                end = line.rfind('"')
                if start >= 0 and end > start:
                    return line[start+1:end]
    
    print("❌ GROQ_API_KEY not found in secrets.toml")
    return None


def test_api_key(api_key):
    """Test if API key is valid and fetch available models"""
    
    print("\n🔍 Testing Grok API connection...\n")
    
    # Check for placeholder
    if not api_key or api_key.strip() == "your-groq-api-key-here":
        print("❌ API key appears to be a placeholder")
        print("   Please replace it with your real API key from https://console.groq.com")
        return False
    
    # Test available models endpoint
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    try:
        print("📡 Fetching available models...")
        response = requests.get(
            "https://api.groq.com/openai/v1/models",
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            models_data = response.json()
            if "data" in models_data:
                models = [m.get("id") for m in models_data["data"]]
                print(f"✅ API Key is valid!\n")
                print(f"📊 Available models ({len(models)}):")
                for model in models[:10]:
                    print(f"   • {model}")
                if len(models) > 10:
                    print(f"   ... and {len(models)-10} more")
                return True
            else:
                print("⚠️  Got response but no models found")
                return False
        
        elif response.status_code == 401:
            print("❌ Invalid API Key")
            print("   Your key doesn't have access to the API")
            print("   Check https://console.groq.com for a valid key")
            return False
        
        elif response.status_code == 403:
            print("❌ Permission Denied")
            print("   Your account may not have Grok access enabled")
            print("   Check your Groq account at https://console.groq.com")
            return False
        
        else:
            print(f"❌ API Error: {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            return False
    
    except requests.exceptions.Timeout:
        print("❌ Connection timeout")
        print("   Check your internet connection")
        return False
    
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to X.AI API")
        print("   Check your internet connection")
        return False
    
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        return False


def test_grok_model(api_key):
    """Test a simple request with available model"""
    
    print("\n📝 Testing Grok model...\n")
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # Try common models
    models_to_test = [
        "grok-2-vision-beta",
        "grok-vision-beta",
        "grok-3-alpha",
        "grok-3",
        "grok-2",
        "grok"
    ]
    
    for model in models_to_test:
        try:
            payload = {
                "model": model,
                "messages": [
                    {
                        "role": "user",
                        "content": "Hello, can you understand this message?"
                    }
                ],
                "max_tokens": 50
            }
            
            response = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=10
            )
            
            if response.status_code == 200:
                print(f"✅ Model '{model}' works!")
                return True
            elif response.status_code == 400 and "Model not found" in response.text:
                print(f"   ⏭️  {model} not available")
                continue
            else:
                print(f"   ⚠️  {model}: {response.status_code} error")
                continue
        
        except Exception as e:
            print(f"   ⚠️  {model}: {str(e)}")
            continue
    
    print("❌ No working models found")
    return False


def main():
    """Run all tests"""
    print("=" * 60)
    print("🔧 GROQ API KEY TEST")
    print("=" * 60)
    
    api_key = load_api_key()
    if not api_key:
        print("\n💡 Setup Instructions:")
        print("   1. Get API key: https://console.groq.com")
        print("   2. Create .streamlit/secrets.toml:")
        print("      GROQ_API_KEY = 'your-key-here'")
        print("   3. Run this test again")
        sys.exit(1)
    
    # Test API connection
    if not test_api_key(api_key):
        sys.exit(1)
    
    # Test actual model
    if not test_grok_model(api_key):
        print("\n💡 Troubleshooting:")
        print("   • Check account at https://console.groq.com")
        print("   • Ensure API access is enabled for your account")
        print("   • Try a different API key")
        sys.exit(1)
    
    print("\n" + "=" * 60)
    print("✅ ALL TESTS PASSED - Ready to use Groq recommendations!")
    print("=" * 60)
    print("\nRun: streamlit run health_trends_streamlit.py")
    sys.exit(0)


if __name__ == "__main__":
    main()
