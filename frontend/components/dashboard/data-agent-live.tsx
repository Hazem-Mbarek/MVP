"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Inbox, Mail, Download } from "lucide-react"
import { ChatBar } from "@/components/dashboard/chat-bar"
import { Button } from "@/components/ui/button"

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

  useEffect(() => {
    console.log("[SHIPMENTS-INBOX] Initializing with first contact")
    if (onContactSelect) {
      onContactSelect(CLIENT_CONTACTS[0])
    }
  }, [])

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

function MessageBubble({ message, messageId, selectedContact, onDownload }: { message: any; messageId: string; selectedContact: ClientContact | null; onDownload: (id: string, text: string) => void }) {
  const isFromMe = message.from === "me" || message.sender === "client"
  const [downloading, setDownloading] = useState(false)

  return (
    <div className="flex w-full mb-3">
      <div
        className={isFromMe ? "ml-auto" : "mr-auto"}
        style={{maxWidth: "70%"}}
      >
        <div
          className={
            isFromMe
              ? "rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2"
              : "rounded-lg border border-border bg-muted/30 px-3 py-2"
          }
        >
          <p className="text-xs leading-relaxed text-foreground">{message.text}</p>
        </div>

        {!isFromMe && isFinancialStatement(message.text) && (
          <div className="flex items-center gap-1 mt-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground transition-all duration-200 animate-in fade-in-50 slide-in-from-bottom-1"
              onClick={() => {
                setDownloading(true)
                onDownload(messageId, message.text)
                setTimeout(() => setDownloading(false), 1000)
              }}
              disabled={downloading}
            >
              <Download className={`h-3 w-3 transition-transform duration-300 ${downloading ? "animate-bounce" : ""}`} />
              {downloading ? "Downloading..." : "Download PDF"}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export function ShipmentsChat({ externalMessages, onAddMessage, selectedContact }: { externalMessages?: any[], onAddMessage?: (msg: any) => void, selectedContact?: ClientContact | null }) {
  const [downloading, setDownloading] = useState<string | null>(null)

  const displayMessages = externalMessages !== undefined ? externalMessages : messages
  const addMessage = onAddMessage
    ? (msg: any) => onAddMessage(msg)
    : (msg: any) => {}

  const handleDownload = async (messageId: string, messageText: string) => {
    if (!selectedContact) {
      alert("Please select a client contact to download")
      return
    }

    setDownloading(messageId)
    try {
      console.log("[SHIPMENTS-CHAT] Downloading message as PDF")
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

      console.log("[SHIPMENTS-CHAT] ✓ Download complete")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      console.error("[SHIPMENTS-CHAT] ✗ Download failed:", errorMessage)
      alert(`Download failed: ${errorMessage}`)
    } finally {
      setDownloading(null)
    }
  }

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
        {displayMessages.map((message, index) => (
          <MessageBubble
            key={message.id || index}
            message={message}
            messageId={message.id || `msg-${index}`}
            selectedContact={selectedContact || null}
            onDownload={handleDownload}
          />
        ))}
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
