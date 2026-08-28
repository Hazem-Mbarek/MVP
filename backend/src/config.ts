import dotenv from "dotenv"
import path from "path"

const envPath = path.resolve(__dirname, "../.env")
console.log(`[CONFIG] Loading .env from: ${envPath}`)
dotenv.config({ path: envPath })

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  openrouter: {
    apiKey: process.env.OPENROUTER_API_KEY,
    apiKeyFallback: process.env.OPENROUTER_API_KEY_FALLBACK,
    baseUrl: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
    model: process.env.OPENROUTER_MODEL || "openai/gpt-oss-120b",
  },
  frontend: {
    url: process.env.FRONTEND_URL || "http://localhost:3000",
  },
}

// Log configuration (without exposing full API key)
console.log("[CONFIG] Environment variables loaded:")
console.log(`  - PORT: ${config.port}`)
console.log(`  - NODE_ENV: ${config.nodeEnv}`)
console.log(`  - OPENROUTER_API_KEY: ${config.openrouter.apiKey ? "SET" : "MISSING"}`)
console.log(`  - OPENROUTER_API_KEY_FALLBACK: ${config.openrouter.apiKeyFallback ? "SET" : "NOT SET"}`)
console.log(`  - OPENROUTER_BASE_URL: ${config.openrouter.baseUrl}`)
console.log(`  - OPENROUTER_MODEL: ${config.openrouter.model}`)
console.log(`  - FRONTEND_URL: ${config.frontend.url}`)

// Validate required config
if (!config.openrouter.apiKey) {
  throw new Error("OPENROUTER_API_KEY is required in .env file")
}
