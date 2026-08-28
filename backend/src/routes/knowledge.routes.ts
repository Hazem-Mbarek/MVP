import express, { Router, Request, Response } from "express"
import * as fs from "fs"
import * as path from "path"
import sqlite3 from "sqlite3"

const router = Router()

// GET /api/knowledge/file?path=...
router.get("/file", async (req: Request, res: Response) => {
  try {
    let filePath = req.query.path as string
    
    console.log("[KNOWLEDGE] File request received")
    console.log("[KNOWLEDGE] Raw path param:", filePath)
    console.log("[KNOWLEDGE] Current working directory:", process.cwd())

    if (!filePath) {
      console.warn("[KNOWLEDGE] Missing path parameter")
      return res.status(400).json({
        success: false,
        error: "Missing path parameter",
      })
    }

    // Normalize the path first
    let normalizedPath = path.normalize(filePath)
    console.log("[KNOWLEDGE] After normalize:", normalizedPath)
    
    // Convert backslashes to forward slashes for consistent comparison (Windows compatibility)
    normalizedPath = normalizedPath.replace(/\\/g, '/')
    console.log("[KNOWLEDGE] After slash normalization:", normalizedPath)
    
    // Security: prevent directory traversal
    if (normalizedPath.includes("..")) {
      console.warn("[KNOWLEDGE] Directory traversal attempt blocked:", normalizedPath)
      return res.status(403).json({
        success: false,
        error: "Invalid path",
      })
    }

    // Only allow files from data directory (NOW checking after slash conversion)
    if (!normalizedPath.startsWith("data/knowledge")) {
      console.warn("[KNOWLEDGE] Access denied - path not in data/knowledge:", normalizedPath)
      return res.status(403).json({
        success: false,
        error: "Access denied",
      })
    }

    // Convert back to OS-specific path for file system operations
    // Go up one level from backend directory to reach project root
    const osPath = path.join(...normalizedPath.split('/'))
    const fullPath = path.join(process.cwd(), "..", osPath)
    console.log("[KNOWLEDGE] Full path for file system:", fullPath)

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      console.warn("[KNOWLEDGE] File not found:", fullPath)
      return res.status(404).json({
        success: false,
        error: "File not found",
      })
    }

    // Check if it's a directory
    const stat = fs.statSync(fullPath)
    if (stat.isDirectory()) {
      console.warn("[KNOWLEDGE] Path is a directory:", fullPath)
      return res.status(400).json({
        success: false,
        error: "Path is a directory",
      })
    }

    console.log("[KNOWLEDGE] Serving file:", normalizedPath, "Size:", stat.size, "bytes")

    // Read and send file
    const content = fs.readFileSync(fullPath, "utf-8")
    console.log("[KNOWLEDGE] File read successfully, content length:", content.length)
    
    res.json({
      success: true,
      content,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("[KNOWLEDGE] Error serving file:", errorMessage)
    res.status(500).json({
      success: false,
      error: errorMessage,
    })
  }
})

// GET /api/knowledge/database/tables - List all database tables with their contents
router.get("/database/tables", async (req: Request, res: Response) => {
  try {
    console.log("[KNOWLEDGE] Database tables list requested")
    
    // Use same path resolution as file serving - go up one level from backend to root
    const dbPath = path.resolve(__dirname, "../../..", "data/knowledge/company/database/loghub.db")
    console.log("[KNOWLEDGE] Opening database at:", dbPath)
    
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error("[KNOWLEDGE] Database open error:", err)
        return res.status(500).json({
          success: false,
          error: "Failed to open database",
        })
      }

      // Get list of all tables
      db.all(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
        async (err, tables: any[]) => {
          if (err) {
            console.error("[KNOWLEDGE] Error listing tables:", err)
            db.close()
            return res.status(500).json({
              success: false,
              error: "Failed to list tables",
            })
          }

          try {
            const tablesData: any[] = []

            for (const table of tables) {
              const tableName = table.name
              console.log(`[KNOWLEDGE] Processing table: ${tableName}`)

              // Get row count
              const countResult: any = await new Promise((resolve) => {
                db.get(`SELECT COUNT(*) as count FROM ${tableName}`, (err, row) => {
                  resolve(row || { count: 0 })
                })
              })

              // Get first 5 rows
              const rows: any = await new Promise((resolve) => {
                db.all(`SELECT * FROM ${tableName} LIMIT 100`, (err, rows) => {
                  resolve(rows || [])
                })
              })

              // Get column info
              const columns: any = await new Promise((resolve) => {
                db.all(`PRAGMA table_info(${tableName})`, (err, cols) => {
                  resolve(cols || [])
                })
              })

              tablesData.push({
                name: tableName,
                rowCount: countResult.count,
                columns: columns.map((c: any) => ({ name: c.name, type: c.type })),
                sampleRows: rows,
              })
            }

            console.log(`[KNOWLEDGE] Database read complete: ${tablesData.length} tables`)
            db.close()

            res.json({
              success: true,
              tables: tablesData,
            })
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error)
            console.error("[KNOWLEDGE] Error processing tables:", errorMessage)
            db.close()
            res.status(500).json({
              success: false,
              error: errorMessage,
            })
          }
        }
      )
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("[KNOWLEDGE] Error in database tables endpoint:", errorMessage)
    res.status(500).json({
      success: false,
      error: errorMessage,
    })
  }
})

// GET /api/knowledge/jsonl-records?source=faq|cmr - List records from JSONL files
router.get("/jsonl-records", async (req: Request, res: Response) => {
  try {
    const source = req.query.source as string
    
    if (!source || !["faq", "cmr"].includes(source)) {
      return res.status(400).json({
        success: false,
        error: "Invalid or missing source parameter. Must be 'faq' or 'cmr'",
      })
    }

    console.log("[KNOWLEDGE] JSONL records requested for source:", source)
    
    const filePath = source === "faq" 
      ? path.resolve(__dirname, "../../..", "data/knowledge/faq/faq.jsonl")
      : path.resolve(__dirname, "../../..", "data/knowledge/cmr/cmr.jsonl")
    
    console.log("[KNOWLEDGE] Reading JSONL file:", filePath)

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: "JSONL file not found",
      })
    }

    const content = fs.readFileSync(filePath, "utf-8")
    const lines = content.trim().split("\n")
    const records: any[] = []

    for (const line of lines) {
      if (line.trim()) {
        try {
          records.push(JSON.parse(line))
        } catch (e) {
          console.warn("[KNOWLEDGE] Failed to parse JSONL line")
        }
      }
    }

    console.log("[KNOWLEDGE] Loaded", records.length, "records from", source)

    res.json({
      success: true,
      source,
      count: records.length,
      records,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("[KNOWLEDGE] Error reading JSONL records:", errorMessage)
    res.status(500).json({
      success: false,
      error: errorMessage,
    })
  }
})

export default router
