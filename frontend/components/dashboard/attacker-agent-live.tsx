"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Bot, MessageSquare } from "lucide-react"
import { ChatBar } from "@/components/dashboard/chat-bar"
import { MarkdownRenderer } from "@/components/markdown-renderer"

const chats = [
  { name: "New Chat", preview: "Ask the model a question.", time: "Now", active: true },
  { name: "Log review", preview: "Summarize last night's events.", time: "10:22", active: false },
  { name: "Threat brief", preview: "What should I watch today?", time: "Yesterday", active: false },
]

const starterMessages = [
  { from: "them" as const, text: "Prompt the model with a question." },
]

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

export function ChatInterface() {
  const [thread, setThread] = useState(starterMessages)
  const [loading, setLoading] = useState(false)

  const handleSendMessage = async (text: string) => {
    // Add user message immediately
    setThread((prev) => [...prev, { from: "me", text }])
    setLoading(true)

    try {
      const { sendMessage } = await import("@/lib/openrouter")
      const response = await sendMessage(text)
      setThread((prev) => [...prev, { from: "them", text: response }])
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to get response from AI"
      setThread((prev) => [
        ...prev,
        { from: "them", text: `Error: ${errorMessage}` },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="flex h-full flex-col overflow-hidden rounded border-border">
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
      <CardContent className="flex-1 space-y-3 overflow-y-auto p-3">
        {thread.map((message, index) => (
          <div
            key={index}
            className={message.from === "me" ? "flex justify-end" : "flex justify-start"}
          >
            <div
              className={
                message.from === "me"
                  ? "max-w-[80%] rounded border border-blue-500/30 bg-blue-500/10 px-3 py-2"
                  : "max-w-[80%] rounded border border-border bg-muted/30 px-3 py-2"
              }
            >
              {message.from === "me" ? (
                <p className="text-xs leading-relaxed text-foreground">{message.text}</p>
              ) : (
                <MarkdownRenderer content={message.text} />
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded border border-border bg-muted/30 px-3 py-2">
              <p className="text-xs text-muted-foreground">Thinking...</p>
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
