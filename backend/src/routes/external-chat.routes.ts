import express, { Router, Request, Response } from "express"
import { ExternalAgentOrchestrator, TaskEvent } from "../services/external-agent-orchestrator"

const router = Router()

interface ExternalChatRequest {
  message: string
  clientId?: string // Would come from JWT/session in production
}

interface ChatResponse {
  success: boolean
  message?: string
  error?: string
}

// Middleware: extract and validate session client ID
// In production, this would come from JWT or session middleware
function extractSessionClientId(req: Request): string {
  // For now, use query param or header; in production use proper auth
  const clientId = req.query.clientId as string || req.headers["x-client-id"] as string

  if (!clientId) {
    throw new Error("No client ID in session. Authentication required.")
  }

  // Validate format (basic example)
  if (!/^\d+$/.test(clientId)) {
    throw new Error("Invalid client ID format")
  }

  console.log("[EXTERNAL-CHAT] Session client ID:", clientId)
  return clientId
}

// POST /api/external-chat - Returns full response (legacy)
router.post("/", async (req: Request<{}, {}, ExternalChatRequest>, res: Response<ChatResponse>) => {
  try {
    console.log("[EXTERNAL-CHAT] === INCOMING REQUEST ===")
    console.log("[EXTERNAL-CHAT] Request from:", req.ip)

    const sessionClientId = extractSessionClientId(req)
    const { message } = req.body

    if (!message || typeof message !== "string") {
      console.warn("[EXTERNAL-CHAT] Invalid request: message missing or not a string")
      return res.status(400).json({
        success: false,
        error: "Invalid request: message is required and must be a string",
      })
    }

    console.log("[EXTERNAL-CHAT] Processing message:", message.substring(0, 50) + "...")
    const externalOrchestrator = new ExternalAgentOrchestrator(sessionClientId)
    console.log("[EXTERNAL-CHAT] Calling externalOrchestrator.processQuestion...")
    const response = await externalOrchestrator.processQuestion(message.trim())
    console.log("[EXTERNAL-CHAT] Response received, length:", response ? response.length : "null")

    console.log("[EXTERNAL-CHAT] Response generated successfully")
    return res.json({
      success: true,
      message: response,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("[EXTERNAL-CHAT] === ERROR ===")
    console.error("[EXTERNAL-CHAT] Error occurred:", errorMessage)

    return res.status(500).json({
      success: false,
      error: errorMessage,
    })
  }
})

// POST /api/external-chat/stream - Returns streaming task progress + final answer
router.post("/stream", async (req: Request<{}, {}, ExternalChatRequest>, res: Response) => {
  try {
    const sessionClientId = extractSessionClientId(req)
    const { message } = req.body

    if (!message || typeof message !== "string") {
      console.warn("[EXTERNAL-CHAT-STREAM] Invalid request: message missing or not a string")
      return res.status(400).json({
        success: false,
        error: "Invalid request: message is required and must be a string",
      })
    }

    console.log("[EXTERNAL-CHAT-STREAM] Processing message:", message.substring(0, 50) + "...")
    console.log("[EXTERNAL-CHAT-STREAM] Session client ID:", sessionClientId)

    // Set up SSE headers
    res.setHeader("Content-Type", "text/event-stream")
    res.setHeader("Cache-Control", "no-cache")
    res.setHeader("Connection", "keep-alive")
    res.setHeader("Access-Control-Allow-Origin", "*")

    const externalOrchestrator = new ExternalAgentOrchestrator(sessionClientId)

    // Register event listener to stream task progress
    externalOrchestrator.addEventListener((event: TaskEvent) => {
      const sseMessage = `data: ${JSON.stringify(event)}\n\n`
      console.log("[EXTERNAL-CHAT-STREAM] Sending event:", event.type)
      res.write(sseMessage)
    })

    // Process the question
    const finalAnswer = await externalOrchestrator.processQuestion(message.trim())

    // Send final answer event
    const finalEvent: TaskEvent = {
      type: "final_answer",
      data: finalAnswer,
    }
    res.write(`data: ${JSON.stringify(finalEvent)}\n\n`)

    console.log("[EXTERNAL-CHAT-STREAM] Closing stream")
    res.end()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("[EXTERNAL-CHAT-STREAM] Error:", errorMessage)

    const errorEvent: TaskEvent = {
      type: "final_answer",
      data: JSON.stringify({ error: errorMessage }),
    }
    res.write(`data: ${JSON.stringify(errorEvent)}\n\n`)
    res.end()
  }
})

export default router
