"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"

export function ChatBar({
  placeholder = "Type a message...",
  onSend,
}: {
  placeholder?: string
  onSend?: (text: string) => void
}) {
  const [value, setValue] = useState("")

  return (
    <form
      className="shrink-0 border-t border-border p-3"
      onSubmit={(e) => {
        e.preventDefault()
        const text = value.trim()
        if (!text) return
        onSend?.(text)
        setValue("")
      }}
    >
      <div className="flex items-center gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="h-8 rounded font-mono text-xs"
        />
        <Button type="submit" size="sm" className="h-8 rounded">
          <Send className="h-3.5 w-3.5" />
          Send
        </Button>
      </div>
    </form>
  )
}
