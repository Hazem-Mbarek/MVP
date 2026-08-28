#!/usr/bin/env python3
"""
Automated Test Runner for Knowledge System
Tests basic data extraction from FAQ, Incoterms, and CMR sources
"""

import requests
import time
import json
from typing import Dict, List, Tuple

BACKEND_URL = "http://localhost:5000"
DELAY_BETWEEN_TESTS = 1.0  # seconds

# Simple test cases - one per source
TEST_CASES = [
    # FAQ Tests
    {
        "id": "FAQ-001",
        "category": "FAQ",
        "question": "What is NordRoute Logistics?",
        "expected_source": "faq",
        "expected_keywords": ["German", "logistics", "Dortmund"],
        "description": "Company info retrieval",
    },
    {
        "id": "FAQ-002",
        "category": "FAQ",
        "question": "Where is NordRoute headquartered?",
        "expected_source": "faq",
        "expected_keywords": ["Dortmund", "Germany"],
        "description": "Geographic info",
    },
    {
        "id": "FAQ-003",
        "category": "FAQ",
        "question": "Which countries does NordRoute serve?",
        "expected_source": "faq",
        "expected_keywords": ["France", "Belgium", "Germany"],
        "description": "Service coverage",
    },

    # Incoterms Tests
    {
        "id": "INCO-001",
        "category": "Incoterms",
        "question": "What is FOB?",
        "expected_source": "incoterms",
        "expected_keywords": ["Free", "Board", "sea", "risk"],
        "description": "Incoterm definition",
    },
    {
        "id": "INCO-002",
        "category": "Incoterms",
        "question": "What does CIF stand for?",
        "expected_source": "incoterms",
        "expected_keywords": ["Cost", "Insurance", "Freight"],
        "description": "Incoterm acronym",
    },
    {
        "id": "INCO-003",
        "category": "Incoterms",
        "question": "Can I use FOB by road?",
        "expected_source": "compatibility",
        "expected_keywords": ["no", "sea", "not"],
        "description": "Transport compatibility check",
    },

    # CMR Tests
    {
        "id": "CMR-001",
        "category": "CMR",
        "question": "What does CMR cover?",
        "expected_source": "cmr",
        "expected_keywords": ["road", "transport", "international"],
        "description": "CMR scope",
    },
    {
        "id": "CMR-002",
        "category": "CMR",
        "question": "What is CMR Article 17 about?",
        "expected_source": "cmr",
        "expected_keywords": ["liability", "damage", "carrier"],
        "description": "CMR article retrieval",
    },
    {
        "id": "CMR-003",
        "category": "CMR",
        "question": "How long are CMR claims valid?",
        "expected_source": "cmr",
        "expected_keywords": ["day", "time", "claim"],
        "description": "CMR time limits",
    },
]


