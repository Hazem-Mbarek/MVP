#!/usr/bin/env python3
"""Simple test runner without encoding issues"""

import requests
import json

BACKEND_URL = "http://localhost:5000"

def test():
    """Run simple tests"""
    print("[TEST] Backend Test Runner")
    
    # Test 1: FAQ query
    print("\n[TEST] FAQ-001: What is NordRoute Logistics?")
    response = requests.post(f"{BACKEND_URL}/api/chat", json={"message": "What is NordRoute Logistics?"})
    data = response.json()
    text = data.get('message', '')
    print(f"[TEST] Response length: {len(text)}")
    print(f"[TEST] Response: {text[:200]}")
    print(f"[TEST] Has 'NordRoute': {'NordRoute' in text}")
    
    # Test 2: Incoterm query
    print("\n[TEST] INCO-001: What is FOB?")
    response = requests.post(f"{BACKEND_URL}/api/chat", json={"message": "What is FOB?"})
    data = response.json()
    text = data.get('message', '')
    print(f"[TEST] Response length: {len(text)}")
    print(f"[TEST] Response: {text[:200]}")
    print(f"[TEST] Has 'Free on Board' or 'Board': {'Free on Board' in text or 'Board' in text}")
    
    # Test 3: CMR query
    print("\n[TEST] CMR-001: What does CMR cover?")
    response = requests.post(f"{BACKEND_URL}/api/chat", json={"message": "What does CMR cover?"})
    data = response.json()
    text = data.get('message', '')
    print(f"[TEST] Response length: {len(text)}")
    print(f"[TEST] Response: {text[:200]}")
    print(f"[TEST] Has 'road' or 'transport': {'road' in text or 'transport' in text}")

if __name__ == '__main__':
    try:
        test()
    except Exception as e:
        print(f"[ERROR] {e}")
