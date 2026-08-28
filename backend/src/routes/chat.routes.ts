import express, { Router, Request, Response } from "express"
import { AgentOrchestrator, TaskEvent } from "../services/agent-orchestrator"
import { ExternalAgentOrchestrator } from "../services/external-agent-orchestrator"

const router = Router()

interface ChatRequest {
  message: string
  clientId?: string
}

interface ChatResponse {
  success: boolean
  message?: string
  error?: string
}

// POST /api/chat - Returns full response (internal agent)
router.post("/", async (req: Request<{}, {}, ChatRequest>, res: Response<ChatResponse>) => {
  try {
    console.log("[CHAT] === INCOMING REQUEST ===")
    console.log("[CHAT] Request from:", req.ip)
    
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

    return res.status(500).json({
      success: false,
      error: errorMessage,
    })
  }
})

// POST /api/chat/stream - Internal agent with streaming task progress
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

// POST /api/chat/external - External customer agent (proxy to /api/external-chat)
router.post("/external", async (req: Request<{}, {}, ChatRequest>, res: Response<ChatResponse>) => {
  try {
    const sessionClientId = req.query.clientId as string || req.headers["x-client-id"] as string

    if (!sessionClientId) {
      return res.status(401).json({
        success: false,
        error: "No client ID in session. Authentication required.",
      })
    }

    const { message } = req.body

    if (!message || typeof message !== "string") {
      console.warn("[CHAT-EXTERNAL] Invalid request: message missing or not a string")
      return res.status(400).json({
        success: false,
        error: "Invalid request: message is required and must be a string",
      })
    }

    console.log("[CHAT-EXTERNAL] Processing message:", message.substring(0, 50) + "...")
    console.log("[CHAT-EXTERNAL] Session client ID:", sessionClientId)

    const externalOrchestrator = new ExternalAgentOrchestrator(sessionClientId)
    const response = await externalOrchestrator.processQuestion(message.trim())

    return res.json({
      success: true,
      message: response,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("[CHAT-EXTERNAL] Error:", errorMessage)

    return res.status(500).json({
      success: false,
      error: errorMessage,
    })
  }
})

// POST /api/chat/external/stream - External customer agent with streaming (proxy to /api/external-chat/stream)
router.post("/external/stream", async (req: Request<{}, {}, ChatRequest>, res: Response) => {
  try {
    const sessionClientId = req.query.clientId as string || req.headers["x-client-id"] as string

    if (!sessionClientId) {
      return res.status(401).json({
        success: false,
        error: "No client ID in session. Authentication required.",
      })
    }

    const { message } = req.body

    if (!message || typeof message !== "string") {
      console.warn("[CHAT-EXTERNAL-STREAM] Invalid request: message missing or not a string")
      return res.status(400).json({
        success: false,
        error: "Invalid request: message is required and must be a string",
      })
    }

    console.log("[CHAT-EXTERNAL-STREAM] Processing message:", message.substring(0, 50) + "...")
    console.log("[CHAT-EXTERNAL-STREAM] Session client ID:", sessionClientId)

    // Set up SSE headers
    res.setHeader("Content-Type", "text/event-stream")
    res.setHeader("Cache-Control", "no-cache")
    res.setHeader("Connection", "keep-alive")
    res.setHeader("Access-Control-Allow-Origin", "*")

    const externalOrchestrator = new ExternalAgentOrchestrator(sessionClientId)

    // Register event listener to stream task progress
    externalOrchestrator.addEventListener((event: TaskEvent) => {
      const sseMessage = `data: ${JSON.stringify(event)}\n\n`
      console.log("[CHAT-EXTERNAL-STREAM] Sending event:", event.type)
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

    console.log("[CHAT-EXTERNAL-STREAM] Closing stream")
    res.end()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("[CHAT-EXTERNAL-STREAM] Error:", errorMessage)

    const errorEvent: TaskEvent = {
      type: "final_answer",
      data: JSON.stringify({ error: errorMessage }),
    }
    res.write(`data: ${JSON.stringify(errorEvent)}\n\n`)
    res.end()
  }
})

export default router
