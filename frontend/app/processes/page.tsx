"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Workflow } from "lucide-react"
import { ProcessOutput } from "@/components/dashboard/process-output"
import { TerminalLogs } from "@/components/dashboard/terminal-logs"

const processes = [
  {
    name: "Job Request JOB-2026-1101-001",
    status: "Awaiting Confirmation",
    active: true,
    type: "job_request",
    shipment: {
      origin: "Leipzig, Germany",
      destination: "Warsaw, Poland",
      shipmentType: "Office furniture and equipment",
      contentDescription: "Desks, chairs, filing cabinets, and office supplies",
      weight: "3,200 kg",
      service: "International Moving",
      departure: "2026-11-01",
      arrival: "2026-11-05",
      transitDays: 4,
    },
    actions: [
      "Validate shipment details",
      "Confirm route availability",
      "Reserve transport capacity",
      "Generate quote",
      "Await employee confirmation",
    ],
  },
  {
    name: "Downtown Office Relocation",
    status: "In Progress",
    active: false,
    actions: ["Packing completed", "Loading in progress", "En route to destination"],
  },
  {
    name: "Warehouse Inventory Transfer",
    status: "Scheduled",
    active: false,
    actions: ["Schedule confirmed", "Crew assigned", "Route optimized"],
  },
  {
    name: "Corporate Shipment - East Coast",
    status: "Delivered",
    active: false,
    actions: ["Picked up", "In transit", "Delivered & signed"],
  },
]

function InteractiveProcessList({ selectedProcess, onSelectProcess }: { selectedProcess: string; onSelectProcess: (name: string) => void }) {
  return (
    <Card className="flex h-full flex-col overflow-hidden rounded border-border">
      <CardHeader className="shrink-0 border-b border-border p-3">
        <div className="flex items-center gap-2">
          <Workflow className="h-4 w-4 text-blue-500" />
          <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Processes
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-0">
        {processes.map((item) => (
          <button
            key={item.name}
            onClick={() => onSelectProcess(item.name)}
            className={
              item.name === selectedProcess
                ? "w-full border-b border-border border-l-2 border-l-emerald-500 bg-emerald-500/10 px-3 py-3 text-left transition-colors hover:bg-emerald-500/15"
                : "w-full border-b border-border px-3 py-3 text-left transition-colors hover:bg-muted/50"
            }
          >
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-medium text-foreground">{item.name}</span>
              <span className={`shrink-0 font-mono text-[9px] uppercase tracking-wider ${
                item.status === "Awaiting Confirmation" ? "text-emerald-600 font-semibold" :
                item.status === "In Progress" ? "text-blue-600" :
                item.status === "Scheduled" ? "text-orange-600" :
                item.status === "Delivered" ? "text-emerald-600" :
                "text-muted-foreground"
              }`}>
                {item.status}
              </span>
            </div>

            {/* Show shipment preview if job request */}
            {item.shipment && (
              <div className="mt-2 space-y-1 rounded border border-emerald-500/20 bg-emerald-500/5 p-2 text-[9px]">
                <p className="text-foreground font-medium">
                  {item.shipment.origin} → {item.shipment.destination}
                </p>
                <p className="text-muted-foreground">
                  {item.shipment.weight} • {item.shipment.service}
                </p>
              </div>
            )}

            <div className="mt-2 space-y-1">
              {item.actions.map((action) => (
                <p
                  key={action}
                  className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
                >
                  {action}
                </p>
              ))}
            </div>
          </button>
        ))}
      </CardContent>
    </Card>
  )
}

export default function ProcessesPage() {
  const [selectedProcess, setSelectedProcess] = useState(processes[0].name)

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex shrink-0 items-center justify-between border-b border-border px-6 py-3"
      >
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="sm" className="h-8 gap-1.5 rounded-md px-3 text-sm">
              <ChevronLeft className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <div className="h-4 w-px bg-border" />
          <div>
            <h1 className="text-base font-semibold">Active Moves</h1>
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Real-time Operations</p>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden p-4 lg:grid-cols-12">
        {/* Left Panel - Process List */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="overflow-y-auto lg:col-span-3"
        >
          <InteractiveProcessList selectedProcess={selectedProcess} onSelectProcess={setSelectedProcess} />
        </motion.div>

        {/* Center Panel - Process Output */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="overflow-y-auto lg:col-span-5"
        >
          <ProcessOutput processName={selectedProcess} />
        </motion.div>

        {/* Right Panel - Terminal Logs */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="h-full min-h-[400px] lg:col-span-4"
        >
          <TerminalLogs agentSlug="processes" />
        </motion.div>
      </div>
    </div>
  )
}
