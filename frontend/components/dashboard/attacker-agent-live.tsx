"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Bot, MessageSquare } from "lucide-react"
import { ChatBar } from "@/components/dashboard/chat-bar"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { useAgentStore } from "@/lib/agent-store"

const chats = [
  { name: "New Chat", preview: "Ask the model a question.", time: "Now", active: true },
  { name: "Log review", preview: "Summarize last night's events.", time: "10:22", active: false },
  { name: "Threat brief", preview: "What should I watch today?", time: "Yesterday", active: false },
]

const starterMessages = [
  { from: "them" as const, text: "Prompt the model with a question." },
]

// Convert task description to gerund form (e.g., "Retrieve X..." -> "Retrieving X...")
function toGerundForm(description: string): string {
  // Simple conversion: find first verb and convert to gerund
  if (!description) return "Processing"
  
  // Remove trailing period
  const clean = description.replace(/\.$/, "")
  
  // Common pattern: "Verb noun phrase"
  const verbMatch = clean.match(/^(Retrieve|Find|Search|Query|Check|Determine|Identify|Analyze|Look up|Compare)/)
  if (verbMatch) {
    const verb = verbMatch[1]
    const rest = clean.substring(verb.length).trim()
    const gerund = verb.replace(/e$/, "") + "ing"
    return `${gerund} ${rest}...`
  }
  
  return clean + "..."
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

export function ChatList() {
  return (
    <Card className="flex h-full flex-col overflow-hidden rounded border-border">
      <CardHeader className="shrink-0 border-b border-border p-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-blue-500" />
          <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Chats
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-0">
        {chats.map((item) => (
          <div
            key={item.name}
            className={
              item.active
                ? "flex w-full items-start gap-3 border-b border-border border-l-2 border-l-blue-500 bg-blue-500/10 px-3 py-3"
                : "flex w-full items-start gap-3 border-b border-border px-3 py-3"
            }
          >
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded border border-blue-500/30 bg-blue-500/10">
              <Bot className="h-3.5 w-3.5 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-medium text-foreground">{item.name}</span>
                <span className="shrink-0 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                  {item.time}
                </span>
              </div>
              <p className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground">
                {item.preview}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function ChatInterface({ agentSlug = "internal" }: { agentSlug?: string }) {
  const agentStore = useAgentStore()
  const agentState = agentStore.getAgentState(agentSlug)
  const thread = agentState.messages.length > 0 ? agentState.messages : starterMessages
  
  const [loading, setLoading] = useState(false)
  const [taskProgress, setTaskProgress] = useState<string | null>(null)

  const handleAddMessage = useCallback((message: any) => {
    agentStore.addMessage(agentSlug, {
      id: Date.now().toString(),
      text: message.text,
      sender: message.from === "me" ? "client" : "server",
      timestamp: new Date(),
    })
  }, [agentSlug, agentStore])

  const handleSendMessage = async (text: string) => {
    // Add user message immediately
    handleAddMessage({ from: "me", text })
    setLoading(true)
    setTaskProgress(null)

    try {
      const { sendMessageWithStreaming } = await import("@/lib/openrouter")
      
      const response = await sendMessageWithStreaming(text, (event) => {
        // Update UI based on task events
        if (event.type === "decomposition_complete" && event.data) {
          try {
            const tasks = JSON.parse(event.data)
            setTaskProgress(`Analyzing question into ${tasks.length} steps`)
          } catch (e) {
            setTaskProgress("Analyzing question")
          }
        } else if (event.type === "task_started" && event.taskDescription) {
          const gerundForm = toGerundForm(event.taskDescription)
          setTaskProgress(gerundForm)
        } else if (event.type === "task_complete" && event.taskId) {
          setTaskProgress(null)
        }
      })

      handleAddMessage({ from: "them", text: response })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to get response from AI"
      handleAddMessage({ from: "them", text: `Error: ${errorMessage}` })
    } finally {
      setLoading(false)
      setTaskProgress(null)
    }
  }

  return (
    <Card className="flex h-full flex-col overflow-hidden rounded border-border">
      <ThrobberAnimation />
      <CardHeader className="shrink-0 border-b border-border p-3">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-blue-500" />
          <div>
            <p className="text-sm font-semibold">Chatbot</p>
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              AI Model
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-3">
        {thread.map((message, index) => (
          <div
            key={message.id || index}
            className="flex w-full mb-3"
          >
            <div
              className={message.sender === "client" || message.from === "me" ? "ml-auto" : "mr-auto"}
              style={{maxWidth: "70%"}}
            >
              <div
                className={
                  message.sender === "client" || message.from === "me"
                    ? "rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2"
                    : "rounded-lg border border-border bg-muted/30 px-3 py-2"
                }
              >
                {message.sender === "client" || message.from === "me" ? (
                  <p className="text-xs leading-relaxed text-foreground">{message.text}</p>
                ) : (
                  <MarkdownRenderer content={message.text} />
                )}
              </div>
            </div>
          </div>
        ))}
        {loading && taskProgress && (
          <div className="flex justify-start items-center gap-2">
            <p className="text-xs text-muted-foreground">{taskProgress}</p>
            <div className="throbber text-muted-foreground">
              <div className="throbber-dot" />
              <div className="throbber-dot" />
              <div className="throbber-dot" />
            </div>
          </div>
        )}
      </CardContent>
      <ChatBar
        placeholder="Prompt the model..."
        onSend={handleSendMessage}
        disabled={loading}
      />
    </Card>
  )
}
