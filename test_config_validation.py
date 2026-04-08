# -*- coding: utf-8 -*-
"""
Test script to verify configuration validation works correctly
Tests both API key validation and Ollama connectivity
"""

import sys
from pathlib import Path

# Add parent to path
sys.path.insert(0, str(Path(__file__).parent))

from mafalia_code.config import load_config, save_config, validate_config, PROVIDERS

def test_no_provider():
    """Test with no provider selected"""
    cfg = {"provider": "", "model": "", "api_key": ""}
    result = validate_config(cfg)
    print("Test 1: No provider selected")
    print(f"  Valid: {result['valid']}")
    print(f"  Message: {result['message']}")
    assert result['valid'] == False
    assert "No provider selected" in result['message']
    print("  ✓ PASS\n")

def test_no_model():
    """Test with provider but no model"""
    cfg = {"provider": "openai", "model": "", "api_key": ""}
    result = validate_config(cfg)
    print("Test 2: Provider selected but no model")
    print(f"  Valid: {result['valid']}")
    print(f"  Message: {result['message']}")
    assert result['valid'] == False
    assert "No model selected" in result['message']
    print("  ✓ PASS\n")

def test_missing_api_key():
    """Test with provider and model but no API key"""
    cfg = {"provider": "openai", "model": "gpt-4o", "api_key": ""}
    result = validate_config(cfg)
    print("Test 3: API key missing")
    print(f"  Valid: {result['valid']}")
    print(f"  Message: {result['message']}")
    assert result['valid'] == False
    assert ("api key" in result['message'].lower() or "API_KEY" in result['message'])
    print("  ✓ PASS\n")

def test_invalid_api_key_format():
    """Test with invalid API key format"""
    cfg = {"provider": "openai", "model": "gpt-4o", "api_key": "invalid-key"}
    result = validate_config(cfg)
    print("Test 4: Invalid API key format")
    print(f"  Valid: {result['valid']}")
    print(f"  Message: {result['message']}")
    assert result['valid'] == False
    assert "Invalid" in result['message']
    print("  ✓ PASS\n")

def test_valid_api_key():
    """Test with valid API key format"""
    cfg = {"provider": "openai", "model": "gpt-4o", "api_key": "sk-test123456789"}
    result = validate_config(cfg)
    print("Test 5: Valid API key format")
    print(f"  Valid: {result['valid']}")
    print(f"  Message: {result['message']}")
    assert result['valid'] == True
    assert "valid" in result['message'].lower()
    print("  ✓ PASS\n")

def test_anthropic_key_format():
    """Test Anthropic API key format"""
    cfg = {"provider": "anthropic", "model": "claude-3-5-sonnet-20241022", "api_key": "sk-ant-test123"}
    result = validate_config(cfg)
    print("Test 6: Valid Anthropic API key format")
    print(f"  Valid: {result['valid']}")
    print(f"  Message: {result['message']}")
    assert result['valid'] == True
    print("  ✓ PASS\n")

def test_ollama_no_server():
    """Test Ollama connectivity check"""
    cfg = {"provider": "ollama", "model": "llama3.2", "api_key": ""}
    result = validate_config(cfg)
    print("Test 7: Ollama connectivity check")
    print(f"  Valid: {result['valid']}")
    print(f"  Message: {result['message']}")
    # Either Ollama is running (valid=True) or not running (valid=False)
    # Both are valid test outcomes - we just want to ensure the check works
    assert "Ollama" in result['message']
    if result['valid']:
        print("  ✓ PASS (Ollama server is running and accessible)\n")
    else:
        print("  ✓ PASS (Ollama server not running, check works correctly)\n")

def test_providers_list():
    """Test that all providers are configured"""
    print("Test 8: Providers configuration")
    print(f"  Available providers: {list(PROVIDERS.keys())}")
    assert "ollama" in PROVIDERS
    assert "openai" in PROVIDERS
    assert "anthropic" in PROVIDERS
    assert "google" in PROVIDERS
    assert "openrouter" in PROVIDERS
    assert "custom" in PROVIDERS
    print("  ✓ PASS\n")

def test_ollama_config():
    """Test Ollama provider configuration"""
    print("Test 9: Ollama provider config")
    ollama = PROVIDERS["ollama"]
    print(f"  Name: {ollama['name']}")
    print(f"  Base URL: {ollama['base_url']}")
    print(f"  Models: {ollama['models'][:3]}...")
    assert ollama['base_url'] == "http://localhost:11434/v1"
    assert len(ollama['models']) > 0
    assert "llama3.2" in ollama['models']
    print("  ✓ PASS\n")

if __name__ == "__main__":
    print("=" * 60)
    print("  CONFIGURATION VALIDATION TEST SUITE")
    print("=" * 60)
    print()
    
    try:
        test_no_provider()
        test_no_model()
        test_missing_api_key()
        test_invalid_api_key_format()
        test_valid_api_key()
        test_anthropic_key_format()
        test_ollama_no_server()
        test_providers_list()
        test_ollama_config()
        
        print("=" * 60)
        print("  ALL TESTS PASSED ✓")
        print("=" * 60)
        print()
        print("Configuration validation system is working correctly.")
        print("Once you set a valid API key or start Ollama, agents will work perfectly.")
        
    except AssertionError as e:
        print(f"\n✗ TEST FAILED: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n✗ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
