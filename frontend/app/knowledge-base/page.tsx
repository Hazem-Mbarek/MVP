"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ChevronLeft, Folder, FileText, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

const folders = [
  {
    id: "procedures",
    name: "Operational Procedures",
    description: "Standard moving and logistics procedures",
    items: 12,
    icon: Folder,
  },
  {
    id: "safety",
    name: "Safety & Training",
    description: "Safety protocols and employee training materials",
    items: 8,
    icon: Folder,
  },
  {
    id: "routes",
    name: "Route Optimization",
    description: "Approved routes and traffic management",
    items: 6,
    icon: Folder,
  },
  {
    id: "compliance",
    name: "Compliance & Regulations",
    description: "Transportation laws and regulatory requirements",
    items: 10,
    icon: Folder,
  },
  {
    id: "equipment",
    name: "Equipment & Maintenance",
    description: "Fleet maintenance logs and specifications",
    items: 15,
    icon: Folder,
  },
  {
    id: "customer",
    name: "Customer Policies",
    description: "Terms, liability, and service agreements",
    items: 9,
    icon: Folder,
  },
]

const documents = {
  procedures: [
    "Loading & Unloading Procedure.pdf",
    "Packing Standards Guide.pdf",
    "Inventory Verification Checklist.pdf",
    "Customer Handoff Protocol.pdf",
    "Damage Assessment Procedure.pdf",
    "Return & Refund Process.pdf",
    "Special Items Handling.pdf",
    "International Shipping Procedure.pdf",
    "Emergency Response Protocol.pdf",
    "Quality Control Checklist.pdf",
    "Documentation Requirements.pdf",
    "Vehicle Inspection Procedure.pdf",
  ],
  safety: [
    "OSHA Safety Requirements.pdf",
    "Lifting & Handling Techniques.pdf",
    "PPE Requirements.pdf",
    "Hazard Identification Guide.pdf",
    "First Aid Procedures.pdf",
    "Incident Reporting Form.pdf",
    "Safety Training Certification.pdf",
    "Emergency Evacuation Plan.pdf",
  ],
  routes: [
    "Highway Route Standards.pdf",
    "Downtown Traffic Management.pdf",
    "Residential Area Guidelines.pdf",
    "Construction Zone Avoidance.pdf",
    "Peak Hours Routing.pdf",
    "Weather Impact Procedures.pdf",
  ],
  compliance: [
    "DOT Regulations Overview.pdf",
    "Weight & Load Limits.pdf",
    "Hours of Service Rules.pdf",
    "Insurance Requirements.pdf",
    "Driver Licensing Requirements.pdf",
    "Vehicle Registration & Inspection.pdf",
    "Environmental Compliance.pdf",
    "Record Keeping Requirements.pdf",
    "State-Specific Regulations.pdf",
    "International Transport Laws.pdf",
  ],
  equipment: [
    "Fleet Vehicle Inventory.pdf",
    "Truck Maintenance Schedule.pdf",
    "GPS Tracker Installation Guide.pdf",
    "Equipment Inspection Forms.pdf",
    "Fuel Management System.pdf",
    "Tool & Equipment List.pdf",
    "Moving Dolly Standards.pdf",
    "Packing Material Inventory.pdf",
    "Climate Control System Manual.pdf",
    "Security System Guide.pdf",
    "Backup Camera System.pdf",
    "Load Securing Equipment.pdf",
    "Ramp & Lift Gate Manual.pdf",
    "Communication Equipment Guide.pdf",
    "Emergency Equipment Requirements.pdf",
  ],
  customer: [
    "Terms of Service Agreement.pdf",
    "Liability Waiver Form.pdf",
    "Pricing Structure & Rates.pdf",
    "Booking & Cancellation Policy.pdf",
    "Damage Claim Process.pdf",
    "Insurance Coverage Options.pdf",
    "Customer Satisfaction Guarantee.pdf",
    "Accessibility Accommodations.pdf",
    "Feedback & Complaint Procedure.pdf",
  ],
}

export default function KnowledgeBasePage() {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredFolders = folders.filter(f =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedFolderData = selectedFolder ? folders.find(f => f.id === selectedFolder) : null
  const folderDocs = selectedFolder ? documents[selectedFolder as keyof typeof documents] || [] : []

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
            <h1 className="text-base font-semibold">Documentation</h1>
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Knowledge Center</p>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden p-4 lg:grid-cols-12">
        {/* Left Panel - Folders */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="overflow-y-auto lg:col-span-3"
        >
          <Card className="flex h-full flex-col overflow-hidden rounded border-border">
            <CardHeader className="shrink-0 border-b border-border p-3">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Folder className="h-4 w-4 text-blue-500" />
                  <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Folders
                  </span>
                </div>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search folders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-8 pl-8 text-sm"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
              {filteredFolders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => setSelectedFolder(folder.id)}
                  className={
                    folder.id === selectedFolder
                      ? "w-full border-b border-border border-l-2 border-l-blue-500 bg-blue-500/10 px-3 py-3 text-left transition-colors hover:bg-blue-500/15"
                      : "w-full border-b border-border px-3 py-3 text-left transition-colors hover:bg-muted/50"
                  }
                >
                  <div className="flex items-center gap-2">
                    <Folder className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{folder.name}</p>
                      <p className="truncate text-[10px] text-muted-foreground">{folder.description}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-mono text-[9px] text-muted-foreground">{folder.items} items</span>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Center Panel - Folder Contents */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="overflow-y-auto lg:col-span-5"
        >
          <Card className="flex h-full flex-col overflow-hidden rounded border-border">
            <CardHeader className="shrink-0 border-b border-border p-3">
              {selectedFolderData ? (
                <div>
                  <div className="flex items-center gap-2">
                    <Folder className="h-4 w-4 text-blue-500" />
                    <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Contents
                    </span>
                  </div>
                  <h3 className="mt-2 font-semibold text-foreground">{selectedFolderData.name}</h3>
                </div>
              ) : (
                <div>
                  <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Select a folder
                  </span>
                </div>
              )}
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
              {selectedFolderData ? (
                <div className="space-y-0.5">
                  {folderDocs.map((doc) => (
                    <div
                      key={doc}
                      className="border-b border-border px-3 py-2.5 hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-amber-500 flex-shrink-0" />
                        <span className="text-sm text-foreground truncate">{doc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="font-mono text-xs text-muted-foreground">Select a folder to view documents</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Panel - Document Preview */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="h-full min-h-[400px] lg:col-span-4"
        >
          <Card className="flex h-full flex-col overflow-hidden rounded border-border bg-zinc-950">
            <CardHeader className="shrink-0 border-b border-zinc-800 px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                  Document Details
                </span>
                <span className="font-mono text-[10px] text-zinc-600">|</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-3">
              {selectedFolderData ? (
                <div className="space-y-4 font-mono text-[11px] text-zinc-300">
                  <div>
                    <p className="text-zinc-500 mb-1">FOLDER</p>
                    <p className="text-blue-400">{selectedFolderData.name}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 mb-1">TOTAL DOCUMENTS</p>
                    <p className="text-emerald-400">{folderDocs.length}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 mb-1">STATUS</p>
                    <p className="text-blue-400">Available</p>
                  </div>
                  <div className="border-t border-zinc-800 pt-3">
                    <p className="text-zinc-500 mb-2">DESCRIPTION</p>
                    <p className="text-zinc-400 text-[10px] leading-relaxed">
                      {selectedFolderData.description}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="font-mono text-[10px] text-zinc-600">NO SELECTION</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
