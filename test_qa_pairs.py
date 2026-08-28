#!/usr/bin/env python3
"""
Generate Q&A pairs test and save to file for manual accuracy review
"""

import requests
import json
import time
from datetime import datetime

BACKEND_URL = "http://localhost:5000"
OUTPUT_FILE = "qa_test_results.txt"

# Comprehensive test questions covering all data sources and routing rules
TEST_QUESTIONS = [
    # Complex FAQ scenarios
    ("FAQ - Operational", "We have a client in Austria asking about our services — what can we offer them and how do we typically handle international moves?"),
    ("FAQ - Cross-border", "A French shipper wants to know if NordRoute can handle their regularly scheduled shipments — what markets do we serve and what's our coverage like?"),
    
    # Complex Incoterm scenarios requiring routing to YAML first
    ("Routing - Compatibility First", "A client wants to ship machinery via rail using FOB terms. Is this combination valid? What are the alternatives?"),
    ("Routing - Comparison + Context", "We're bidding on two shipments: one needs CIF coverage, another needs DAP. What are the key differences and which Incoterm shifts more responsibility to us?"),
    
    # Deep CMR + Incoterm cross-source reasoning
    ("Cross-Source - Liability", "If we quote DDP by road under CMR, and goods arrive damaged because they were improperly stacked by our warehouse, who bears the liability and why?"),
    ("Cross-Source - Risk Transfer", "A client is shipping fragile electronics DDP via road. At what point do we assume liability under CMR? What happens if damage occurs in transit vs. after delivery?"),
    
    # Complex semantic reasoning requiring multiple tool calls
    ("Semantic - Scenario Analysis", "A shipper packs goods inadequately for a CIP sea journey. The goods are damaged en route. Under CMR principles (if this were road), would the shipper or carrier be liable? Explain the logic."),
    ("Semantic - Attribute Reasoning", "Which Incoterm gives the buyer the most control over insurance and carriage, and why would CMR Article 35 (successive carriers) matter for that choice?"),
    
    # Edge cases testing coverage gaps and refusal
    ("Edge Case - Unknown", "What are your warehouse throughput metrics and daily capacity limits?"),
    ("Edge Case - Mixed Trigger", "Compare CIF vs. our standard FAQ service offerings for European routes"),
    
    # Specific article lookups with context
    ("CMR Article Deep Dive", "CMR Article 17 discusses carrier liability. What specific circumstances can relieve the carrier of responsibility, and what about the special risks listed in Article 17(4)?"),
    ("CMR Documentation", "Under CMR, what role does the consignment note play as evidence? Can a carrier dispute the contents of a properly completed consignment note?"),
    
    # Incoterm attribute queries (should route to YAML comparison tool)
    ("Incoterm Attribute - Carriage", "Under EXW, who arranges and pays for carriage? Compare this to DDP."),
    ("Incoterm Attribute - Insurance", "In CIF, who is responsible for buying insurance? Is this different under CIP?"),
    ("Incoterm Attribute - Risk", "When does risk transfer to the buyer under FOB? What about under DDP?"),
    
    # Complex real-world scenarios
    ("Real World 1", "A client quotes FOB for a land-locked customer in Poland, shipping via truck. Is this incoterm suitable? If not, what would you recommend and why?"),
    ("Real World 2", "We're the last carrier in a multi-leg journey (article 35). A previous carrier's negligence caused damage. Does our liability differ from if we were the sole carrier?"),
    ("Real World 3", "A shipper claims we damaged goods on a CIP shipment, but the goods were improperly packaged. Under CMR, can we defend ourselves? What does the consignment note evidence?"),
    
    # Routing edge cases
    ("Routing Test - Decompose 1", "Is DDP suitable for air cargo to Germany, and what's our liability for goods that arrive late under these terms?"),
    ("Routing Test - Decompose 2", "Compare the insurance obligations in CIF vs. FCA, and explain when each would be appropriate for NordRoute's typical lanes."),
]

