#!/usr/bin/env python3
"""Test runner for semantic embeddings - Windows compatible"""

import requests
import json

BACKEND_URL = "http://localhost:5000"

TEST_CASES = [
    ("FAQ-001", "What is NordRoute Logistics?", ["NordRoute", "Logistics", "German"]),
    ("FAQ-002", "Where is NordRoute headquartered?", ["Dortmund", "Germany"]),
    ("FAQ-003", "Which countries does NordRoute serve?", ["France", "Belgium", "Germany"]),
    ("INCO-001", "What is FOB?", ["Free", "Board", "sea"]),
    ("INCO-002", "What does CIF stand for?", ["Cost", "Insurance", "Freight"]),
    ("INCO-003", "Can I use FOB by road?", ["no", "sea"]),
    ("CMR-001", "What does CMR cover?", ["road", "transport", "international"]),
    ("CMR-002", "What is CMR Article 17 about?", ["liability", "damage", "carrier"]),
    ("CMR-003", "How long are CMR claims valid?", ["day", "time", "claim"]),
]

def test_case(test_id, question, keywords):
    """Test a single case"""
    print(f"\n[TEST] {test_id}: {question}")
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/chat",
            json={"message": question},
            timeout=30
        )
        data = response.json()
        
        if not data.get("success"):
            print(f"  ERROR: {data.get('error', 'Unknown error')}")
            return False
        
        text = data.get("message", "").lower()
        matched = sum(1 for kw in keywords if kw.lower() in text)
        
        print(f"  Response length: {len(text)}")
        print(f"  Keywords: {matched}/{len(keywords)} found")
        
        if matched < len(keywords):
            missing = [kw for kw in keywords if kw.lower() not in text]
            print(f"  Missing: {', '.join(missing)}")
        
        success = matched >= len(keywords) * 0.5  # 50% threshold
        print(f"  Result: {'PASS' if success else 'FAIL'}")
        
        return success
        
    except Exception as e:
        print(f"  ERROR: {e}")
        return False

def main():
    print("[TEST] Semantic Embedding Test Suite")
    print(f"[TEST] Backend: {BACKEND_URL}")
    print(f"[TEST] Total: {len(TEST_CASES)} tests")
    print("-" * 60)
    
    results = []
    for test_id, question, keywords in TEST_CASES:
        results.append(test_case(test_id, question, keywords))
    
    print("\n" + "=" * 60)
    print("[SUMMARY]")
    passed = sum(results)
    total = len(results)
    print(f"Passed: {passed}/{total} ({passed*100//total}%)")
    print("=" * 60)
    
    return passed == total

if __name__ == '__main__':
    success = main()
    exit(0 if success else 1)
