import express from "express"
import cors from "cors"
import { config } from "./config"
import chatRoutes from "./routes/chat.routes"
import knowledgeRoutes from "./routes/knowledge.routes"
import { loadYAMLData } from "./knowledge/yaml-tools"
import { loadIndex } from "./knowledge/search"
import { initEmbeddings } from "./knowledge/embeddings"
import { initDatabase } from "./knowledge/database-tools"

const app = express()

// Initialize knowledge system
async function initializeKnowledge() {
  console.log("[KNOWLEDGE] Initializing knowledge system...")
  try {
    // Initialize embedding model
    await initEmbeddings()
    
    // Load YAML lookup tables
    loadYAMLData()
    
    // Load vector search index
    await loadIndex()
    
    // NOTE: Database initialization deferred - would hang on startup
    // Initialize when first database query tool is called instead
    console.log("[KNOWLEDGE] Database initialization deferred to first use")
    
    console.log("[KNOWLEDGE] ✓ Knowledge system initialized")
  } catch (error) {
    console.error("[KNOWLEDGE] Failed to initialize:", error)
    // Don't exit - system can still work with degraded search
  }
}

// Middleware
console.log("[SERVER] Setting up middleware...")
app.use(express.json())

// Determine correct frontend URL
const frontendUrl = config.frontend.url
console.log(`[SERVER] Configuring CORS for frontend: ${frontendUrl}`)

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests from the configured frontend URL
      if (!origin || origin === frontendUrl || origin === "http://localhost:3000" || origin === "http://localhost:3001") {
        callback(null, true)
      } else {
        callback(new Error("CORS not allowed"))
      }
    },
    credentials: true,
  })
)
console.log(`[SERVER] CORS configured`)

// Health check
app.get("/health", (req, res) => {
  console.log("[HEALTH] Health check requested")
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

// Routes
console.log("[SERVER] Registering routes...")
app.use("/api/chat", chatRoutes)
app.use("/api/knowledge", knowledgeRoutes)

// 404 handler
app.use((req, res) => {
  console.warn(`[SERVER] 404 - Route not found: ${req.method} ${req.path}`)
  res.status(404).json({
    success: false,
    error: "Route not found",
  })
})

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("[SERVER] Unhandled error:", err)
  res.status(500).json({
    success: false,
    error: "Internal server error",
  })
})

const port = config.port

// Start server with knowledge initialization
initializeKnowledge().then(() => {
  app.listen(port, () => {
    console.log(`\n${"=".repeat(60)}`)
    console.log(`🚀 LogHub Backend running on http://localhost:${port}`)
    console.log(`📝 Environment: ${config.nodeEnv}`)
    console.log(`🔌 OpenRouter Model: ${config.openrouter.model}`)
    console.log(`🌐 Frontend URL: ${config.frontend.url}`)
    console.log(`${"=".repeat(60)}\n`)
  })
})
