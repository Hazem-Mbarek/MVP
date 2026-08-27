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
    const { message } = req.body

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        error: "Invalid request: message is required and must be a string",
      })
    }

    const response = await openrouterService.sendMessage(message.trim())

    return res.json({
      success: true,
      message: response,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("Chat error:", errorMessage)

    return res.status(500).json({
      success: false,
      error: errorMessage,
    })
  }
})

export default router
