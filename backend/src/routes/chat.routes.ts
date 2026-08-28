import express, { Router, Request, Response } from "express"
import { OpenRouterService } from "../services/openrouter.service"

const router = Router()
const openrouterService = new OpenRouterService()

interface ChatRequest {
  message: string
}

interface ChatResponse {
  success: boolean
  message?: string
  error?: string
}

// POST /api/chat
router.post("/", async (req: Request<{}, {}, ChatRequest>, res: Response<ChatResponse>) => {
  try {
    console.log("[CHAT] Incoming request from:", req.ip)
    console.log("[CHAT] Request body:", req.body)
    
    const { message } = req.body

    if (!message || typeof message !== "string") {
      console.warn("[CHAT] Invalid request: message missing or not a string")
      return res.status(400).json({
        success: false,
        error: "Invalid request: message is required and must be a string",
      })
    }

    console.log("[CHAT] Processing message:", message.substring(0, 50) + "...")
    const response = await openrouterService.sendMessage(message.trim())

    console.log("[CHAT] Response generated successfully")
    return res.json({
      success: true,
      message: response,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("[CHAT] Error occurred:", errorMessage)
    console.error("[CHAT] Stack:", error instanceof Error ? error.stack : "No stack trace")

    return res.status(500).json({
      success: false,
      error: errorMessage,
    })
  }
})

export default router
