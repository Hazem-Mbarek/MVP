import express, { Router, Request, Response } from "express"
import { ExternalAgentOrchestrator, TaskEvent } from "../services/external-agent-orchestrator"
import { queryDatabase } from "../knowledge/database-tools"

const router = Router()

// Enable CORS preflight for all routes
router.options("*", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
  res.setHeader("Access-Control-Max-Age", "3600")
  res.status(200).end()
})

interface ClientContact {
  id?: string // Optional: direct client_id if known
  name: string
  company: string
  email: string
  phone?: string
  city?: string
  country?: string
}

interface ExternalChatRequest {
  message: string
  clientId?: string // Would come from JWT/session in production
  clientContact?: ClientContact // NEW: client contact details for lookup
}

interface ChatResponse {
  success: boolean
  message?: string
  error?: string
}

// Helper: Resolve client ID from contact details
async function resolveClientIdFromContact(contact: ClientContact): Promise<string> {
  console.log("[EXTERNAL-CHAT] resolveClientIdFromContact called")
  console.log("[EXTERNAL-CHAT] Contact object:", JSON.stringify(contact))

  // If ID is already provided, use it directly
  if (contact.id) {
    console.log("[EXTERNAL-CHAT] Using provided client ID:", contact.id)
    return String(contact.id)
  }

  console.log("[EXTERNAL-CHAT] No ID in contact, checking company/email...")

  if (!contact || (!contact.company && !contact.email)) {
    console.error("[EXTERNAL-CHAT] Contact missing company and email")
    throw new Error("Client contact must include at least company name or email, or provide id")
  }

  console.log("[EXTERNAL-CHAT] Looking up client by company:", contact.company, "or email:", contact.email)

  // Query the clients table to find matching client
  const result = await queryDatabase({
    description: `Find client with company name "${contact.company}" and/or email "${contact.email}"`,
    tables: ["clients"],
    filters: {
      company_name: contact.company,
      email: contact.email,
    },
    limit: 1,
  })

  console.log("[EXTERNAL-CHAT] Database query result:", result)

  if (!result.data || result.data.length === 0) {
    console.error("[EXTERNAL-CHAT] Client not found in database")
    throw new Error(
      `Client not found: ${contact.company || contact.email}. This client may not exist in our system yet. Please contact support.`
    )
  }

  const clientId = result.data[0].client_id
  if (!clientId) {
    console.error("[EXTERNAL-CHAT] Client record found but client_id is missing")
    throw new Error("Client record found but client_id is missing")
  }

  console.log("[EXTERNAL-CHAT] Successfully resolved client ID:", clientId)
  return String(clientId)
}

// Extract client ID from request
async function extractClientId(req: Request): Promise<string> {
  const body = req.body as ExternalChatRequest

  console.log("[EXTERNAL-CHAT] extractClientId called")
  console.log("[EXTERNAL-CHAT] Body keys:", Object.keys(body))
  console.log("[EXTERNAL-CHAT] Has clientContact:", !!body.clientContact)
  console.log("[EXTERNAL-CHAT] clientContact value:", JSON.stringify(body.clientContact, null, 2))

  // If clientContact is provided, resolve it to a client ID
  if (body.clientContact) {
    console.log("[EXTERNAL-CHAT] ✓ clientContact found, resolving to ID...")
    console.log("[EXTERNAL-CHAT] Contact company:", body.clientContact.company)
    console.log("[EXTERNAL-CHAT] Contact email:", body.clientContact.email)
    console.log("[EXTERNAL-CHAT] Contact id:", body.clientContact.id)
    
    // If ID is provided directly, use it!
    if (body.clientContact.id) {
      console.log("[EXTERNAL-CHAT] ✓ Direct ID provided:", body.clientContact.id)
      return String(body.clientContact.id)
    }
    
    console.log("[EXTERNAL-CHAT] No direct ID, resolving from database...")
    return await resolveClientIdFromContact(body.clientContact)
  }

  console.log("[EXTERNAL-CHAT] ✗ No clientContact, checking query params/headers...")

  // Fallback: use query param or header (legacy)
  const clientId = req.query.clientId as string || req.headers["x-client-id"] as string

  console.log("[EXTERNAL-CHAT] Query clientId:", req.query.clientId)
  console.log("[EXTERNAL-CHAT] Header clientId:", req.headers["x-client-id"])

  if (!clientId) {
    console.error("[EXTERNAL-CHAT] ✗ No client ID found in clientContact, query, or header")
    throw new Error("No client ID provided. Please select a client contact.")
  }

  // Validate format (basic example)
  if (!/^\d+$/.test(clientId)) {
    throw new Error("Invalid client ID format")
  }

  console.log("[EXTERNAL-CHAT] Using client ID:", clientId)
  return clientId
}

