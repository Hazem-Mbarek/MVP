"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Workflow } from "lucide-react"

const processes = [
  {
    name: "Job Request JOB-2026-1101-001",
    status: "Awaiting Confirmation",
    active: true,
    details: {
      type: "Shipment Validation",
      client: "External Client",
      priority: "Standard",
    },
    shipment: {
      origin: "Leipzig, Germany",
      destination: "Warsaw, Poland",
      shipmentType: "Office furniture and equipment",
      contentDescription: "Desks, chairs, filing cabinets, and office supplies",
      weight: "3,200 kg",
      service: "International Moving",
      departure: "2026-11-01",
      arrival: "2026-11-05",
      transitDays: "4 days",
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
    name: "Session Anomaly Scan",
    status: "Complete",
    active: false,
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
                ? "border-b border-border border-l-2 border-l-emerald-500 bg-emerald-500/10 px-3 py-3"
                : "border-b border-border px-3 py-3"
            }
          >
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-medium text-foreground">{item.name}</span>
              <span className={`shrink-0 font-mono text-[9px] uppercase tracking-wider ${
                item.status === "Awaiting Confirmation" ? "text-emerald-600 font-semibold" :
                item.status === "Complete" ? "text-emerald-600" :
                item.status === "Running" ? "text-blue-600" :
                "text-muted-foreground"
              }`}>
                {item.status}
              </span>
            </div>

            {/* Show shipment details if job request */}
            {item.shipment && (
              <div className="mt-3 space-y-1.5 rounded border border-emerald-500/20 bg-emerald-500/5 p-2">
                <div className="grid grid-cols-2 gap-2 text-[9px]">
                  <div>
                    <p className="font-mono uppercase tracking-wider text-muted-foreground">From</p>
                    <p className="text-foreground">{item.shipment.origin}</p>
                  </div>
                  <div>
                    <p className="font-mono uppercase tracking-wider text-muted-foreground">To</p>
                    <p className="text-foreground">{item.shipment.destination}</p>
                  </div>
                  <div>
                    <p className="font-mono uppercase tracking-wider text-muted-foreground">Weight</p>
                    <p className="text-foreground">{item.shipment.weight}</p>
                  </div>
                  <div>
                    <p className="font-mono uppercase tracking-wider text-muted-foreground">Service</p>
                    <p className="text-foreground">{item.shipment.service}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="font-mono uppercase tracking-wider text-muted-foreground">Cargo Type</p>
                    <p className="text-foreground">{item.shipment.shipmentType}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="font-mono uppercase tracking-wider text-muted-foreground">Contents</p>
                    <p className="text-foreground text-[8px]">{item.shipment.contentDescription}</p>
                  </div>
                  <div>
                    <p className="font-mono uppercase tracking-wider text-muted-foreground">Depart</p>
                    <p className="text-foreground">{item.shipment.departure}</p>
                  </div>
                  <div>
                    <p className="font-mono uppercase tracking-wider text-muted-foreground">Arrive</p>
                    <p className="text-foreground">{item.shipment.arrival}</p>
                  </div>
                </div>
                <div className="border-t border-emerald-500/20 pt-1.5 mt-1.5">
                  <p className="font-mono text-[8px] uppercase tracking-wider text-emerald-600">
                    ✓ Transit: {item.shipment.transitDays}
                  </p>
                </div>
              </div>
            )}

            {/* Show actions */}
            <div className="mt-2 space-y-0.5">
              {item.actions.map((action) => (
                <p
                  key={action}
                  className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground"
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
