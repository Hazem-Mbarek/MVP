import axios, { AxiosError } from "axios"
import { config } from "../config"
import { toolSchemas, handleSearchKnowledge, handleCheckTransportCompatibility, handleCompareIncoterms } from "../knowledge/tools"

export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool"
  content: string
  tool_call_id?: string
}

export class OpenRouterService {
  private apiKey: string
  private baseUrl: string
  private model: string

  constructor() {
    if (!config.openrouter.apiKey) {
      throw new Error("OPENROUTER_API_KEY is not configured")
    }
    this.apiKey = config.openrouter.apiKey
    this.baseUrl = config.openrouter.baseUrl
    this.model = config.openrouter.model
  }

  async sendMessage(userMessage: string): Promise<string> {
    console.log("[OPENROUTER] Sending message:", userMessage.substring(0, 50) + "...")
    
    const messages: ChatMessage[] = [
      {
        role: "system",
        content: `You are a helpful AI assistant for LogHub, a logistics and moving company platform. You have access to knowledge tools.

When answering questions:
1. Call relevant tools to search for information
2. Always cite sources from tool results (id, source, article number)
3. If tools return no useful results, say "I don't have information about that"
4. Never make up information
5. For transport/compatibility questions, use check_transport_compatibility
6. For comparison questions, use compare_incoterms
7. For general knowledge, use search_knowledge`,
      },
      {
        role: "user",
        content: userMessage,
      },
    ]

    try {
      console.log(`[OPENROUTER] Making request to ${this.baseUrl}/chat/completions`)
      console.log(`[OPENROUTER] Model: ${this.model}`)
      
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: this.model,
          messages,
          tools: toolSchemas,
          max_tokens: 2000,
          temperature: 0.7,
          top_p: 0.9,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
            "HTTP-Referer": "https://loghub.local",
            "X-Title": "LogHub",
          },
          timeout: 30000,
        }
      )

      console.log("[OPENROUTER] Response received, status:", response.status)
      
      // Handle tool calls if present
      const assistantMessage = response.data.choices?.[0]?.message
      if (!assistantMessage) {
        throw new Error("Empty response from OpenRouter API")
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

          console.log(`[OPENROUTER] Calling tool: ${toolCall.function.name}`)
          
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
            default:
              toolResult = { error: `Unknown tool: ${toolCall.function.name}` }
          }

          console.log(`[OPENROUTER] Tool result:`, JSON.stringify(toolResult).substring(0, 200))
          
          messages.push({
            role: "tool",
            content: JSON.stringify(toolResult),
            tool_call_id: toolCall.id,
          })
        }

        // Get next response from model
        const nextResponse = await axios.post(
          `${this.baseUrl}/chat/completions`,
          {
            model: this.model,
            messages,
            tools: toolSchemas,
            max_tokens: 2000,
            temperature: 0.7,
            top_p: 0.9,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${this.apiKey}`,
              "HTTP-Referer": "https://loghub.local",
              "X-Title": "LogHub",
            },
            timeout: 30000,
          }
        )

        const nextMessage = nextResponse.data.choices?.[0]?.message
        if (!nextMessage) {
          throw new Error("Empty response from OpenRouter API on tool call continuation")
        }
        
        // Add assistant message to conversation
        const assistantContent = nextMessage.content || "(No text response)"
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
        // If no assistant content, generate a generic response based on tool results
        console.warn("[OPENROUTER] No text response from model, generating fallback")
        finalContent = "I found information related to your query, but the model didn't generate a clear answer. Please try rewording your question."
      }

      console.log("[OPENROUTER] Message generated successfully")
      return finalContent
    } catch (error) {
      console.error("[OPENROUTER] Error:", error)
      
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
