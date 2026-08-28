/**
 * Semantic embeddings using all-MiniLM-L6-v2
 * Persistent Python process for fast query embedding
 */

import { spawn, SpawnOptions } from "child_process"
import * as path from "path"

let embeddingProcess: any = null
let isReady = false
const queryQueue: Array<{
  query: string
  resolve: (vector: number[]) => void
  reject: (error: Error) => void
}> = []

async function initEmbeddingsProcess() {
  return new Promise<void>((resolve, reject) => {
    const scriptPath = path.resolve(__dirname, "../../..", "data", "embedding_service.py")
    
    const options: any = {
      stdio: ["pipe", "pipe", "pipe"],
      maxBuffer: 10 * 1024 * 1024,
    }
    
    embeddingProcess = spawn("python", [scriptPath], options)
    
    let ready = false
    
    embeddingProcess.stderr.on("data", (data: Buffer) => {
      const message = data.toString("utf-8").trim()
      if (message === "MODEL_READY") {
        ready = true
        isReady = true
        console.log("[EMBEDDINGS] Persistent process ready")
        resolve()
      } else if (message && !ready) {
        console.log(`[EMBEDDINGS] ${message}`)
      }
    })
    
    embeddingProcess.stdout.on("data", (data: Buffer) => {
      if (!queryQueue.length) return
      
      try {
        const vector = JSON.parse(data.toString("utf-8").trim())
        const pending = queryQueue.shift()
        if (pending) {
          if (vector && vector.length === 384) {
            pending.resolve(vector)
          } else {
            pending.reject(new Error("Invalid embedding size"))
          }
        }
      } catch (e) {
        const pending = queryQueue.shift()
        if (pending) {
          pending.reject(new Error("Failed to parse embedding"))
        }
      }
    })
    
    embeddingProcess.on("error", (error: Error) => {
      if (!ready) {
        reject(error)
      } else {
        console.error("[EMBEDDINGS] Process error:", error)
      }
    })
    
    embeddingProcess.on("close", () => {
      isReady = false
      embeddingProcess = null
    })
    
    // Timeout if model doesn't load in 60s
    setTimeout(() => {
      if (!ready) {
        reject(new Error("Embedding service failed to start within 60 seconds"))
      }
    }, 60000)
  })
}

export async function initEmbeddings() {
  console.log("[EMBEDDINGS] Initializing semantic embedding system...")
  console.log("[EMBEDDINGS] Using all-MiniLM-L6-v2 with persistent process")
  console.log("[EMBEDDINGS] Vector dimensions: 384")
  
  try {
    await initEmbeddingsProcess()
    console.log("[EMBEDDINGS] System ready")
  } catch (error) {
    console.error("[EMBEDDINGS] Failed to initialize:", error)
    throw error
  }
}

export async function embed(text: string): Promise<number[]> {
  if (!embeddingProcess || !isReady) {
    throw new Error("Embedding service not initialized")
  }
  
  return new Promise<number[]>((resolve, reject) => {
    // Add to queue with timeout
    const timeout = setTimeout(() => {
      const index = queryQueue.findIndex(item => item.reject === reject)
      if (index >= 0) {
        queryQueue.splice(index, 1)
      }
      reject(new Error("Embedding request timeout"))
    }, 30000)
    
    queryQueue.push({
      query: text,
      resolve: (vector) => {
        clearTimeout(timeout)
        resolve(vector)
      },
      reject: (error) => {
        clearTimeout(timeout)
        reject(error)
      },
    })
    
    // Send query to process
    try {
      embeddingProcess.stdin.write(text + "\n")
    } catch (error) {
      // Remove from queue if write fails
      const index = queryQueue.length - 1
      if (index >= 0) {
        queryQueue.splice(index, 1)
      }
      reject(new Error("Failed to send query to embedding service"))
    }
  })
}
