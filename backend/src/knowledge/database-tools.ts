/**
 * Database query tool for LogHub operational database
 * Allows agent to query company data (clients, jobs, employees, vehicles, etc.)
 * with safety constraints and proper SQL generation
 */

import sqlite3 from "sqlite3"
import path from "path"

// Define allowed tables and their safe columns for querying
const ALLOWED_TABLES = {
  clients: [
    "client_id",
    "client_code",
    "company_name",
    "contact_name",
    "email",
    "phone",
    "country",
    "city",
    "client_type",
    "status",
  ],
  company: [
    "company_id",
    "legal_name",
    "trading_name",
    "legal_form",
    "founded_year",
    "headquarters_city",
    "headquarters_country",
    "employee_count",
    "primary_currency",
    "timezone",
  ],
  countries: ["country_id", "country_code", "country_name", "is_home_market", "is_active_market"],
  country_services: ["country_service_id", "country_id", "service_id", "availability_status", "notes"],
  departments: ["department_id", "company_id", "name", "description", "employee_count"],
  employees: [
    "employee_id",
    "company_id",
    "department_id",
    "employee_code",
    "first_name",
    "last_name",
    "job_title",
    "email",
    "phone",
    "employment_status",
    "manager_id",
    "hire_date",
    "can_approve_discounts",
    "can_approve_claims",
    "can_approve_shipments",
  ],
  issues: [
    "issue_id",
    "job_id",
    "client_id",
    "issue_type",
    "severity",
    "status",
    "reported_date",
    "description",
    "responsible_employee_id",
    "company_decision",
    "resolution",
    "resolved_date",
    "cost",
    "client_compensation",
  ],
  jobs: [
    "job_id",
    "client_id",
    "service_id",
    "job_code",
    "shipment_type",
    "content_description",
    "weight_kg",
    "origin_city",
    "origin_country",
    "destination_city",
    "destination_country",
    "departure_date",
    "arrival_date",
    "return_to_warehouse_date",
    "vehicle_id",
    "driver_employee_id",
    "pricing_model_id",
    "price",
    "currency",
    "voyage_length_km",
    "status",
  ],
  pricing_models: ["pricing_model_id", "name", "description", "pricing_method", "currency", "is_active"],
  services: ["service_id", "service_code", "service_name", "description", "is_active"],
  vehicles: [
    "vehicle_id",
    "company_id",
    "vehicle_code",
    "vehicle_type",
    "registration_country",
    "payload_kg",
    "volume_m3",
    "pallet_capacity",
    "has_tail_lift",
    "has_gps",
    "side_loading",
    "rear_loading",
    "temperature_controlled",
    "adr_capable",
    "current_status",
    "current_location",
  ],
  warehouse_capabilities: [
    "warehouse_capability_id",
    "warehouse_id",
    "capability_code",
    "capability_name",
    "availability_status",
  ],
  warehouses: [
    "warehouse_id",
    "company_id",
    "warehouse_code",
    "name",
    "facility_role",
    "city",
    "region",
    "country",
    "area_sqm",
    "pallet_capacity",
    "loading_docks",
    "forklift_count",
    "temperature_controlled",
    "hazardous_goods_storage",
    "cross_docking",
    "short_term_storage",
    "medium_term_storage",
    "cctv",
    "is_active",
  ],
}

const MAX_ROWS = 100
let db: sqlite3.Database | null = null
let dbInitialized = false

function ensureDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (dbInitialized && db) {
      resolve()
      return
    }

    console.log("[DATABASE] Lazy-initializing database connection...")
    const dbPath = path.resolve(__dirname, "../../../data/knowledge/company/database/loghub.db")
    
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error("[DATABASE] Error opening database:", err)
        db = null
        reject(err)
        return
      }

      console.log("[DATABASE] Database connection established")
      db!.run("PRAGMA foreign_keys = ON", (err) => {
        if (err) {
          console.error("[DATABASE] Error setting pragmas:", err)
          reject(err)
        } else {
          dbInitialized = true
          resolve()
        }
      })
    })
  })
}

export function initDatabase() {
  // Dummy export for backward compatibility - actual init happens on first query
  console.log("[DATABASE] Initialization deferred to first query")
}