def run_tests():
    """Run all tests and save results"""
    results = []
    
    print("[TEST] Starting Q&A Accuracy Test")
    print(f"[TEST] Total questions: {len(TEST_QUESTIONS)}")
    print(f"[TEST] Saving to: {OUTPUT_FILE}")
    print("[TEST] This may take several minutes...\n")
    
    for idx, (category, question) in enumerate(TEST_QUESTIONS, 1):
        print(f"[{idx}/{len(TEST_QUESTIONS)}] {category}: {question[:60]}...", end=" ", flush=True)
        
        start_time = time.time()
        try:
            response = requests.post(
                f"{BACKEND_URL}/api/chat",
                json={"message": question},
                timeout=60
            )
            elapsed = time.time() - start_time
            
            data = response.json()
            
            if data.get("success"):
                answer = data.get("message", "")
                results.append({
                    "category": category,
                    "question": question,
                    "answer": answer,
                    "response_time": f"{elapsed:.1f}s",
                    "status": "SUCCESS"
                })
                print(f"OK ({elapsed:.1f}s)")
            else:
                error = data.get("error", "Unknown error")
                results.append({
                    "category": category,
                    "question": question,
                    "answer": f"ERROR: {error}",
                    "response_time": f"{elapsed:.1f}s",
                    "status": "ERROR"
                })
                print(f"ERROR")
                
        except requests.exceptions.Timeout:
            elapsed = time.time() - start_time
            results.append({
                "category": category,
                "question": question,
                "answer": "TIMEOUT - Request exceeded 60 seconds",
                "response_time": f"{elapsed:.1f}s",
                "status": "TIMEOUT"
            })
            print(f"TIMEOUT")
        except Exception as e:
            elapsed = time.time() - start_time
            results.append({
                "category": category,
                "question": question,
                "answer": f"EXCEPTION: {str(e)}",
                "response_time": f"{elapsed:.1f}s",
                "status": "EXCEPTION"
            })
            print(f"EXCEPTION")
    
    # Write results to file
    write_results(results)
    
    # Print summary
    print_summary(results)

def write_results(results):
    """Write Q&A pairs to file"""
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write("=" * 80 + "\n")
        f.write(f"Q&A ACCURACY TEST RESULTS\n")
        f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"Total Questions: {len(results)}\n")
        f.write("=" * 80 + "\n\n")
        
        # Group by category
        categories = {}
        for result in results:
            cat = result["category"]
            if cat not in categories:
                categories[cat] = []
            categories[cat].append(result)
        
        for category in sorted(categories.keys()):
            f.write(f"\n{'='*80}\n")
            f.write(f"CATEGORY: {category}\n")
            f.write(f"{'='*80}\n\n")
            
            for idx, result in enumerate(categories[category], 1):
                f.write(f"[{category}-{idx}]\n")
                f.write(f"Status: {result['status']} | Response Time: {result['response_time']}\n")
                f.write(f"\nQUESTION:\n{result['question']}\n\n")
                f.write(f"ANSWER:\n{result['answer']}\n")
                f.write(f"\n{'-'*80}\n\n")
    
    print(f"\n[RESULTS] Saved to {OUTPUT_FILE}")

def print_summary(results):
    """Print test summary"""
    success_count = sum(1 for r in results if r["status"] == "SUCCESS")
    error_count = sum(1 for r in results if r["status"] == "ERROR")
    timeout_count = sum(1 for r in results if r["status"] == "TIMEOUT")
    exception_count = sum(1 for r in results if r["status"] == "EXCEPTION")
    
    avg_time = sum(
        float(r["response_time"].rstrip("s"))
        for r in results if r["status"] == "SUCCESS"
    ) / max(success_count, 1)
    
    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    print(f"Total:     {len(results)}")
    print(f"Success:   {success_count} ({success_count*100//len(results)}%)")
    print(f"Error:     {error_count}")
    print(f"Timeout:   {timeout_count}")
    print(f"Exception: {exception_count}")
    print(f"Avg Response Time: {avg_time:.1f}s")
    print("=" * 80)

if __name__ == "__main__":
    try:
        run_tests()
    except KeyboardInterrupt:
        print("\n[TEST] Interrupted by user")
        exit(1)
    except Exception as e:
        print(f"\n[ERROR] {e}")
        exit(1)
