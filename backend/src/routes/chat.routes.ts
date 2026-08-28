import express, { Router, Request, Response } from "express"
import { AgentOrchestrator, TaskEvent } from "../services/agent-orchestrator"

const router = Router()

interface ChatRequest {
  message: string
}

interface ChatResponse {
  success: boolean
  message?: string
  error?: string
}

// POST /api/chat - Returns full response (legacy)
router.post("/", async (req: Request<{}, {}, ChatRequest>, res: Response<ChatResponse>) => {
  try {
    console.log("[CHAT] === INCOMING REQUEST ===")
    console.log("[CHAT] Request from:", req.ip)
    console.log("[CHAT] Body:", req.body)
    
    const { message } = req.body

    if (!message || typeof message !== "string") {
      console.warn("[CHAT] Invalid request: message missing or not a string")
      return res.status(400).json({
        success: false,
        error: "Invalid request: message is required and must be a string",
      })
    }

    console.log("[CHAT] Processing message:", message.substring(0, 50) + "...")
    const agentOrchestrator = new AgentOrchestrator()
    console.log("[CHAT] Calling agentOrchestrator.processQuestion...")
    const response = await agentOrchestrator.processQuestion(message.trim())
    console.log("[CHAT] Response received, length:", response ? response.length : "null")

    console.log("[CHAT] Response generated successfully")
    return res.json({
      success: true,
      message: response,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("[CHAT] === ERROR ===")
    console.error("[CHAT] Error occurred:", errorMessage)
    console.error("[CHAT] Error type:", error instanceof Error ? error.constructor.name : typeof error)
    console.error("[CHAT] Stack:", error instanceof Error ? error.stack : "No stack trace")
    console.error("[CHAT] Full error:", error)

    return res.status(500).json({
      success: false,
      error: errorMessage,
    })
  }
})

// POST /api/chat/stream - Returns streaming task progress + final answer
router.post("/stream", async (req: Request<{}, {}, ChatRequest>, res: Response) => {
  try {
    const { message } = req.body

    if (!message || typeof message !== "string") {
      console.warn("[CHAT] Invalid request: message missing or not a string")
      return res.status(400).json({
        success: false,
        error: "Invalid request: message is required and must be a string",
      })
    }

    console.log("[CHAT-STREAM] Processing message:", message.substring(0, 50) + "...")

    // Set up SSE headers
    res.setHeader("Content-Type", "text/event-stream")
    res.setHeader("Cache-Control", "no-cache")
    res.setHeader("Connection", "keep-alive")
    res.setHeader("Access-Control-Allow-Origin", "*")

    const agentOrchestrator = new AgentOrchestrator()

    // Register event listener to stream task progress
    agentOrchestrator.addEventListener((event: TaskEvent) => {
      const sseMessage = `data: ${JSON.stringify(event)}\n\n`
      console.log("[CHAT-STREAM] Sending event:", event.type)
      res.write(sseMessage)
    })

    // Process the question
    const finalAnswer = await agentOrchestrator.processQuestion(message.trim())

    // Send final answer event (if not already sent)
    const finalEvent: TaskEvent = {
      type: "final_answer",
      data: finalAnswer,
    }
    res.write(`data: ${JSON.stringify(finalEvent)}\n\n`)

    console.log("[CHAT-STREAM] Closing stream")
    res.end()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("[CHAT-STREAM] Error:", errorMessage)

    const errorEvent: TaskEvent = {
      type: "final_answer",
      data: JSON.stringify({ error: errorMessage }),
    }
    res.write(`data: ${JSON.stringify(errorEvent)}\n\n`)
    res.end()
  }
})

export default router
