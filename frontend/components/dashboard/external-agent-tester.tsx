"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MarkdownRenderer } from "@/components/markdown-renderer"

interface Message {
  id: string
  text: string
  sender: "client" | "server"
  timestamp: Date
}

interface ExternalAgentTesterProps {
  externalMessages: Message[]
  onAddMessage: (msg: Message) => void
  selectedContact?: {
    name: string
    company: string
    email: string
    phone: string
    city: string
    country: string
  }
}

// Throbber/indeterminate progress indicator component
function ThrobberAnimation() {
  return (
    <style>{`
      @keyframes throbber-pulse {
        0% {
          opacity: 0.4;
          transform: scale(0.8);
        }
        50% {
          opacity: 1;
          transform: scale(1);
        }
        100% {
          opacity: 0.4;
          transform: scale(0.8);
        }
      }
      
      .throbber {
        display: inline-flex;
        gap: 2px;
        align-items: center;
      }
      
      .throbber-dot {
        width: 3px;
        height: 3px;
        border-radius: 50%;
        background-color: currentColor;
        animation: throbber-pulse 1.4s ease-in-out infinite;
      }
      
      .throbber-dot:nth-child(2) {
        animation-delay: 0.2s;
      }
      
      .throbber-dot:nth-child(3) {
        animation-delay: 0.4s;
      }
    `}</style>
  )
}

export function ExternalAgentTester({ externalMessages, onAddMessage, selectedContact }: ExternalAgentTesterProps) {
  const [clientInput, setClientInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleClientSend = async () => {
    if (!clientInput.trim()) return
    
    console.log("[EXTERNAL-TESTER] Sending message:", clientInput)
    console.log("[EXTERNAL-TESTER] Selected contact:", selectedContact)
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: clientInput,
      sender: "client",
      timestamp: new Date(),
    }
    
    onAddMessage(newMessage)
    const userMessage = clientInput
    setClientInput("")
    setIsLoading(true)

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
      // Pass client contact details - backend will look up actual client_id from database
      const requestBody = { 
        message: userMessage,
        clientContact: selectedContact,
      }
      console.log("[EXTERNAL-TESTER] Request body:", requestBody)
      
      const response = await fetch(`${backendUrl}/api/chat/external`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to get response")
      }
      
      const data = await response.json()
      
      const serverResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: data.message || "No response",
        sender: "server",
        timestamp: new Date(),
      }
      onAddMessage(serverResponse)
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Error communicating with server"
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Error: ${errorMsg}`,
        sender: "server",
        timestamp: new Date(),
      }
      onAddMessage(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="flex h-full flex-col overflow-hidden rounded border-border">
      <ThrobberAnimation />
      <CardHeader className="shrink-0 border-b border-border p-3">
        <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Contacts
        </span>
        <p className="text-[10px] text-muted-foreground italic mt-1">
          Select a client and simulate their communication with LogHub
        </p>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
        {/* Messages Display */}
        <div className="flex-1 space-y-3 overflow-y-auto p-3">
          {externalMessages.length === 0 ? (
            <p className="font-mono text-xs text-muted-foreground text-center py-8">
              Conversation starts here.
            </p>
          ) : (
            externalMessages.map((msg) => (
              <div
                key={msg.id}
                className={msg.sender === "client" ? "flex justify-end" : "flex justify-start"}
              >
                <div
                  className={
                    msg.sender === "client"
                      ? "max-w-[70%] rounded border border-blue-500/30 bg-blue-500/10 px-3 py-2"
                      : "max-w-[70%] rounded border border-border bg-muted/30 px-3 py-2"
                  }
                >
                  <div className="text-xs">
                    {msg.sender === "client" ? (
                      <p className="text-foreground">{msg.text}</p>
                    ) : (
                      <MarkdownRenderer content={msg.text} />
                    )}
                  </div>
                  <p className="text-[9px] text-muted-foreground mt-1">
                    {msg.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start items-center gap-2">
              <p className="text-xs text-muted-foreground">Processing client request</p>
              <div className="throbber text-muted-foreground">
                <div className="throbber-dot" />
                <div className="throbber-dot" />
                <div className="throbber-dot" />
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="shrink-0 border-t border-border p-3 space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Send a client message..."
              value={clientInput}
              onChange={(e) => setClientInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleClientSend()
                }
              }}
              disabled={isLoading}
              className="text-xs"
            />
            <Button
              onClick={handleClientSend}
              disabled={!clientInput.trim() || isLoading}
              size="sm"
            >
              {isLoading ? "..." : "Send"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
