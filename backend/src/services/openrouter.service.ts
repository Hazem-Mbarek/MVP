import axios, { AxiosError } from "axios"
import { config } from "../config"
import { toolSchemas, handleSearchKnowledge, handleCheckTransportCompatibility, handleCompareIncoterms, handleQueryDatabase, handleValidateJobRequest } from "../knowledge/tools"
import { AGENT_SYSTEM_PROMPT } from "./agent-prompt"

export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool"
  content: string
  tool_call_id?: string
}

export class OpenRouterService {
  private apiKey: string
  private apiKeyFallback: string | null
  private baseUrl: string
  private model: string
  private currentApiKeyIndex: number = 0

  constructor() {
    if (!config.openrouter.apiKey) {
      throw new Error("OPENROUTER_API_KEY is not configured")
    }
    this.apiKey = config.openrouter.apiKey
    this.apiKeyFallback = config.openrouter.apiKeyFallback || null
    this.baseUrl = config.openrouter.baseUrl
    this.model = config.openrouter.model
  }

  private getApiKey(): string {
    if (this.currentApiKeyIndex === 0) {
      return this.apiKey
    }
    if (this.currentApiKeyIndex === 1 && this.apiKeyFallback) {
      console.log("[OPENROUTER] Switching to fallback API key")
      return this.apiKeyFallback
    }
    throw new Error("No more API keys available")
  }

  private switchToFallback(): void {
    if (this.apiKeyFallback && this.currentApiKeyIndex === 0) {
      this.currentApiKeyIndex = 1
      console.warn("[OPENROUTER] Primary API key exhausted, switching to fallback key")
    }
  }

