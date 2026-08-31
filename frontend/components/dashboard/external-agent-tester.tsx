"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Download, MessageSquare, Form } from "lucide-react"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { JobRequestForm } from "./job-request-form"

/**
 * Detect if message is financial/statement data that should be downloadable
 * Looks for keywords indicating financial data: statement, pricing, costs, jobs, shipments, invoice, etc.
 */
function isFinancialStatement(text: string): boolean {
  if (!text) return false
  
  const financialKeywords = [
    "statement of account",
    "statement",
    "job_code",
    "job code",
    "nr job",
    "shipment",
    "pricing",
    "price",
    "currency",
    "eur",
    "€",
    "invoice",
    "billing",
    "costs",
    "charge",
    "total",
    "payment",
    "account",
    "financial",
    "cargo",
    "origin",
    "destination",
    "departure",
    "arrival",
    "weight",
  ]
  
  const lowerText = text.toLowerCase()
  
  // Check if text contains statement/account keywords
  const hasAccountKeywords = financialKeywords.some(keyword => lowerText.includes(keyword))
  
  // Must have at least 2 financial indicators to be considered a statement
  const indicatorCount = financialKeywords.filter(keyword => lowerText.includes(keyword)).length
  
  return hasAccountKeywords && indicatorCount >= 2
}

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
    id?: string
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
  const [downloading, setDownloading] = useState<string | null>(null)
  const [showJobForm, setShowJobForm] = useState(false)

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

  const handleDownload = async (messageId: string, messageText: string) => {
    if (!selectedContact) {
      alert("Please select a client contact to download")
      return
    }

    setDownloading(messageId)
    try {
      console.log("[EXTERNAL-TESTER] Downloading message as PDF")
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
      
      const response = await fetch(`${backendUrl}/api/chat/external/download`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: messageText,
          clientContact: selectedContact,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to generate PDF")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      
      const timestamp = new Date().toISOString().slice(0, 10)
      const sanitized = selectedContact.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "")
      link.download = `${sanitized}_statement_${timestamp}.pdf`
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      console.log("[EXTERNAL-TESTER] ✓ Download complete")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      console.error("[EXTERNAL-TESTER] ✗ Download failed:", errorMessage)
      alert(`Download failed: ${errorMessage}`)
    } finally {
      setDownloading(null)
    }
  }

  return (
    <Card className="flex h-full flex-col overflow-hidden rounded border-border">
      <ThrobberAnimation />
      <CardHeader className="shrink-0 border-b border-border p-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Client Communication
            </span>
            <p className="text-[10px] text-muted-foreground italic mt-1">
              Simulate client shipment requests and inquiries
            </p>
          </div>
          {!showJobForm && (
            <Button
              onClick={() => setShowJobForm(true)}
              variant="outline"
              size="sm"
              className="text-xs"
              disabled={isLoading}
            >
              <Form className="h-3 w-3 mr-1" />
              New Request
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
        {showJobForm ? (
          <div className="flex-1 overflow-y-auto p-3">
            <JobRequestForm
              selectedContact={selectedContact}
              onSubmit={(message) => {
                setClientInput(message)
                setShowJobForm(false)
              }}
              isLoading={isLoading}
            />
            <Button
              onClick={() => setShowJobForm(false)}
              variant="ghost"
              size="sm"
              className="text-xs mt-3"
            >
              Back to Chat
            </Button>
          </div>
        ) : (
          <>
            {/* Messages Display */}
            <div className="flex-1 overflow-y-auto p-3">
          {externalMessages.length === 0 ? (
            <p className="font-mono text-xs text-muted-foreground text-center py-8">
              Conversation starts here.
            </p>
          ) : (
            externalMessages.map((msg) => (
              <div
                key={msg.id}
                className="flex w-full mb-3"
              >
                <div
                  className={msg.sender === "client" ? "ml-auto" : "mr-auto"}
                  style={{maxWidth: "70%"}}
                >
                  <div
                    className={
                      msg.sender === "client"
                        ? "rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2"
                        : "rounded-lg border border-border bg-muted/30 px-3 py-2"
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

                  {msg.sender === "server" && isFinancialStatement(msg.text) && (
                    <div className="flex items-center gap-1 mt-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground transition-all duration-200 animate-in fade-in-50 slide-in-from-bottom-1"
                        onClick={() => handleDownload(msg.id, msg.text)}
                        disabled={downloading === msg.id}
                      >
                        <Download className={`h-3 w-3 transition-transform duration-300 ${downloading === msg.id ? "animate-bounce" : ""}`} />
                        {downloading === msg.id ? "Downloading..." : "Download PDF"}
                      </Button>
                    </div>
                  )}
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
          </>
        )}
      </CardContent>
    </Card>
  )
}