class TestRunner:
    def __init__(self):
        self.results = {
            "total": 0,
            "passed": 0,
            "failed": 0,
            "by_category": {},
            "details": [],
        }

    def ask_question(self, question: str) -> str:
        """Send question to chat API and get response"""
        try:
            response = requests.post(
                f"{BACKEND_URL}/api/chat",
                json={"message": question},
                timeout=30,
            )
            response.raise_for_status()

            data = response.json()
            if "message" in data:
                return data["message"]
            raise ValueError("No message in response")

        except requests.exceptions.RequestException as e:
            raise RuntimeError(f"API Error: {e}")

    def check_keywords(
        self, response: str, keywords: List[str]
    ) -> Dict[str, any]:
        """Check if response contains expected keywords"""
        response_lower = response.lower()
        found = [kw for kw in keywords if kw.lower() in response_lower]
        missing = [kw for kw in keywords if kw.lower() not in response_lower]

        return {
            "found": found,
            "missing": missing,
            "match_rate": len(found) / len(keywords) if keywords else 0,
        }

    def has_citation(self, response: str) -> bool:
        """Check if response cites a source"""
        citation_patterns = ["source:", "faq-", "incoterm-", "cmr-", "id:"]
        return any(pattern in response.lower() for pattern in citation_patterns)

    def run_test(self, test_case: Dict) -> Tuple[bool, Dict]:
        """Run a single test"""
        print(f"\n📝 Testing: {test_case['id']} - {test_case['description']}")
        print(f"   Question: \"{test_case['question']}\"")

        try:
            # Add delay
            time.sleep(DELAY_BETWEEN_TESTS)

            # Get response
            response = self.ask_question(test_case["question"])
            print(f"   ✓ Got response ({len(response)} chars)")

            # Check keywords
            keyword_check = self.check_keywords(
                response, test_case["expected_keywords"]
            )
            print(
                f"   Keywords: {len(keyword_check['found'])}/{len(test_case['expected_keywords'])} found"
            )
            if keyword_check["missing"]:
                print(f"     Missing: {', '.join(keyword_check['missing'])}")

            # Check citation
            has_cite = self.has_citation(response)
            print(f"   Citation: {'✓ Found' if has_cite else '✗ Missing'}")

            # Determine pass/fail
            passed = keyword_check["match_rate"] >= 0.5 and has_cite
            print(f"   Result: {'✅ PASS' if passed else '❌ FAIL'}")

            # Record result
            self.results["total"] += 1
            if passed:
                self.results["passed"] += 1
            else:
                self.results["failed"] += 1

            category = test_case["category"]
            if category not in self.results["by_category"]:
                self.results["by_category"][category] = {"passed": 0, "total": 0}
            self.results["by_category"][category]["total"] += 1
            if passed:
                self.results["by_category"][category]["passed"] += 1

            self.results["details"].append(
                {
                    "id": test_case["id"],
                    "category": category,
                    "question": test_case["question"],
                    "passed": passed,
                    "keyword_match": keyword_check["match_rate"],
                    "has_citation": has_cite,
                    "response": response[:200] + "...",
                }
            )

            return passed, keyword_check

        except Exception as error:
            print(f"   ❌ ERROR: {error}")
            self.results["total"] += 1
            self.results["failed"] += 1

            category = test_case["category"]
            if category not in self.results["by_category"]:
                self.results["by_category"][category] = {"passed": 0, "total": 0}
            self.results["by_category"][category]["total"] += 1

            self.results["details"].append(
                {
                    "id": test_case["id"],
                    "category": category,
                    "question": test_case["question"],
                    "passed": False,
                    "error": str(error),
                }
            )

            return False, {"error": str(error)}

    def print_summary(self):
        """Print summary report"""
        print("\n" + "=" * 70)
        print("📊 TEST SUMMARY")
        print("=" * 70)

        print(f"\nOverall Results:")
        print(f"  Total:  {self.results['total']}")
        print(
            f"  Passed: {self.results['passed']} ({(self.results['passed'] / self.results['total'] * 100):.1f}%)"
        )
        print(
            f"  Failed: {self.results['failed']} ({(self.results['failed'] / self.results['total'] * 100):.1f}%)"
        )

        print(f"\nBy Category:")
        for category, stats in self.results["by_category"].items():
            percentage = (stats["passed"] / stats["total"] * 100) if stats["total"] > 0 else 0
            print(f"  {category}: {stats['passed']}/{stats['total']} ({percentage:.1f}%)")

        print(f"\nDetailed Results:")
        print("-" * 70)
        for detail in self.results["details"]:
            status = "✅" if detail["passed"] else "❌"
            cite = "📌" if detail.get("has_citation") else "⚠️"
            print(f"{status} {detail['id']} [{detail['category']}] {cite}")
            print(f"   Q: {detail['question']}")
            if "error" in detail:
                print(f"   Error: {detail['error']}")
            else:
                match_pct = (detail["keyword_match"] * 100) if "keyword_match" in detail else 0
                print(
                    f"   Keywords: {match_pct:.0f}% | Citation: {'Yes' if detail.get('has_citation') else 'No'}"
                )

        print("\n" + "=" * 70)
        print("✨ Test run complete!")
        print("=" * 70 + "\n")

        return self.results

    def run_all(self):
        """Run all tests"""
        print("🚀 Knowledge System Test Runner")
        print(f"Backend URL: {BACKEND_URL}")
        print(f"Total Tests: {len(TEST_CASES)}")
        print("-" * 70)

        # Check backend availability
        try:
            response = requests.get(f"{BACKEND_URL}/health", timeout=5)
            print("✓ Backend is reachable\n")
        except requests.exceptions.RequestException:
            print("❌ Backend not reachable!")
            print(f"   Make sure backend is running at {BACKEND_URL}")
            exit(1)

        # Run all tests
        for test_case in TEST_CASES:
            self.run_test(test_case)

        # Print summary
        self.print_summary()

        # Exit with appropriate code
        exit(0 if self.results["failed"] == 0 else 1)


if __name__ == "__main__":
    runner = TestRunner()
    runner.run_all()