  async sendMessage(userMessage: string, includeSystemPrompt: boolean = false): Promise<string> {
    console.log("[OPENROUTER] === START sendMessage ===")
    console.log("[OPENROUTER] Sending message:", userMessage.substring(0, 50) + "...")
    
    const messages: ChatMessage[] = []
    
    // Only include system prompt for decomposition and task execution, not synthesis
    if (includeSystemPrompt) {
      messages.push({
        role: "system",
        content: AGENT_SYSTEM_PROMPT,
      })
      console.log("[OPENROUTER] === SYSTEM PROMPT ===")
      console.log("[OPENROUTER] Prompt length:", AGENT_SYSTEM_PROMPT.length, "characters")
      console.log("[OPENROUTER] Prompt first 200 chars:", AGENT_SYSTEM_PROMPT.substring(0, 200))
    }
    
    messages.push({
      role: "user",
      content: userMessage,
    })
    console.log("[OPENROUTER] === USER MESSAGE ===")
    console.log("[OPENROUTER] User message:", userMessage)
    console.log("[OPENROUTER] === REQUEST DETAILS ===")
    console.log("[OPENROUTER] Model:", this.model)
    console.log("[OPENROUTER] Max tokens: 1000")
    console.log("[OPENROUTER] API Key index:", this.currentApiKeyIndex)
    console.log("[OPENROUTER] Messages array size:", messages.length)

    try {
      console.log(`[OPENROUTER] Making request to ${this.baseUrl}/chat/completions`)
      console.log(`[OPENROUTER] Model: ${this.model}`)
      console.log(`[OPENROUTER] === SENDING FIRST REQUEST ===`)
      console.log(`[OPENROUTER] Request payload: `, JSON.stringify({
        model: this.model,
        messages_count: messages.length,
        system_prompt_length: AGENT_SYSTEM_PROMPT.length,
        user_message_length: userMessage.length,
        max_tokens: 1000,
      }, null, 2))
      
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: this.model,
          messages,
          tools: toolSchemas,
          max_tokens: 1000,
          temperature: 0.7,
          top_p: 0.9,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.getApiKey()}`,
            "HTTP-Referer": "https://loghub.local",
            "X-Title": "LogHub",
          },
          timeout: 120000,
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }
      )

      console.log("[OPENROUTER] Response received, status:", response.status)
      console.log("[OPENROUTER] Response headers:", JSON.stringify(response.headers, null, 2))
      
      // Handle tool calls if present
      const assistantMessage = response.data.choices?.[0]?.message
      if (!assistantMessage) {
        throw new Error("Empty response from OpenRouter API")
      }

      console.log("[OPENROUTER] === ASSISTANT RESPONSE ===")
      console.log("[OPENROUTER] Assistant message content length:", assistantMessage.content?.length || 0)
      console.log("[OPENROUTER] Assistant message content:", (assistantMessage.content || "").substring(0, 200))
      console.log("[OPENROUTER] Tool calls present:", assistantMessage.tool_calls?.length || 0)
      if (assistantMessage.tool_calls?.length) {
        assistantMessage.tool_calls.forEach((tc: any, i: number) => {
          console.log(`[OPENROUTER] Tool call ${i}: ${tc.function.name}`)
        })
      }

      messages.push({ role: "assistant", content: assistantMessage.content || "", ...assistantMessage })

      // Process tool calls in a loop (max 2 iterations to prevent loops)
      let currentMessage = assistantMessage
      let iterations = 0
      const maxIterations = 2  // Reduced from 5 to prevent excessive tool calls
      
      while (currentMessage.tool_calls && currentMessage.tool_calls.length > 0 && iterations < maxIterations) {
        console.log("[OPENROUTER] Processing tool calls:", currentMessage.tool_calls.length)
        iterations++
        
        for (const toolCall of currentMessage.tool_calls) {
          let toolResult
          const toolArgs = typeof toolCall.function.arguments === "string" 
            ? JSON.parse(toolCall.function.arguments)
            : toolCall.function.arguments

          console.log(`[OPENROUTER] === TOOL CALL ${currentMessage.tool_calls.indexOf(toolCall)} ===`)
          console.log(`[OPENROUTER] Tool name: ${toolCall.function.name}`)
          console.log(`[OPENROUTER] Tool arguments:`, JSON.stringify(toolArgs, null, 2))
          
          switch (toolCall.function.name) {
            case "search_knowledge":
              toolResult = await handleSearchKnowledge(toolArgs)
              break
            case "check_transport_compatibility":
              toolResult = handleCheckTransportCompatibility(toolArgs)
              break
            case "compare_incoterms":
              toolResult = handleCompareIncoterms(toolArgs)
              break
            case "query_database":
              toolResult = await handleQueryDatabase(toolArgs)
              break
            case "validate_job_request":
              toolResult = await handleValidateJobRequest(toolArgs)
              break
            default:
              toolResult = { error: `Unknown tool: ${toolCall.function.name}` }
          }

          console.log(`[OPENROUTER] Tool result:`, JSON.stringify(toolResult).substring(0, 300))
          
          messages.push({
            role: "tool",
            content: JSON.stringify(toolResult),
            tool_call_id: toolCall.id,
          })
        }

        // Get next response from model
        console.log("[OPENROUTER] === SENDING CONTINUATION REQUEST ===")
        console.log("[OPENROUTER] Messages in conversation:", messages.length)
        const nextResponse = await axios.post(
          `${this.baseUrl}/chat/completions`,
          {
            model: this.model,
            messages,
            tools: toolSchemas,
            max_tokens: 1000,
            temperature: 0.7,
            top_p: 0.9,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${this.getApiKey()}`,
              "HTTP-Referer": "https://loghub.local",
              "X-Title": "LogHub",
            },
            timeout: 120000,
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
          }
        )

        const nextMessage = nextResponse.data.choices?.[0]?.message
        if (!nextMessage) {
          throw new Error("Empty response from OpenRouter API on tool call continuation")
        }
        
        // Add assistant message to conversation
        const assistantContent = nextMessage.content || "(No text response)"
        console.log("[OPENROUTER] === CONTINUATION RESPONSE ===")
        console.log("[OPENROUTER] Response content length:", assistantContent.length)
        console.log("[OPENROUTER] Response content:", assistantContent.substring(0, 200))
        console.log("[OPENROUTER] More tool calls:", nextMessage.tool_calls?.length || 0)
        messages.push({ role: "assistant", content: assistantContent })
        
        // Check if model wants to call more tools
        currentMessage = nextMessage
        if (!currentMessage.tool_calls || currentMessage.tool_calls.length === 0) {
          break
        }
      }

      if (iterations >= maxIterations) {
        console.warn("[OPENROUTER] Reached maximum tool iterations, stopping loop")
      }

      // Return final text response - find the last assistant message with content
      let finalContent = ""
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role === "assistant" && messages[i].content) {
          finalContent = messages[i].content
          break
        }
      }
      
      if (!finalContent) {
        // If no assistant content, state explicitly that the question cannot be answered
        console.warn("[OPENROUTER] No text response from model, generating explicit gap message")
        finalContent = "I cannot answer this question from available knowledge sources. This question does not match any of my configured information sources (Incoterms, CMR, FAQ, company database, or transport compatibility rules). Please try rephrasing your question to be more specific about which area you're asking about, or ask about logistics operations, Incoterms, CMR regulations, or company information."
      }

      console.log("[OPENROUTER] Message generated successfully")
      console.log("[OPENROUTER] === END sendMessage === Final response length:", finalContent.length)
      return finalContent
    } catch (error) {
      console.error("[OPENROUTER] === CATCH ERROR ===")
      console.error("[OPENROUTER] Error object:", error)
      console.error("[OPENROUTER] Error type:", error instanceof Error ? error.constructor.name : typeof error)
      console.error("[OPENROUTER] Error:", error)
      
      // Check for credit exhaustion error
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        const errorData = error.response?.data as any
        if (errorData?.error?.message?.includes("more credits")) {
          console.error("[OPENROUTER] Primary key exhausted, attempting fallback...")
          this.switchToFallback()
          // Retry with fallback key
          if (this.currentApiKeyIndex > 0) {
            try {
              return await this.sendMessage(userMessage)
            } catch (retryError) {
              console.error("[OPENROUTER] Fallback key also failed:", retryError)
              throw new Error("Both API keys exhausted")
            }
          }
        }
      }
      
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>
        console.error("[OPENROUTER] Axios error details:")
        console.error("  - Status:", axiosError.response?.status)
        console.error("  - Data:", axiosError.response?.data)
        console.error("  - Message:", axiosError.message)
        
        const message =
          axiosError.response?.data?.error?.message ||
          axiosError.message ||
          "Failed to get response from OpenRouter"
        throw new Error(message)
      }
      throw error
    }
  }
}
