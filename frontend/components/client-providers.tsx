"use client"

import { PipelineProvider } from "@/lib/pipeline-store"
import { AgentStoreProvider } from "@/lib/agent-store"

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <PipelineProvider>
      <AgentStoreProvider>
        {children}
      </AgentStoreProvider>
    </PipelineProvider>
  )
}
