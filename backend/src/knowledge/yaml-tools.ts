/**
 * YAML tools for deterministic lookups
 */

import fs from "fs"
import path from "path"
import yaml from "js-yaml"

interface TransportCompatibility {
  [incoterm: string]: {
    modes: string[]
    description: string
  }
}

interface IncotermsComparison {
  [code: string]: {
    mode_scope: string
    risk_transfer: string
    transport_responsibility: string
    cost_responsibility: string
    insurance: string
  }
}

let transportCompat: TransportCompatibility = {}
let incotermsComp: IncotermsComparison = {}

export function loadYAMLData() {
  console.log("[YAML-TOOLS] Loading YAML data...")
  
  try {
    const projectRoot = path.resolve(__dirname, "../../../")
    const transportPath = path.join(projectRoot, "data/knowledge/incoterms/transport_compatibility.yaml")
    const compatPath = path.join(projectRoot, "data/knowledge/incoterms/comparison.yaml")
    
    const transportContent = fs.readFileSync(transportPath, "utf-8")
    const compatContent = fs.readFileSync(compatPath, "utf-8")
    
    const transportData = yaml.load(transportContent) as any
    const compatData = yaml.load(compatContent) as any
    
    // Handle nested structure in comparison.yaml
    transportCompat = transportData || {}
    incotermsComp = compatData?.incoterms_comparison || compatData || {}
    
    console.log("[YAML-TOOLS] Loaded transport compatibility and incoterms comparison")
    console.log(`[YAML-TOOLS] Loaded ${Object.keys(incotermsComp).length} incoterms for comparison`)
  } catch (error) {
    console.error("[YAML-TOOLS] Error loading YAML data:", error)
    throw error
  }
}

export function checkTransportCompatibility(
  mode: string,
  incoterm: string
): {
  compatible: boolean
  modes: string[] | null
  message: string
} {
  const normIncoterm = incoterm.toUpperCase()
  const normMode = mode.toLowerCase()
  
  if (!transportCompat[normIncoterm]) {
    return {
      compatible: false,
      modes: null,
      message: `Incoterm ${normIncoterm} not found in compatibility table`,
    }
  }
  
  const { modes, description } = transportCompat[normIncoterm]
  const isCompatible = modes.some(m => m.toLowerCase().includes(normMode))
  
  return {
    compatible: isCompatible,
    modes: modes,
    message: isCompatible
      ? `${normIncoterm} is compatible with ${normMode}. ${description}`
      : `${normIncoterm} is NOT compatible with ${normMode}. Valid modes: ${modes.join(", ")}. ${description}`,
  }
}

export function compareIncoterms(codes: string[]): Record<string, any> {
  const result: Record<string, any> = {}
  
  const normCodes = codes.map(c => c.toUpperCase())
  
  for (const code of normCodes) {
    if (incotermsComp[code]) {
      result[code] = incotermsComp[code]
    }
  }
  
  if (Object.keys(result).length === 0) {
    return {
      error: `No incoterms found for codes: ${codes.join(", ")}`,
    }
  }
  
  return result
}
