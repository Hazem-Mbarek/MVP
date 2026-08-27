import express from "express"
import cors from "cors"
import { config } from "./config"
import chatRoutes from "./routes/chat.routes"

const app = express()

// Middleware
app.use(express.json())
app.use(
  cors({
    origin: config.frontend.url,
    credentials: true,
  })
)

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

// Routes
app.use("/api/chat", chatRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  })
})

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Server error:", err)
  res.status(500).json({
    success: false,
    error: "Internal server error",
  })
})

const port = config.port
app.listen(port, () => {
  console.log(`🚀 LogHub Backend running on http://localhost:${port}`)
  console.log(`📝 Environment: ${config.nodeEnv}`)
  console.log(`🔌 OpenRouter Model: ${config.openrouter.model}`)
})
