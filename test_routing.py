#!/usr/bin/env python3
"""Test routing policy"""

import requests
import time

BACKEND_URL = "http://localhost:5000"

tests = [
    ("FAQ routing", "What is NordRoute Logistics?"),
    ("Incoterm definition", "What is FOB?"),
    ("Compatibility check", "Can I use FOB by road?"),
    ("Comparison", "Compare CIF and CIP"),
    ("CMR article", "What is CMR Article 17 about?"),
]

for name, query in tests:
    print(f"\n[TEST] {name}: {query}")
    start = time.time()
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/chat",
            json={"message": query},
            timeout=60
        )
        elapsed = time.time() - start
        data = response.json()
        
        if data.get("success"):
            text = data.get("message", "")
            print(f"  SUCCESS ({elapsed:.1f}s)")
            print(f"  Response: {text[:150]}...")
        else:
            print(f"  ERROR: {data.get('error')}")
    except Exception as e:
        print(f"  EXCEPTION: {e}")
