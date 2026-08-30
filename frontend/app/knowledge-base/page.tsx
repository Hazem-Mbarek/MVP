"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ChevronLeft, Folder, FileText, Search, Database, BookOpen, Users, FileCode } from "lucide-react"
import { Input } from "@/components/ui/input"
import { MarkdownRenderer } from "@/components/markdown-renderer"

const dataSources = [
  {
    id: "incoterms",
    name: "Incoterms",
    description: "International Commercial Terms defining obligations in trade",
    items: 11,
    icon: BookOpen,
    color: "text-blue-500",
  },
  {
    id: "cmr",
    name: "CMR Convention",
    description: "Convention on the Contract for International Carriage of Goods by Road",
    items: 31,
    icon: FileCode,
    color: "text-purple-500",
  },
  {
    id: "faq",
    name: "FAQ & Company Policy",
    description: "Internal company policies, services, and operational practices",
    items: 15,
    icon: Users,
    color: "text-emerald-500",
  },
  {
    id: "database",
    name: "Operational Database",
    description: "Real-time company data: employees, clients, jobs, vehicles, warehouses",
    items: 15,
    icon: Database,
    color: "text-red-500",
  },
  {
    id: "reports",
    name: "Operational Reports",
    description: "Sales, inventory, shipments, fleet, and financial reports",
    items: 5,
    icon: FileText,
    color: "text-orange-500",
  },
]

const sourceDetails: Record<string, Array<{ name: string; path: string; type: string }>> = {
  incoterms: [
    { name: "EXW.md", path: "data/knowledge/incoterms/EXW.md", type: "Definition & Obligations" },
    { name: "FOB.md", path: "data/knowledge/incoterms/FOB.md", type: "Definition & Obligations" },
    { name: "CIF.md", path: "data/knowledge/incoterms/CIF.md", type: "Definition & Obligations" },
    { name: "DDP.md", path: "data/knowledge/incoterms/DDP.md", type: "Definition & Obligations" },
    { name: "DAP.md", path: "data/knowledge/incoterms/DAP.md", type: "Definition & Obligations" },
    { name: "FCA.md", path: "data/knowledge/incoterms/FCA.md", type: "Definition & Obligations" },
    { name: "CPT.md", path: "data/knowledge/incoterms/CPT.md", type: "Definition & Obligations" },
    { name: "CIP.md", path: "data/knowledge/incoterms/CIP.md", type: "Definition & Obligations" },
    { name: "FAS.md", path: "data/knowledge/incoterms/FAS.md", type: "Definition & Obligations" },
    { name: "CFR.md", path: "data/knowledge/incoterms/CFR.md", type: "Definition & Obligations" },
    { name: "DPU.md", path: "data/knowledge/incoterms/DPU.md", type: "Definition & Obligations" },
  ],
  cmr: [
    { name: "cmr.jsonl", path: "data/knowledge/cmr/cmr.jsonl", type: "All Articles" },
  ],
  faq: [
    { name: "faq.jsonl", path: "data/knowledge/faq/faq.jsonl", type: "FAQ Records" },
  ],
  database: [
    { name: "loghub.db", path: "data/knowledge/company/database/loghub.db", type: "SQLite Database" },
    { name: "create_sqlite.sql", path: "data/knowledge/company/database/create_sqlite.sql", type: "Schema" },
    { name: "seed2.sql", path: "data/knowledge/company/database/seed2.sql", type: "Sample Data" },
  ],
  reports: [
    { name: "Sales Report Q3 2026", path: "data/knowledge/reports/sales_report_q3_2026.csv", type: "Revenue Data" },
    { name: "Inventory Snapshot", path: "data/knowledge/reports/inventory_snapshot.csv", type: "Stock Levels" },
    { name: "Shipment Performance", path: "data/knowledge/reports/shipment_performance.csv", type: "Logistics" },
    { name: "Fleet Utilization", path: "data/knowledge/reports/fleet_utilization.csv", type: "Operations" },
    { name: "Financial Summary", path: "data/knowledge/reports/financial_summary.csv", type: "Financials" },
  ],
}

