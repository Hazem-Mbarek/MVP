"use client"

import React, { createContext, useContext, useState, useCallback } from "react"

// ─── Types ────────────────────────────────────────────────────────
export interface Message {
  id: string
  text: string
  sender: "client" | "server"
  timestamp: Date
}

export interface ClientContact {
  id: string
  company: string
  name: string
  email: string
  phone: string
  city: string
  country: string
}

export interface AgentState {
  messages: Message[]
  selectedContact: ClientContact | null
}

export interface AgentStoreState {
  /** Messages and state keyed by agent slug */
  agents: Record<string, AgentState>
}

export interface AgentStoreActions {
  /** Get state for a specific agent */
  getAgentState: (slug: string) => AgentState
  /** Add a single message to an agent's conversation */
  addMessage: (slug: string, message: Message) => void
  /** Replace all messages for an agent */
  setMessages: (slug: string, messages: Message[]) => void
  /** Set the selected contact for an agent */
  setSelectedContact: (slug: string, contact: ClientContact | null) => void
  /** Clear all data for an agent */
  clearAgentData: (slug: string) => void
}

const defaultAgentState: AgentState = {
  messages: [],
  selectedContact: null,
}

// ─── Context ──────────────────────────────────────────────────────
const AgentStoreContext = createContext<(AgentStoreState & AgentStoreActions) | null>(null)

// ─── Provider ─────────────────────────────────────────────────────
export function AgentStoreProvider({ children }: { children: React.ReactNode }) {
  const [agents, setAgents] = useState<Record<string, AgentState>>({})

  const getAgentState = useCallback((slug: string): AgentState => {
    return agents[slug] || { ...defaultAgentState }
  }, [agents])

  const addMessage = useCallback((agentSlug: string, message: Message) => {
    setAgents(prev => {
      const currentMessages = prev[agentSlug]?.messages || []
      return {
        ...prev,
        [agentSlug]: {
          ...getAgentState(agentSlug),
          messages: [...currentMessages, message],
        },
      }
    })
  }, [getAgentState])

  const setMessages = useCallback((slug: string, messages: Message[]) => {
    setAgents(prev => ({
      ...prev,
      [slug]: {
        ...getAgentState(slug),
        messages,
      },
    }))
  }, [getAgentState])

  const setSelectedContact = useCallback((slug: string, contact: ClientContact | null) => {
    setAgents(prev => ({
      ...prev,
      [slug]: {
        ...getAgentState(slug),
        selectedContact: contact,
      },
    }))
  }, [getAgentState])

  const clearAgentData = useCallback((slug: string) => {
    setAgents(prev => ({
      ...prev,
      [slug]: { ...defaultAgentState },
    }))
  }, [])

  const value: AgentStoreState & AgentStoreActions = {
    agents,
    getAgentState,
    addMessage,
    setMessages,
    setSelectedContact,
    clearAgentData,
  }

  return (
    <AgentStoreContext.Provider value={value}>
      {children}
    </AgentStoreContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────
export function useAgentStore() {
  const ctx = useContext(AgentStoreContext)
  if (!ctx) {
    throw new Error("useAgentStore must be used within an AgentStoreProvider")
  }
  return ctx
}
