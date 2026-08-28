#!/usr/bin/env node

/**
 * Automated Test Runner for Knowledge System
 * Tests basic data extraction from FAQ, Incoterms, and CMR sources
 */

const axios = require("axios")

const BACKEND_URL = "http://localhost:5000"
const DELAY_BETWEEN_TESTS = 1000 // ms

// Simple test cases - one per source
const testCases = [
  // FAQ Tests
  {
    id: "FAQ-001",
    category: "FAQ",
    question: "What is NordRoute Logistics?",
    expectedSource: "faq",
    expectedKeywords: ["German", "logistics", "Dortmund"],
    description: "Company info retrieval",
  },
  {
    id: "FAQ-002",
    category: "FAQ",
    question: "Where is NordRoute headquartered?",
    expectedSource: "faq",
    expectedKeywords: ["Dortmund", "Germany"],
    description: "Geographic info",
  },
  {
    id: "FAQ-003",
    category: "FAQ",
    question: "Which countries does NordRoute serve?",
    expectedSource: "faq",
    expectedKeywords: ["France", "Belgium", "Germany"],
    description: "Service coverage",
  },

  // Incoterms Tests
  {
    id: "INCO-001",
    category: "Incoterms",
    question: "What is FOB?",
    expectedSource: "incoterms",
    expectedKeywords: ["Free", "Board", "sea", "risk"],
    description: "Incoterm definition",
  },
  {
    id: "INCO-002",
    category: "Incoterms",
    question: "What does CIF stand for?",
    expectedSource: "incoterms",
    expectedKeywords: ["Cost", "Insurance", "Freight"],
    description: "Incoterm acronym",
  },
  {
    id: "INCO-003",
    category: "Incoterms",
    question: "Can I use FOB by road?",
    expectedSource: "compatibility",
    expectedKeywords: ["no", "sea", "not"],
    description: "Transport compatibility check",
  },

  // CMR Tests
  {
    id: "CMR-001",
    category: "CMR",
    question: "What does CMR cover?",
    expectedSource: "cmr",
    expectedKeywords: ["road", "transport", "international"],
    description: "CMR scope",
  },
  {
    id: "CMR-002",
    category: "CMR",
    question: "What is CMR Article 17 about?",
    expectedSource: "cmr",
    expectedKeywords: ["liability", "damage", "carrier"],
    description: "CMR article retrieval",
  },
  {
    id: "CMR-003",
    category: "CMR",
    question: "How long are CMR claims valid?",
    expectedSource: "cmr",
    expectedKeywords: ["day", "time", "claim"],
    description: "CMR time limits",
  },
]

// Results tracking
let results = {
  total: 0,
  passed: 0,
  failed: 0,
  byCategory: {},
  details: [],
}

/**
 * Send question to chat API and get response
 */
