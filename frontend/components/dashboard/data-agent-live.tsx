"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Inbox, Mail } from "lucide-react"
import { ChatBar } from "@/components/dashboard/chat-bar"

const inboxItems = [
  { name: "Alex Chen", preview: "Can you check the last login spike?", time: "09:14", active: true },
  { name: "Jordan Hale", preview: "VPN access looks unusual today.", time: "08:41", active: false },
  { name: "Sam Rivera", preview: "Need a recap of yesterday's events.", time: "Yesterday", active: false },
]

const messages = [
  { from: "them" as const, text: "Can you check the last login spike?" },
  { from: "me" as const, text: "Looking at the session now." },
  { from: "them" as const, text: "It showed up around 09:00." },
]

export function DataAgentInbox() {
  return (
    <Card className="flex h-full flex-col overflow-hidden rounded border-border">
      <CardHeader className="shrink-0 border-b border-border p-3">
        <div className="flex items-center gap-2">
          <Inbox className="h-4 w-4 text-blue-500" />
          <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Inbox
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-0">
        {inboxItems.map((item) => (
          <div
            key={item.name}
            className={
              item.active
                ? "flex w-full items-start gap-3 border-b border-border border-l-2 border-l-blue-500 bg-blue-500/10 px-3 py-3"
                : "flex w-full items-start gap-3 border-b border-border px-3 py-3"
            }
          >
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded border border-blue-500/30 bg-blue-500/10 font-mono text-[10px] text-blue-600">
              {item.name.split(" ").map((n) => n[0]).join("")}
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

export function DataAgentChat() {
  const [thread, setThread] = useState(messages)

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
              <p className="text-xs leading-relaxed text-foreground">{message.text}</p>
            </div>
          </div>
        ))}
      </CardContent>
      <ChatBar
        placeholder="Write a message..."
        onSend={(text) => setThread((prev) => [...prev, { from: "me", text }])}
      />
    </Card>
  )
}

export function DataAgentContact() {
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
