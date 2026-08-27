"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ProcessOutputProps {
  processName: string
}

// Mock process results
const processResults: Record<string, { status: string; summary: string; result: Record<string, unknown>; details: string }> = {
  "Downtown Office Relocation": {
    status: "In Progress",
    summary: "Relocating executive offices to downtown campus. 2,500 sq ft office space with 45 employees. Currently in loading phase with 3 trucks en route.",
    result: {
      total_items: 847,
      items_packed: 847,
      items_loaded: 623,
      progress: "73%",
      crew_size: 12,
    },
    details: "Relocation started at 08:00 AM. All office furniture, equipment, and supplies have been carefully packed and labeled. First convoy departed at 10:30 AM. Estimated arrival at destination: 2:15 PM. Unpacking and setup crew standing by at destination.",
  },
  "Warehouse Inventory Transfer": {
    status: "Scheduled",
    summary: "Transfer of 15,000 units from central warehouse to regional distribution centers. Route optimized for fuel efficiency and delivery windows.",
    result: {
      total_units: 15000,
      pallets: 450,
      trucks_assigned: 8,
      start_date: "2025-09-05",
    },
    details: "Transfer scheduled for next week. Inventory audit complete and all items verified. Crew briefing scheduled for 6:00 AM on move day. Regional receiving teams have been notified of expected arrival times. Temperature-controlled trucks assigned for sensitive inventory.",
  },
  "Corporate Shipment - East Coast": {
    status: "Delivered",
    summary: "Cross-country corporate shipment successfully delivered to East Coast distribution center. 1,200 units transported over 2,100 miles.",
    result: {
      total_units: 1200,
      delivery_date: "2025-08-25",
      days_in_transit: 5,
      condition: "Excellent",
    },
    details: "Shipment departed from West Coast facility on August 20. Maintained optimal temperature and humidity throughout journey. Arrived at destination on August 25 with all items in perfect condition. Signature received at 14:32. All documentation filed and closure confirmed.",
  },
}

export function ProcessOutput({ processName }: ProcessOutputProps) {
  const [activeTab, setActiveTab] = useState("summary")
  const data = processResults[processName]

  if (!data) {
    return (
      <Card className="h-full rounded border-border">
        <CardContent className="flex h-full items-center justify-center">
          <p className="font-mono text-xs text-muted-foreground">SELECT A PROCESS</p>
        </CardContent>
      </Card>
    )
  }

  const resultEntries = Object.entries(data.result)

  return (
    <Card className="flex h-full flex-col overflow-hidden rounded border-border">
      <CardHeader className="shrink-0 border-b border-border p-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Output / Result
          </span>
          <span className={cn(
            "rounded border px-1.5 py-0.5 font-mono text-[9px] font-medium uppercase",
            data.status === "Complete" && "border-emerald-500/30 bg-emerald-500/10 text-emerald-600",
            data.status === "Running" && "border-blue-500/30 bg-blue-500/10 text-blue-600",
            data.status === "Pending" && "border-amber-500/30 bg-amber-500/10 text-amber-600",
          )}>
            {data.status}
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full flex-col">
          <TabsList className="mx-3 mt-3 h-7 w-fit shrink-0 rounded border border-border bg-muted/50 p-0.5">
            <TabsTrigger value="summary" className="h-6 rounded px-2 font-mono text-[10px] uppercase tracking-wider">
              Summary
            </TabsTrigger>
            <TabsTrigger value="results" className="h-6 rounded px-2 font-mono text-[10px] uppercase tracking-wider">
              Results
            </TabsTrigger>
            <TabsTrigger value="details" className="h-6 rounded px-2 font-mono text-[10px] uppercase tracking-wider">
              Details
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto p-3">
            <TabsContent value="summary" className="m-0 h-full">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-3"
              >
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {data.summary}
                </p>
                <div className="rounded border border-border bg-muted/30 p-3">
                  <p className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
                    Process: {processName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Initiated at 14:32:18 UTC • Duration: 2m 45s
                  </p>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="results" className="m-0 h-full">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-2"
              >
                {resultEntries.map(([key, value]) => (
                  <div key={key} className="rounded border border-border bg-card p-2">
                    <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                      {key.replace(/_/g, " ")}
                    </p>
                    <p className="mt-0.5 font-mono text-sm font-semibold text-blue-500">
                      {String(value)}
                    </p>
                  </div>
                ))}
              </motion.div>
            </TabsContent>

            <TabsContent value="details" className="m-0 h-full">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded border border-border bg-muted/30 p-3"
              >
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {data.details}
                </p>
              </motion.div>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}
