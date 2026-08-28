/**
 * Build embedding index from JSONL files
 * This script calls the Python embeddings generator
 * Run once: npm run build-index
 */

import { execSync } from "child_process"
import path from "path"

async function buildIndex() {
  console.log("[BUILD-INDEX] Starting index build...")
  console.log("[BUILD-INDEX] Calling Python embeddings generator...")
  console.log("[BUILD-INDEX] This takes ~2-5 minutes on first run (downloading model)...")

  try {
    // Get project root
    const projectRoot = path.resolve(__dirname, "../../../")

    // Run Python script to generate embeddings
    const command = `python data/generate_embeddings.py`
    console.log(`[BUILD-INDEX] Running: ${command}`)

    const output = execSync(command, {
      cwd: projectRoot,
      stdio: "inherit", // Show all output
      encoding: "utf-8",
    })

    console.log("[BUILD-INDEX] ✓ Index built successfully")
  } catch (error: any) {
    console.error("[BUILD-INDEX] Error:", error.message)
    process.exit(1)
  }
}

buildIndex()
