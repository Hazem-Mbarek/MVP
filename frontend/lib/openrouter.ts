export async function sendMessage(userMessage: string): Promise<string> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"

  console.log("[API] Sending message to:", `${backendUrl}/api/chat`)
  console.log("[API] Message:", userMessage)

  try {
    const response = await fetch(`${backendUrl}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: userMessage,
      }),
    })

    console.log("[API] Response status:", response.status)
    console.log("[API] Response ok:", response.ok)

    if (!response.ok) {
      const error = await response.json()
      console.error("[API] Error response:", error)
      throw new Error(error.error || "Failed to get response from backend")
    }

    const data = await response.json()
    console.log("[API] Success! Message:", data.message)
    return data.message || "No response generated"
  } catch (error) {
    console.error("[API] Fetch error:", error)
    throw error
  }
}

export interface TaskEvent {
  type: "decomposition_complete" | "task_started" | "task_complete" | "final_answer"
  taskId?: string
  taskDescription?: string
  taskType?: string
  data?: string
}

export async function sendMessageWithStreaming(
  userMessage: string,
  onTaskEvent: (event: TaskEvent) => void
): Promise<string> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"

  console.log("[API-STREAM] Sending message to:", `${backendUrl}/api/chat/stream`)
  console.log("[API-STREAM] Message:", userMessage)

  try {
    const response = await fetch(`${backendUrl}/api/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: userMessage,
      }),
    })

    console.log("[API-STREAM] Response status:", response.status)

    if (!response.ok) {
      const error = await response.json()
      console.error("[API-STREAM] Error response:", error)
      throw new Error(error.error || "Failed to get response from backend")
    }

    if (!response.body) {
      throw new Error("Response body is null")
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let finalAnswer = ""

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split("\n")

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const eventData = JSON.parse(line.slice(6)) as TaskEvent
            console.log("[API-STREAM] Event:", eventData.type, eventData.taskId || "")
            onTaskEvent(eventData)

            if (eventData.type === "final_answer" && eventData.data) {
              finalAnswer = eventData.data
            }
          } catch (e) {
            console.warn("[API-STREAM] Failed to parse event:", line)
          }
        }
      }
    }

    console.log("[API-STREAM] Stream complete, final answer length:", finalAnswer.length)
    return finalAnswer || "No response generated"
  } catch (error) {
    console.error("[API-STREAM] Fetch error:", error)
    throw error
  }
}
