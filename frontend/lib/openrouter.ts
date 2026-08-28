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
