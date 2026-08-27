import dotenv from "dotenv"

dotenv.config()

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  openrouter: {
    apiKey: process.env.OPENROUTER_API_KEY,
    baseUrl: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
    model: process.env.OPENROUTER_MODEL || "openai/gpt-oss-120b",
  },
  frontend: {
    url: process.env.FRONTEND_URL || "http://localhost:3000",
  },
}

// Validate required config
if (!config.openrouter.apiKey) {
  throw new Error("OPENROUTER_API_KEY is required")
}