export default function KnowledgeBasePage() {
  const [selectedSource, setSelectedSource] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [databaseTables, setDatabaseTables] = useState<any[]>([])
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [jsonlRecords, setJsonlRecords] = useState<any[]>([])
  const [selectedRecord, setSelectedRecord] = useState<any>(null)
  const [tablePage, setTablePage] = useState(0)
  const [tableSortOrder, setTableSortOrder] = useState<"asc" | "desc">("desc")
  const rowsPerPage = 5

  const filteredSources = dataSources.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedSourceData = selectedSource ? dataSources.find(s => s.id === selectedSource) : null
  const sourceFiles = selectedSource ? sourceDetails[selectedSource] || [] : []

  // Reset selections when source changes
  useEffect(() => {
    setSelectedFile(null)
    setSelectedTable(null)
    setSelectedRecord(null)
    setFileContent(null)
    setTablePage(0)
  }, [selectedSource])

  // Load JSONL records (FAQ/CMR) when selected
  useEffect(() => {
    if (selectedSource !== "faq" && selectedSource !== "cmr") return
    if (jsonlRecords.length > 0) return // Already loaded
    
    const loadRecords = async () => {
      try {
        console.log("[KB] Fetching JSONL records for:", selectedSource)
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
        const url = `${backendUrl}/api/knowledge/jsonl-records?source=${selectedSource}`
        
        setLoading(true)
        const response = await fetch(url)
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const data = await response.json()
        
        if (data.success && data.records) {
          setJsonlRecords(data.records)
          console.log("[KB] Loaded", data.records.length, "records")
        }
      } catch (error) {
        console.error("[KB] Failed to load JSONL records:", error)
      } finally {
        setLoading(false)
      }
    }
    
    loadRecords()
  }, [selectedSource])

  // Load database tables when database source is selected
  useEffect(() => {
    if (selectedSource !== "database") return
    if (databaseTables.length > 0) return // Already loaded
    
    const loadDatabaseTables = async () => {
      try {
        console.log("[KB] Fetching database tables...")
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
        const url = `${backendUrl}/api/knowledge/database/tables`
        console.log("[KB] Requesting:", url)
        
        setLoading(true)
        const response = await fetch(url)
        console.log("[KB] Response status:", response.status)
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error("[KB] Error response:", errorText)
          throw new Error(`HTTP ${response.status}`)
        }
        
        const data = await response.json()
        console.log("[KB] Received", data.tables?.length || 0, "tables")
        
        if (data.success && data.tables) {
          setDatabaseTables(data.tables)
        }
      } catch (error) {
        console.error("[KB] Failed to load database tables:", error)
      } finally {
        setLoading(false)
      }
    }
    
    loadDatabaseTables()
  }, [selectedSource])

  // Load file content
  useEffect(() => {
    if (!selectedFile) {
      setFileContent(null)
      return
    }

    const loadFile = async () => {
      setLoading(true)
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
        const url = `${backendUrl}/api/knowledge/file?path=${encodeURIComponent(selectedFile)}`
        console.log("[KB] Backend URL:", backendUrl)
        console.log("[KB] Selected file:", selectedFile)
        console.log("[KB] Fetching file from:", url)
        
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Accept": "application/json",
          },
        })
        
        console.log("[KB] Response status:", response.status)
        console.log("[KB] Response headers:", {
          contentType: response.headers.get("content-type"),
          corsHeader: response.headers.get("access-control-allow-origin"),
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error("[KB] Error response body:", errorText)
          throw new Error(`Failed to load file (${response.status}): ${errorText}`)
        }
        
        const data = await response.json()
        console.log("[KB] Response data:", { success: data.success, contentLength: data.content?.length })
        
        if (!data.success) throw new Error(data.error || "Failed to load file")
        setFileContent(data.content)
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        console.error("[KB] Error:", errorMsg)
        console.error("[KB] Full error:", error)
        setFileContent(`Error loading file: ${errorMsg}`)
      } finally {
        setLoading(false)
      }
    }

    loadFile()
  }, [selectedFile])

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
            <h1 className="text-base font-semibold">Knowledge Base</h1>
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Data Sources</p>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden p-4 lg:grid-cols-12">
        {/* Left Panel - Data Sources */}
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
                    Data Sources
                  </span>
                </div>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search sources..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-8 pl-8 text-sm"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
              {filteredSources.map((source) => (
                <button
                  key={source.id}
                  onClick={() => {
                    setSelectedSource(source.id)
                    setSelectedFile(null)
                    setFileContent(null)
                  }}
                  className={
                    source.id === selectedSource
                      ? "w-full border-b border-border border-l-2 border-l-blue-500 bg-blue-500/10 px-3 py-3 text-left transition-colors hover:bg-blue-500/15"
                      : "w-full border-b border-border px-3 py-3 text-left transition-colors hover:bg-muted/50"
                  }
                >
                  <div className="flex items-center gap-2">
                    <source.icon className={`h-4 w-4 ${source.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{source.name}</p>
                      <p className="truncate text-[10px] text-muted-foreground">{source.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Center Panel - Source Contents */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="overflow-y-auto lg:col-span-4"
        >
          <Card className="flex h-full flex-col overflow-hidden rounded border-border">
            <CardHeader className="shrink-0 border-b border-border p-3">
              {selectedSourceData ? (
                <div>
                  <div className="flex items-center gap-2">
                    <selectedSourceData.icon className={`h-4 w-4 ${selectedSourceData.color}`} />
                    <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Contents
                    </span>
                  </div>
                  <h3 className="mt-2 font-semibold text-foreground">{selectedSourceData.name}</h3>
                </div>
              ) : (
                <div>
                  <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Select a data source
                  </span>
                </div>
              )}
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
              {selectedSourceData ? (
                selectedSource === "database" ? (
                  // Database tables list
                  <div className="space-y-0.5">
                    {databaseTables.map((table) => (
                      <button
                        key={table.name}
                        onClick={() => setSelectedTable(table.name)}
                        className={
                          selectedTable === table.name
                            ? "w-full border-b border-border border-l-2 border-l-blue-500 bg-blue-500/10 px-3 py-2.5 text-left transition-colors hover:bg-blue-500/15"
                            : "w-full border-b border-border px-3 py-2.5 hover:bg-muted/50 transition-colors text-left"
                        }
                      >
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4 text-red-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground truncate">{table.name}</p>
                            <p className="text-[9px] text-muted-foreground">{table.rowCount} rows</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (selectedSource === "faq" || selectedSource === "cmr") ? (
                  // JSONL records list (FAQ/CMR)
                  <div className="space-y-0.5">
                    {jsonlRecords.map((record) => {
                      const displayName = record.question || record.title || record.id || "Untitled"
                      return (
                        <button
                          key={record.id}
                          onClick={() => setSelectedRecord(record)}
                          className={
                            selectedRecord?.id === record.id
                              ? "w-full border-b border-border border-l-2 border-l-blue-500 bg-blue-500/10 px-3 py-2.5 text-left transition-colors hover:bg-blue-500/15"
                              : "w-full border-b border-border px-3 py-2.5 hover:bg-muted/50 transition-colors text-left"
                          }
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-amber-500 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-foreground truncate">{displayName}</p>
                              <p className="text-[9px] text-muted-foreground">{record.id}</p>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  // File list
                  <div className="space-y-0.5">
                    {sourceFiles.map((file) => (
                      <button
                        key={file.name}
                        onClick={() => setSelectedFile(file.path)}
                        className={
                          selectedFile === file.path
                            ? "w-full border-b border-border border-l-2 border-l-blue-500 bg-blue-500/10 px-3 py-2.5 text-left transition-colors hover:bg-blue-500/15"
                            : "w-full border-b border-border px-3 py-2.5 hover:bg-muted/50 transition-colors text-left"
                        }
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-amber-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground truncate">{file.name}</p>
                            <p className="text-[9px] text-muted-foreground">{file.type}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="font-mono text-xs text-muted-foreground">Select a data source</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Panel - File Content */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="h-full min-h-[400px] lg:col-span-5"
        >
          <Card className="flex h-full flex-col overflow-hidden rounded border-border">
            <CardHeader className="shrink-0 border-b border-border px-3 py-2">
              <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {selectedFile ? "File Preview" : selectedTable ? "Table Preview" : selectedRecord ? "Record" : "Select a file, table, or record"}
              </span>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-3">
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <p className="font-mono text-sm text-muted-foreground">Loading...</p>
                </div>
              ) : selectedRecord ? (
                // JSONL record display
                <div className="max-w-none text-sm space-y-3">
                  {Object.entries(selectedRecord).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-xs font-semibold text-blue-600 mb-1">{key}</p>
                      <p className="text-xs text-foreground whitespace-pre-wrap break-words">{String(value || '')}</p>
                    </div>
                  ))}
                </div>
              ) : selectedTable && selectedSource === "database" ? (
                // Database table display
                <div className="max-w-none text-sm">
                  {(() => {
                    const tableData = databaseTables.find(t => t.name === selectedTable)
                    if (!tableData) return <p>Table not found</p>
                    
                    // Sort rows
                    const sortedRows = [...tableData.sampleRows].sort((a, b) => {
                      // Try to find a date column to sort by
                      const dateCol = tableData.columns.find((c: any) => c.type.includes("DATE") || c.type.includes("TIMESTAMP") || c.name.includes("date"))
                      if (dateCol) {
                        const aVal = new Date(a[dateCol.name] || 0).getTime()
                        const bVal = new Date(b[dateCol.name] || 0).getTime()
                        return tableSortOrder === "desc" ? bVal - aVal : aVal - bVal
                      }
                      return 0
                    })
                    
                    // Paginate rows
                    const paginatedRows = sortedRows.slice(tablePage * rowsPerPage, (tablePage + 1) * rowsPerPage)
                    const totalPages = Math.ceil(sortedRows.length / rowsPerPage)
                    
                    return (
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold mb-2">Columns ({tableData.columns.length})</h3>
                          <div className="bg-white border border-border p-3 rounded text-xs text-foreground space-y-1">
                            {tableData.columns.map((col: any, idx: number) => (
                              <div key={idx}><span className="text-blue-600 font-medium">{col.name}</span> <span className="text-gray-600">({col.type})</span></div>
                            ))}
                          </div>
                        </div>
                        
                        {tableData.sampleRows.length > 0 && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold">Sample Data</h3>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setTableSortOrder(tableSortOrder === "desc" ? "asc" : "desc")}
                                  className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                  {tableSortOrder === "desc" ? "Newest" : "Oldest"}
                                </button>
                              </div>
                            </div>
                            <div className="overflow-x-auto border border-border rounded">
                              <table className="text-xs border-collapse w-full">
                                <thead>
                                  <tr className="bg-gray-100 border-b border-border">
                                    {tableData.columns.map((col: any, idx: number) => (
                                      <th key={idx} className="border-r border-border p-2 text-left font-semibold text-foreground">{col.name}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {paginatedRows.map((row: any, ridx: number) => (
                                    <tr key={ridx} className="border-b border-border hover:bg-gray-50">
                                      {tableData.columns.map((col: any, cidx: number) => (
                                        <td key={cidx} className="border-r border-border p-2 text-foreground truncate max-w-xs">{String(row[col.name] || '')}</td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            {/* Pagination Controls */}
                            <div className="flex items-center justify-end gap-2 mt-3">
                              <button
                                onClick={() => setTablePage(Math.max(0, tablePage - 1))}
                                disabled={tablePage === 0}
                                className="px-2 py-1 text-xs bg-border rounded hover:bg-muted disabled:opacity-50"
                              >
                                ← Previous
                              </button>
                              <button
                                onClick={() => setTablePage(Math.min(totalPages - 1, tablePage + 1))}
                                disabled={tablePage >= totalPages - 1}
                                className="px-2 py-1 text-xs bg-border rounded hover:bg-muted disabled:opacity-50"
                              >
                                Next →
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })()}
                </div>
              ) : fileContent ? (
                <div className="max-w-none text-sm">
                  {selectedFile?.endsWith('.md') ? (
                    <MarkdownRenderer content={fileContent} />
                  ) : selectedFile?.endsWith('.csv') ? (
                    (() => {
                      // Parse CSV
                      const lines = fileContent.trim().split('\n')
                      const headers = lines[0].split(',').map(h => h.trim())
                      const rows = lines.slice(1).map(line => {
                        const values = line.split(',').map(v => v.trim())
                        return headers.reduce((obj, header, idx) => {
                          obj[header] = values[idx] || ''
                          return obj
                        }, {} as Record<string, string>)
                      })
                      
                      return (
                        <div className="space-y-3">
                          <div className="overflow-x-auto border border-border rounded">
                            <table className="text-xs border-collapse w-full bg-white">
                              <thead>
                                <tr className="bg-blue-50 border-b border-border">
                                  {headers.map((header, idx) => (
                                    <th key={idx} className="border-r border-border px-3 py-2 text-left font-semibold text-blue-900 whitespace-nowrap">{header}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {rows.map((row, ridx) => (
                                  <tr key={ridx} className="border-b border-border hover:bg-blue-50">
                                    {headers.map((header, cidx) => (
                                      <td key={cidx} className="border-r border-border px-3 py-2 text-gray-700">{row[header]}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <p className="text-xs text-muted-foreground">Total records: {rows.length}</p>
                        </div>
                      )
                    })()
                  ) : selectedFile?.endsWith('.sql') ? (
                    <pre className="bg-zinc-900 p-3 rounded overflow-auto text-xs text-zinc-300">
                      <code>{fileContent}</code>
                    </pre>
                  ) : selectedFile?.endsWith('.jsonl') ? (
                    <pre className="bg-zinc-900 p-3 rounded overflow-auto text-xs text-zinc-300">
                      <code>{fileContent.substring(0, 10000)}</code>
                    </pre>
                  ) : (
                    <pre className="bg-zinc-900 p-3 rounded overflow-auto text-xs text-zinc-300">
                      <code>{fileContent.substring(0, 5000)}</code>
                    </pre>
                  )}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="font-mono text-xs text-muted-foreground">
                    {selectedSourceData ? (selectedSource === "database" ? "Click a table to view" : "Click a file to preview") : "Select a data source"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
