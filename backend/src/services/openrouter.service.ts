import axios, { AxiosError } from "axios"
import { config } from "../config"

export interface ChatMessage {
  role: "system" | "user" | "assistant"
  content: string
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
        content: "You are a helpful AI assistant for LogHub, a logistics and moving company platform. Provide clear and concise answers.",
      },
      {
        role: "user",
        content: userMessage,
      },
    ]

    try {
      console.log(`[OPENROUTER] Making request to ${this.baseUrl}/chat/completions`)
      console.log(`[OPENROUTER] Model: ${this.model}`)
      console.log(`[OPENROUTER] API Key set: ${this.apiKey ? "YES" : "NO"}`)
      
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: this.model,
          messages,
          max_tokens: 1000,
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
      
      const content = response.data.choices?.[0]?.message?.content
      if (!content) {
        console.error("[OPENROUTER] Empty response from API:", response.data)
        throw new Error("Empty response from OpenRouter API")
      }

      console.log("[OPENROUTER] Message generated successfully")
      return content
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
