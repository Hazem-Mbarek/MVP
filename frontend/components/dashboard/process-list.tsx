"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Workflow } from "lucide-react"

const processes = [
  {
    name: "Session Anomaly Scan",
    status: "Complete",
    active: true,
    actions: ["Load sessions", "Score behavior", "Write result"],
  },
  {
    name: "Isolate High-Risk Host",
    status: "Idle",
    active: false,
    actions: ["Confirm target", "Cut network", "Notify SOC"],
  },
  {
    name: "Collect Endpoint Events",
    status: "Running",
    active: false,
    actions: ["Poll endpoints", "Normalize events", "Store logs"],
  },
]

export function ProcessList() {
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
          <div
            key={item.name}
            className={
              item.active
                ? "border-b border-border border-l-2 border-l-blue-500 bg-blue-500/10 px-3 py-3"
                : "border-b border-border px-3 py-3"
            }
          >
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-medium text-foreground">{item.name}</span>
              <span className="shrink-0 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                {item.status}
              </span>
            </div>
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
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