export function queryDatabase(request: {
  description: string
  tables?: string[]
  filters?: Record<string, string | number>
  limit?: number
}): Promise<any> {
  return ensureDatabase()
    .then(() => {
      if (!db) {
        return Promise.resolve({
          status: "error",
          message: "Database connection failed after initialization attempt",
        })
      }

      try {
        console.log(`[DATABASE] Query request: ${request.description}`)

        // Validate table list
        const requestedTables = request.tables || []
        for (const table of requestedTables) {
          if (!ALLOWED_TABLES[table as keyof typeof ALLOWED_TABLES]) {
            return Promise.resolve({
              status: "error",
              message: `Table '${table}' not allowed. Allowed tables: ${Object.keys(ALLOWED_TABLES).join(", ")}`,
            })
          }
        }

        // Build query based on description
        let query = buildQuery(request)

        if (!query) {
          return Promise.resolve({
            status: "error",
            message: "Could not construct valid SQL query from request. Ensure request specifies clear table and filter criteria.",
          })
        }

        console.log(`[DATABASE] Executing: ${query}`)

        return new Promise((resolve) => {
          db!.all(query, (err, rows: any[]) => {
            if (err) {
              console.error("[DATABASE] Query error:", err.message)
              resolve({
                status: "error",
                message: `Database query failed: ${err.message}`,
              })
            } else {
              console.log(`[DATABASE] Query returned ${rows.length} rows`)
              resolve({
                status: "success",
                table: requestedTables[0] || "result",
                row_count: rows.length,
                limit: request.limit || MAX_ROWS,
                data: rows.slice(0, request.limit || MAX_ROWS),
              })
            }
          })
        })
      } catch (error: any) {
        console.error("[DATABASE] Query error:", error.message)
        return Promise.resolve({
          status: "error",
          message: `Database query failed: ${error.message}`,
        })
      }
    })
    .catch((error) => {
      const errorMsg = error instanceof Error ? error.message : String(error)
      console.error(`[DATABASE] Failed to initialize on query:`, errorMsg)
      return {
        status: "error",
        message: `Database unavailable: ${errorMsg}`,
      }
    })
}

/**
 * Build SQL query from natural language request
 */
function buildQuery(request: {
  description: string
  tables?: string[]
  filters?: Record<string, string | number>
  limit?: number
}): string | null {
  const tables = request.tables || []
  const limit = Math.min(request.limit || MAX_ROWS, MAX_ROWS)

  if (tables.length === 0) {
    return null
  }

  const table = tables[0]
  const allowedColumns = ALLOWED_TABLES[table as keyof typeof ALLOWED_TABLES]

  if (!allowedColumns) {
    return null
  }

  let columnsToSelect: string[] = []

  if (table === "jobs") {
    columnsToSelect = [
      "job_code",
      "shipment_type",
      "content_description",
      "weight_kg",
      "origin_city",
      "origin_country",
      "destination_city",
      "destination_country",
      "departure_date",
      "arrival_date",
      "price",
      "currency",
      "status",
    ]
  } else if (table === "clients") {
    columnsToSelect = [
      "company_name",
      "contact_name",
      "email",
      "phone",
      "city",
      "country",
      "client_type",
      "status",
    ]
  } else if (table === "issues") {
    columnsToSelect = [
      "issue_type",
      "severity",
      "status",
      "reported_date",
      "description",
      "resolution",
      "resolved_date",
      "client_compensation",
    ]
  } else {
    columnsToSelect = allowedColumns.slice(0, 8)
  }

  const validColumns = columnsToSelect.filter((col) => allowedColumns.includes(col))

  let query = `SELECT ${validColumns.join(", ")} FROM ${table}`

  if (request.filters && Object.keys(request.filters).length > 0) {
    const whereConditions: string[] = []
    for (const [key, value] of Object.entries(request.filters)) {
      if (allowedColumns.includes(key)) {
        if (typeof value === "string") {
          whereConditions.push(`${key} = '${value.replace(/'/g, "''")}'`)
        } else {
          whereConditions.push(`${key} = ${value}`)
        }
      }
    }
    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(" AND ")}`
    }
  }

  query += ` LIMIT ${limit}`

  return query
}