async function askQuestion(question) {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/chat`,
      { message: question },
      { timeout: 30000 }
    )

    if (response.data && response.data.message) {
      return response.data.message
    }
    throw new Error("No message in response")
  } catch (error) {
    throw new Error(`API Error: ${error.message}`)
  }
}

/**
 * Check if response contains expected keywords
 */
function checkKeywords(response, keywords) {
  const lowerResponse = response.toLowerCase()
  const foundKeywords = keywords.filter(keyword =>
    lowerResponse.includes(keyword.toLowerCase())
  )
  return {
    found: foundKeywords,
    missing: keywords.filter(kw => !foundKeywords.includes(kw)),
    matchRate: foundKeywords.length / keywords.length,
  }
}

/**
 * Check if response cites a source
 */
function hasCitation(response) {
  const citationPatterns = [
    /source:/i,
    /faq-/i,
    /incoterm-/i,
    /cmr-/i,
    /\(.*id.*\)/i,
  ]
  return citationPatterns.some(pattern => pattern.test(response))
}

/**
 * Run a single test
 */
async function runTest(testCase) {
  console.log(`\n📝 Testing: ${testCase.id} - ${testCase.description}`)
  console.log(`   Question: "${testCase.question}"`)

  try {
    // Add delay to avoid overwhelming API
    await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_TESTS))

    // Get response
    const response = await askQuestion(testCase.question)
    console.log(`   ✓ Got response (${response.length} chars)`)

    // Check keywords
    const keywordCheck = checkKeywords(response, testCase.expectedKeywords)
    console.log(
      `   Keywords: ${keywordCheck.found.length}/${testCase.expectedKeywords.length} found`
    )
    if (keywordCheck.missing.length > 0) {
      console.log(`     Missing: ${keywordCheck.missing.join(", ")}`)
    }

    // Check citation
    const hasCite = hasCitation(response)
    console.log(`   Citation: ${hasCite ? "✓ Found" : "✗ Missing"}`)

    // Determine pass/fail
    const passed = keywordCheck.matchRate >= 0.5 && hasCite
    console.log(`   Result: ${passed ? "✅ PASS" : "❌ FAIL"}`)

    // Record result
    results.total++
    if (passed) {
      results.passed++
    } else {
      results.failed++
    }

    if (!results.byCategory[testCase.category]) {
      results.byCategory[testCase.category] = { passed: 0, total: 0 }
    }
    results.byCategory[testCase.category].total++
    if (passed) {
      results.byCategory[testCase.category].passed++
    }

    results.details.push({
      id: testCase.id,
      category: testCase.category,
      question: testCase.question,
      passed,
      keywordMatch: keywordCheck.matchRate,
      hasCitation: hasCite,
      response: response.substring(0, 200) + "...",
    })

    return { passed, keywordMatch: keywordCheck.matchRate, hasCite }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`)
    results.total++
    results.failed++

    if (!results.byCategory[testCase.category]) {
      results.byCategory[testCase.category] = { passed: 0, total: 0 }
    }
    results.byCategory[testCase.category].total++

    results.details.push({
      id: testCase.id,
      category: testCase.category,
      question: testCase.question,
      passed: false,
      error: error.message,
    })

    return { passed: false, error: error.message }
  }
}

/**
 * Print summary report
 */
function printSummary() {
  console.log("\n" + "=".repeat(70))
  console.log("📊 TEST SUMMARY")
  console.log("=".repeat(70))

  console.log(`\nOverall Results:`)
  console.log(`  Total:  ${results.total}`)
  console.log(`  Passed: ${results.passed} (${((results.passed / results.total) * 100).toFixed(1)}%)`)
  console.log(`  Failed: ${results.failed} (${((results.failed / results.total) * 100).toFixed(1)}%)`)

  console.log(`\nBy Category:`)
  for (const [category, stats] of Object.entries(results.byCategory)) {
    const percentage = ((stats.passed / stats.total) * 100).toFixed(1)
    console.log(`  ${category}: ${stats.passed}/${stats.total} (${percentage}%)`)
  }

  console.log(`\nDetailed Results:`)
  console.log("-".repeat(70))
  for (const detail of results.details) {
    const status = detail.passed ? "✅" : "❌"
    const cite = detail.hasCitation ? "📌" : "⚠️"
    console.log(`${status} ${detail.id} [${detail.category}] ${cite}`)
    console.log(`   Q: ${detail.question}`)
    if (detail.error) {
      console.log(`   Error: ${detail.error}`)
    } else {
      console.log(
        `   Keywords: ${(detail.keywordMatch * 100).toFixed(0)}% | Citation: ${detail.hasCitation ? "Yes" : "No"}`
      )
    }
  }

  console.log("\n" + "=".repeat(70))
  console.log("✨ Test run complete!")
  console.log("=".repeat(70) + "\n")
}

/**
 * Main execution
 */
async function main() {
  console.log("🚀 Knowledge System Test Runner")
  console.log(`Backend URL: ${BACKEND_URL}`)
  console.log(`Total Tests: ${testCases.length}`)
  console.log("-".repeat(70))

  // Check backend availability
  try {
    await axios.get(`${BACKEND_URL}/health`, { timeout: 5000 })
    console.log("✓ Backend is reachable\n")
  } catch (error) {
    console.error("❌ Backend not reachable!")
    console.error(`   Make sure backend is running at ${BACKEND_URL}`)
    process.exit(1)
  }

  // Run all tests sequentially
  for (const testCase of testCases) {
    await runTest(testCase)
  }

  // Print results
  printSummary()

  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0)
}

// Run the tests
main().catch(error => {
  console.error("Fatal error:", error)
  process.exit(1)
})
