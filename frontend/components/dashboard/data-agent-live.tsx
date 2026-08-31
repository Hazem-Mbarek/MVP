"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Inbox, Mail } from "lucide-react"
import { ChatBar } from "@/components/dashboard/chat-bar"

const messages = [
  { from: "them" as const, text: "Can you check the last login spike?" },
  { from: "me" as const, text: "Looking at the session now." },
  { from: "them" as const, text: "It showed up around 09:00." },
]

interface ClientContact {
  id: string
  company: string
  name: string
  email: string
  phone: string
  city: string
  country: string
}

const CLIENT_CONTACTS: ClientContact[] = [
  {
    id: "9",
    company: "Groupe Chartier Distribution SAS",
    name: "Véronique Chartier",
    email: "veronique.chartier@groupe.example",
    phone: "+33 338 9478454",
    city: "Paris",
    country: "France",
  },
  {
    id: "10",
    company: "Nord-Pas Textiles SARL",
    name: "Antoine Rousseau",
    email: "antoine.rousseau@nordpas.example",
    phone: "+33 716 1445199",
    city: "Lille",
    country: "France",
  },
  {
    id: "1",
    company: "Ruhrmetall Industrieteile GmbH",
    name: "Bettina Arnold",
    email: "bettina.arnold@ruhrmetall.example",
    phone: "+49 754 2867825",
    city: "Dortmund",
    country: "Germany",
  },
  {
    id: "2",
    company: "Rheinland Elektronik Handels AG",
    name: "Sabine Thiel",
    email: "sabine.thiel@rheinland.example",
    phone: "+49 350 4744854",
    city: "Cologne",
    country: "Germany",
  },
]

export function ShipmentsInbox({ onContactSelect }: { onContactSelect?: (contact: ClientContact) => void }) {
  const [selectedContact, setSelectedContact] = useState<ClientContact>(CLIENT_CONTACTS[0])

  // Only call on first mount to initialize the store
  useEffect(() => {
    console.log("[SHIPMENTS-INBOX] Initializing with first contact")
    if (onContactSelect) {
      onContactSelect(CLIENT_CONTACTS[0])
    }
  }, []) // Empty dependency array - only run once on mount

  const handleContactSelect = (contact: ClientContact) => {
    setSelectedContact(contact)
    onContactSelect?.(contact)
  }

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
      <CardContent className="flex-1 overflow-y-auto p-3 space-y-2">
        {/* Contact Cards Section */}
        {CLIENT_CONTACTS.map((contact) => (
          <div
            key={contact.id}
            onClick={() => handleContactSelect(contact)}
            className={
              selectedContact.id === contact.id
                ? "flex items-start gap-3 border-l-2 border-l-blue-500 bg-blue-500/10 px-3 py-2 rounded cursor-pointer transition-colors"
                : "flex items-start gap-3 border border-transparent hover:border-border hover:bg-muted/30 px-3 py-2 rounded cursor-pointer transition-colors"
            }
          >
            <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded border border-blue-500/30 bg-blue-500/10 font-mono text-[9px] font-semibold text-blue-600">
              {contact.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground">{contact.name}</p>
              <p className="text-[9px] text-muted-foreground truncate">{contact.company}</p>
              <p className="text-[9px] text-muted-foreground">{contact.city}, {contact.country}</p>
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
            <p className="text-sm font-semibold">Communication Agent</p>
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Logistics Support
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
            CA
          </div>
          <h2 className="mt-3 text-sm font-semibold text-foreground">Communication Agent</h2>
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Logistics Support
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