// POST /api/external-chat - Returns full response (legacy)
router.post("/", async (req: Request<{}, {}, ExternalChatRequest>, res: Response<ChatResponse>) => {
  const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  const startTime = Date.now()
  
  try {
    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type")

    console.log("\n" + "█".repeat(100))
    console.log(`[EXTERNAL-CHAT] [${requestId}] === INCOMING REQUEST ===`)
    console.log(`[EXTERNAL-CHAT] [${requestId}] Timestamp: ${new Date().toISOString()}`)
    console.log(`[EXTERNAL-CHAT] [${requestId}] Request from: ${req.ip}`)
    console.log(`[EXTERNAL-CHAT] [${requestId}] Request origin: ${req.get("origin")}`)
    console.log(`[EXTERNAL-CHAT] [${requestId}] User-Agent: ${req.get("user-agent")}`)
    console.log(`[EXTERNAL-CHAT] [${requestId}] Request body keys: ${Object.keys(req.body).join(", ")}`)

    const clientId = await extractClientId(req)
    const { message } = req.body

    console.log(`[EXTERNAL-CHAT] [${requestId}] ✓ Client ID extracted: ${clientId}`)
    console.log(`[EXTERNAL-CHAT] [${requestId}] Message: "${message}"`)
    console.log(`[EXTERNAL-CHAT] [${requestId}] Message length: ${message.length} chars`)

    if (!message || typeof message !== "string") {
      console.warn(`[EXTERNAL-CHAT] [${requestId}] ✗ Invalid message: missing or not string`)
      const duration = Date.now() - startTime
      console.warn(`[EXTERNAL-CHAT] [${requestId}] Response time: ${duration}ms`)
      return res.status(400).json({
        success: false,
        error: "Invalid request: message is required and must be a string",
      })
    }

    console.log(`[EXTERNAL-CHAT] [${requestId}] → Forwarding to ExternalAgentOrchestrator...`)
    const externalOrchestrator = new ExternalAgentOrchestrator(clientId)
    console.log(`[EXTERNAL-CHAT] [${requestId}] Calling externalOrchestrator.processQuestion...`)
    const response = await externalOrchestrator.processQuestion(message.trim())
    
    const duration = Date.now() - startTime
    console.log(`[EXTERNAL-CHAT] [${requestId}] ✓ Response received: ${response.length} chars`)
    console.log(`[EXTERNAL-CHAT] [${requestId}] Processing time: ${duration}ms`)
    console.log(`[EXTERNAL-CHAT] [${requestId}] === RESPONSE SENT ===`)
    console.log("█".repeat(100) + "\n")

    return res.json({
      success: true,
      message: response,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const duration = Date.now() - startTime
    
    console.error(`[EXTERNAL-CHAT] [${requestId}] ✗ ERROR OCCURRED`)
    console.error(`[EXTERNAL-CHAT] [${requestId}] Error message: ${errorMessage}`)
    console.error(`[EXTERNAL-CHAT] [${requestId}] Stack: ${error instanceof Error ? error.stack : "N/A"}`)
    console.error(`[EXTERNAL-CHAT] [${requestId}] Response time: ${duration}ms`)
    console.error("█".repeat(100) + "\n")

    // Check if it's an auth/client ID error
    const isAuthError = errorMessage.includes("client ID") || errorMessage.includes("not found") || errorMessage.includes("No client")
    const statusCode = isAuthError ? 401 : 500

    return res.status(statusCode).json({
      success: false,
      error: errorMessage,
    })
  }
})

// POST /api/external-chat/stream - Returns streaming task progress + final answer
router.post("/stream", async (req: Request<{}, {}, ExternalChatRequest>, res: Response) => {
  try {
    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type")

    const clientId = await extractClientId(req)
    const { message } = req.body

    if (!message || typeof message !== "string") {
      console.warn("[EXTERNAL-CHAT-STREAM] Invalid request: message missing or not a string")
      return res.status(400).json({
        success: false,
        error: "Invalid request: message is required and must be a string",
      })
    }

    console.log("[EXTERNAL-CHAT-STREAM] Processing message:", message.substring(0, 50) + "...")
    console.log("[EXTERNAL-CHAT-STREAM] Client ID:", clientId)

    // Set up SSE headers
    res.setHeader("Content-Type", "text/event-stream")
    res.setHeader("Cache-Control", "no-cache")
    res.setHeader("Connection", "keep-alive")
    res.setHeader("Access-Control-Allow-Origin", "*")

    const externalOrchestrator = new ExternalAgentOrchestrator(clientId)

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
