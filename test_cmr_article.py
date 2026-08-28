#!/usr/bin/env python3
"""Test CMR Article 17 specifically"""

import requests

BACKEND_URL = "http://localhost:5000"

# Test CMR Article 17
print("[TEST] CMR-002: What is CMR Article 17 about?")
response = requests.post(
    f"{BACKEND_URL}/api/chat",
    json={"message": "What is CMR Article 17 about?"},
    timeout=30
)
data = response.json()
text = data.get("message", "")

print(f"Response length: {len(text)}")
print(f"Response: {text}")
print()

# Try alternative phrasing
print("[TEST] Alternative: CMR Article 17 liability")
response = requests.post(
    f"{BACKEND_URL}/api/chat",
    json={"message": "CMR Article 17 liability"},
    timeout=30
)
data = response.json()
text = data.get("message", "")

print(f"Response length: {len(text)}")
print(f"Response: {text}")
