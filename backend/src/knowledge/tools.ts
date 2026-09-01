/**
 * Knowledge tools for OpenRouter function calling
 */

import { searchKnowledge } from "./search"
import { checkTransportCompatibility, compareIncoterms } from "./yaml-tools"
import { queryDatabase } from "./database-tools"
import { validateJobRequest } from "./job-validation"

// Tool schemas in OpenAI format
export const toolSchemas = [
  {
    type: "function",
    function: {
      name: "search_knowledge",
      description:
        "Search across FAQ, incoterms, CMR articles, and operational reports using semantic search. Returns relevant chunks with citations.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query",
          },
          source_filter: {
            type: "string",
            enum: ["faq", "incoterms", "cmr", "reports"],
            description: "Optional: filter results to a specific source (faq, incoterms, cmr, or reports)",
          },
          top_k: {
            type: "integer",
            description: "Number of results to return (default: 5, max: 10)",
            default: 5,
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "check_transport_compatibility",
      description:
        "Check if a transport mode is compatible with an incoterm. Uses deterministic lookup from transport_compatibility.yaml.",
      parameters: {
        type: "object",
        properties: {
          mode: {
            type: "string",
            description: "Transport mode (e.g., 'road', 'rail', 'sea', 'air')",
          },
          incoterm: {
            type: "string",
            description: "Incoterm code (e.g., 'FOB', 'CIF', 'DDP')",
          },
        },
        required: ["mode", "incoterm"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "compare_incoterms",
      description:
        "Compare attributes of multiple incoterms side by side. Uses deterministic lookup from incoterms_comparison.yaml.",
      parameters: {
        type: "object",
        properties: {
          codes: {
            type: "array",
            items: {
              type: "string",
            },
            description: "Array of incoterm codes to compare (e.g., ['FOB', 'CIF', 'DDP'])",
          },
        },
        required: ["codes"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "query_database",
      description:
        "Query the company operational database to retrieve data about clients, jobs, employees, vehicles, warehouses, issues, etc. The agent should generate appropriate SQL based on user intent.",
      parameters: {
        type: "object",
        properties: {
          description: {
            type: "string",
            description:
              "Natural language description of what data is needed (e.g., 'Find all active jobs for client ABC')",
          },
          tables: {
            type: "array",
            items: {
              type: "string",
              enum: ["employees", "departments", "clients", "jobs", "vehicles", "warehouses", "issues", "services", "countries"],
            },
            description: "Which tables to query from. Required.",
          },
          filters: {
            type: "object",
            description:
              "Optional filter conditions as key-value pairs (e.g., {status: 'active', client_id: 5})",
          },
          limit: {
            type: "integer",
            description: "Maximum number of rows to return (default: 100, max: 100)",
            default: 100,
          },
        },
        required: ["description", "tables"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "validate_job_request",
      description:
        "Validate a customer's shipment request for feasibility and availability. Checks route availability, service availability, dates, weight, and required fields. Returns detailed validation result with recommendations.",
      parameters: {
        type: "object",
        properties: {
          origin_city: {
            type: "string",
            description: "Pickup city name",
          },
          origin_country: {
            type: "string",
            description: "Pickup country name",
          },
          destination_city: {
            type: "string",
            description: "Delivery city name",
          },
          destination_country: {
            type: "string",
            description: "Delivery country name",
          },
          shipment_type: {
            type: "string",
            description: "Type of cargo (e.g., 'General freight', 'Palletized goods', 'Building materials', 'Moving')",
          },
          content_description: {
            type: "string",
            description: "Detailed description of what's being shipped",
          },
          weight_kg: {
            type: "number",
            description: "Total shipment weight in kilograms",
          },
          volume_m3: {
            type: "number",
            description: "Cargo volume in cubic meters (optional)",
          },
          service_type: {
            type: "string",
            description: "Requested service type (e.g., 'FTL', 'LTL', 'Moving', 'Express', 'Groupage')",
          },
          departure_date: {
            type: "string",
            description: "Scheduled departure date (ISO format: YYYY-MM-DD)",
          },
          arrival_date: {
            type: "string",
            description: "Expected arrival date (ISO format: YYYY-MM-DD)",
          },
          temperature_controlled: {
            type: "boolean",
            description: "Whether temperature-controlled transport is needed",
          },
          adr_capable: {
            type: "boolean",
            description: "Whether shipment requires hazardous goods handling",
          },
          special_requirements: {
            type: "string",
            description: "Any special handling requirements",
          },
        },
        required: [
          "origin_city",
          "origin_country",
          "destination_city",
          "destination_country",
          "shipment_type",
          "content_description",
          "weight_kg",
          "service_type",
          "departure_date",
          "arrival_date",
        ],
      },
    },
  },
]

// Tool handlers
export async function handleSearchKnowledge(params: {
  query: string
  source_filter?: string
  top_k?: number
}): Promise<any> {
  const { query, source_filter, top_k = 5 } = params
  
  console.log(`[TOOLS] search_knowledge: "${query}" (source: ${source_filter || "all"}, top_k: ${top_k})`)
  
  try {
    const results = await searchKnowledge(query, source_filter, Math.min(top_k, 10))
    
    if (results.length === 0) {
      return {
        status: "no_results",
        message: "No relevant documents found",
      }
    }
    
    return {
      status: "success",
      results: results.map(r => ({
        text: r.text,
        source: r.metadata.source,
        id: r.metadata.id,
        article_number: r.metadata.article_number,
        code: r.metadata.code,
        category: r.metadata.category,
        similarity: r.similarity.toFixed(3),
      })),
    }
  } catch (error) {
    console.error("[TOOLS] search_knowledge error:", error)
    return {
      status: "error",
      message: `Search failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

export function handleCheckTransportCompatibility(params: {
  mode: string
  incoterm: string
}): any {
  const { mode, incoterm } = params
  
  console.log(`[TOOLS] check_transport_compatibility: ${mode} + ${incoterm}`)
  
  try {
    const result = checkTransportCompatibility(mode, incoterm)
    return {
      status: "success",
      ...result,
      source: "transport_compatibility.yaml",
    }
  } catch (error) {
    console.error("[TOOLS] check_transport_compatibility error:", error)
    return {
      status: "error",
      message: `Compatibility check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

export function handleCompareIncoterms(params: {
  codes: string[]
}): any {
  const { codes } = params
  
  console.log(`[TOOLS] compare_incoterms: ${codes.join(", ")}`)
  
  try {
    const result = compareIncoterms(codes)
    
    if (result.error) {
      return {
        status: "error",
        message: result.error,
      }
    }
    
    return {
      status: "success",
      comparison: result,
      source: "incoterms_comparison.yaml",
    }
  } catch (error) {
    console.error("[TOOLS] compare_incoterms error:", error)
    return {
      status: "error",
      message: `Comparison failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

export async function handleQueryDatabase(params: {
  description: string
  tables?: string[] | string
  filters?: Record<string, string | number>
  limit?: number
}): Promise<any> {
  const { description, tables, filters, limit } = params
  
  // Normalize tables: handle both string and array inputs
  let normalizedTables: string[] = []
  if (typeof tables === "string") {
    normalizedTables = [tables]
  } else if (Array.isArray(tables)) {
    normalizedTables = tables
  }
  
  console.log(`[TOOLS] query_database: "${description}" from tables: ${normalizedTables.join(", ")}`)
  
  const result = await queryDatabase({
    description,
    tables: normalizedTables,
    filters,
    limit: Math.min(limit || 100, 100),
  })
  
  return {
    status: result.status,
    message: result.message || undefined,
    table: result.table,
    row_count: result.row_count,
    data: result.data,
    source: "loghub.db",
  }
}

export async function handleValidateJobRequest(params: {
  origin_city?: string
  origin_country?: string
  destination_city?: string
  destination_country?: string
  shipment_type?: string
  content_description?: string
  weight_kg?: number
  volume_m3?: number
  service_type?: string
  departure_date?: string
  arrival_date?: string
  temperature_controlled?: boolean
  adr_capable?: boolean
  special_requirements?: string
}): Promise<any> {
  console.log(`[TOOLS] validate_job_request: ${params.origin_city} → ${params.destination_city}`)
  
  try {
    const result = await validateJobRequest(params)
    
    return {
      status: result.status,
      valid: result.valid,
      message: result.message,
      missingFields: result.missingFields,
      issues: result.issues,
      available_services: result.available_services,
      estimated_details: result.estimated_details,
    }
  } catch (error) {
    console.error("[TOOLS] validate_job_request error:", error)
    return {
      status: "error",
      valid: false,
      message: `Job validation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}
