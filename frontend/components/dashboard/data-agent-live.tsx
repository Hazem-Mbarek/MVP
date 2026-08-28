"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Inbox, Mail } from "lucide-react"
import { ChatBar } from "@/components/dashboard/chat-bar"

const messages = [
  { from: "them" as const, text: "Can you check the last login spike?" },
  { from: "me" as const, text: "Looking at the session now." },
  { from: "them" as const, text: "It showed up around 09:00." },
]

export function ShipmentsInbox() {
  const [selectedInbox, setSelectedInbox] = useState<string | null>("Alex Chen")
  
  const inboxItems = [
    { name: "Client Request", preview: "Can you check Incoterms for sea shipping?", time: "09:14", active: true },
    { name: "Policy Question", preview: "What's your pricing for express delivery?", time: "08:41", active: false },
    { name: "CMR Inquiry", preview: "Need clarification on carriage terms.", time: "Yesterday", active: false },
  ]

  return (
    <Card className="flex h-full flex-col overflow-hidden rounded border-border">
      <CardHeader className="shrink-0 border-b border-border p-3">
        <div className="flex items-center gap-2">
          <Inbox className="h-4 w-4 text-blue-500" />
          <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Client Requests
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-0">
        {inboxItems.map((item) => (
          <div
            key={item.name}
            onClick={() => setSelectedInbox(item.name)}
            className={
              selectedInbox === item.name
                ? "flex w-full items-start gap-3 border-b border-border border-l-2 border-l-blue-500 bg-blue-500/10 px-3 py-3 cursor-pointer"
                : "flex w-full items-start gap-3 border-b border-border px-3 py-3 hover:bg-muted/30 cursor-pointer transition-colors"
            }
          >
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded border border-blue-500/30 bg-blue-500/10 font-mono text-[10px] text-blue-600">
              {item.name.split(" ").map((n) => n[0]).join("").substring(0, 2)}
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

export function ShipmentsChat({ externalMessages, onAddMessage }: { externalMessages?: any[], onAddMessage?: (msg: any) => void }) {
  const [thread, setThread] = useState(messages)

  // Use external messages if provided, otherwise use local state
  const displayMessages = externalMessages !== undefined ? externalMessages : thread
  const addMessage = onAddMessage
    ? (msg: any) => onAddMessage(msg)
    : (msg: any) => setThread((prev) => [...prev, msg])

  return (
    <Card className="flex h-full flex-col overflow-hidden rounded border-border">
      <CardHeader className="shrink-0 border-b border-border p-3">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-blue-500" />
          <div>
            <p className="text-sm font-semibold">Alex Chen</p>
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              SOC Analyst
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-3 overflow-y-auto p-3">
        {displayMessages.map((message, index) => {
          // Handle both old format (from: "me"/"them") and new format (sender: "client"/"server")
          const isFromMe = message.from === "me" || message.sender === "client"
          return (
            <div
              key={message.id || index}
              className={isFromMe ? "flex justify-end" : "flex justify-start"}
            >
              <div
                className={
                  isFromMe
                    ? "max-w-[80%] rounded border border-blue-500/30 bg-blue-500/10 px-3 py-2"
                    : "max-w-[80%] rounded border border-border bg-muted/30 px-3 py-2"
                }
              >
                <p className="text-xs leading-relaxed text-foreground">{message.text}</p>
              </div>
            </div>
          )
        })}
      </CardContent>
      <ChatBar
        placeholder="Write a message..."
        onSend={(text) => {
          const newMsg = {
            id: Date.now().toString(),
            text,
            from: "me" as const,
            sender: "client" as const,
            timestamp: new Date(),
          }
          addMessage(newMsg)
        }}
      />
    </Card>
  )
}

export function ShipmentsContact() {
  return (
    <Card className="flex h-full flex-col overflow-hidden rounded border-border">
      <CardHeader className="shrink-0 border-b border-border p-3">
        <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Personal Information
        </span>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-3">
        <div className="flex flex-col items-center py-4">
          <div className="flex size-14 items-center justify-center rounded border border-blue-500/30 bg-blue-500/10 text-sm font-semibold text-blue-600">
            AC
          </div>
          <h2 className="mt-3 text-sm font-semibold text-foreground">Alex Chen</h2>
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            SOC Analyst
          </p>
        </div>
        <Separator className="mb-3" />
        <div className="space-y-2">
          <div className="rounded border border-border bg-muted/30 p-2">
            <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Email</p>
            <p className="mt-0.5 text-xs text-foreground">alex.chen@corp.local</p>
          </div>
          <div className="rounded border border-border bg-muted/30 p-2">
            <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Department</p>
            <p className="mt-0.5 text-xs text-foreground">Security Operations</p>
          </div>
          <div className="rounded border border-border bg-muted/30 p-2">
            <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Location</p>
            <p className="mt-0.5 text-xs text-foreground">San Francisco</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
