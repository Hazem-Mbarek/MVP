/**
 * Job validation service for external clients
 * Validates shipment requests against availability rules:
 * - Route availability (country pairs with active services)
 * - Service availability in destination countries
 * - Required field completeness
 * - Date reasonableness
 * - Weight/volume constraints
 */

import { queryDatabase } from "./database-tools"

export interface JobRequestData {
  origin_city?: string
  origin_country?: string
  destination_city?: string
  destination_country?: string
  shipment_type?: string
  content_description?: string
  weight_kg?: number
  volume_m3?: number
  service_type?: string // e.g., "FTL", "LTL", "Moving"
  departure_date?: string // ISO format
  arrival_date?: string // ISO format
  temperature_controlled?: boolean
  adr_capable?: boolean
  special_requirements?: string
}

export interface ValidationResult {
  valid: boolean
  status: "valid" | "missing_fields" | "unavailable" | "invalid_dates" | "invalid_data"
  message: string
  missingFields?: string[]
  issues?: string[]
  available_services?: string[]
  estimated_details?: {
    route: string
    service: string
    estimated_days?: number
  }
}

// Required fields for a job request
const REQUIRED_FIELDS = [
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
]

/**
 * Validate a job request for completeness, format, and availability
 */
export async function validateJobRequest(data: JobRequestData): Promise<ValidationResult> {
  try {
    console.log("[JOB-VALIDATION] Starting validation for job request")
    console.log("[JOB-VALIDATION] Request data:", JSON.stringify(data, null, 2))

    // STEP 1: Check required fields
    const missingFields = REQUIRED_FIELDS.filter((field) => !data[field as keyof JobRequestData])
    if (missingFields.length > 0) {
      console.log("[JOB-VALIDATION] Missing fields:", missingFields)
      return {
        valid: false,
        status: "missing_fields",
        message: `Missing required information: ${missingFields.join(", ")}. Please provide all details to proceed.`,
        missingFields,
      }
    }

    // STEP 2: Validate dates
    const departureDate = new Date(data.departure_date!)
    const arrivalDate = new Date(data.arrival_date!)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (isNaN(departureDate.getTime()) || isNaN(arrivalDate.getTime())) {
      console.log("[JOB-VALIDATION] Invalid date format")
      return {
        valid: false,
        status: "invalid_dates",
        message: "Invalid date format. Please use YYYY-MM-DD format.",
        issues: ["Dates must be in valid format"],
      }
    }

    if (departureDate < today) {
      console.log("[JOB-VALIDATION] Departure date is in the past")
      return {
        valid: false,
        status: "invalid_dates",
        message: "Departure date cannot be in the past. Please select a future date.",
        issues: ["Departure date must be today or later"],
      }
    }

    if (arrivalDate <= departureDate) {
      console.log("[JOB-VALIDATION] Arrival date not after departure date")
      return {
        valid: false,
        status: "invalid_dates",
        message: "Arrival date must be after departure date.",
        issues: ["Arrival date must be after departure date"],
      }
    }

    const transitDays = Math.ceil(
      (arrivalDate.getTime() - departureDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (transitDays > 30) {
      console.log("[JOB-VALIDATION] Transit time too long (>30 days)")
      return {
        valid: false,
        status: "invalid_data",
        message: "Transit time appears unusually long (>30 days). Please verify your dates.",
        issues: ["Transit time should typically be 1-30 days"],
      }
    }

    console.log("[JOB-VALIDATION] Date validation passed. Transit days:", transitDays)

    // STEP 3: Validate weight
    if (data.weight_kg === undefined || data.weight_kg <= 0) {
      console.log("[JOB-VALIDATION] Invalid weight")
      return {
        valid: false,
        status: "invalid_data",
        message: "Weight must be a positive number in kilograms.",
        issues: ["Weight must be greater than 0"],
      }
    }

    if (data.weight_kg > 50000) {
      console.log("[JOB-VALIDATION] Weight exceeds 50,000 kg")
      return {
        valid: false,
        status: "invalid_data",
        message: "Shipment weight exceeds standard limits (>50,000 kg). Please contact sales for special arrangements.",
        issues: ["Weight exceeds 50,000 kg threshold"],
      }
    }

    console.log("[JOB-VALIDATION] Weight validation passed:", data.weight_kg, "kg")

    // STEP 4: Check origin and destination are different
    if (
      data.origin_city?.toLowerCase() === data.destination_city?.toLowerCase() &&
      data.origin_country?.toLowerCase() === data.destination_country?.toLowerCase()
    ) {
      console.log("[JOB-VALIDATION] Origin and destination are the same")
      return {
        valid: false,
        status: "invalid_data",
        message: "Pickup and delivery locations cannot be the same.",
        issues: ["Origin and destination must be different"],
      }
    }

    // STEP 5: Check country availability
    console.log(
      "[JOB-VALIDATION] Checking country availability for",
      data.origin_country,
      "→",
      data.destination_country
    )

    const originCountryResult = await queryDatabase({
      description: `Find country with name "${data.origin_country}"`,
      tables: ["countries"],
      filters: { country_name: data.origin_country || "" },
      limit: 1,
    })

    const destCountryResult = await queryDatabase({
      description: `Find country with name "${data.destination_country}"`,
      tables: ["countries"],
      filters: { country_name: data.destination_country || "" },
      limit: 1,
    })

    if (!originCountryResult.data || originCountryResult.data.length === 0) {
      console.log("[JOB-VALIDATION] Origin country not found:", data.origin_country)
      return {
        valid: false,
        status: "unavailable",
        message: `Origin country "${data.origin_country}" is not recognized. Please verify the country name.`,
        issues: ["Origin country not in our service network"],
      }
    }

    if (!destCountryResult.data || destCountryResult.data.length === 0) {
      console.log("[JOB-VALIDATION] Destination country not found:", data.destination_country)
      return {
        valid: false,
        status: "unavailable",
        message: `Destination country "${data.destination_country}" is not recognized. Please verify the country name.`,
        issues: ["Destination country not in our service network"],
      }
    }

    const originCountryId = originCountryResult.data[0].country_id
    const destCountryId = destCountryResult.data[0].country_id

    console.log("[JOB-VALIDATION] Countries validated:", originCountryId, destCountryId)

    // STEP 6: Check service availability in destination country
    console.log("[JOB-VALIDATION] Checking service availability in destination:", data.service_type)

    const serviceResult = await queryDatabase({
      description: `Find service with name "${data.service_type}"`,
      tables: ["services"],
      filters: { service_name: data.service_type || "" },
      limit: 1,
    })

    if (!serviceResult.data || serviceResult.data.length === 0) {
      console.log("[JOB-VALIDATION] Service not found:", data.service_type)
      // List available services
      const servicesListResult = await queryDatabase({
        description: "Get all active services",
        tables: ["services"],
        limit: 20,
      })
      const availableServices = servicesListResult.data?.map((s: any) => s.service_name) || []
      return {
        valid: false,
        status: "unavailable",
        message: `Service type "${data.service_type}" is not available. Available services: ${availableServices.join(", ")}`,
        issues: ["Requested service type not found"],
        available_services: availableServices,
      }
    }

    const serviceId = serviceResult.data[0].service_id

    // Check service availability in destination country
    const countryServiceResult = await queryDatabase({
      description: `Check if service is available in destination country`,
      tables: ["country_services"],
      filters: { country_id: destCountryId, service_id: serviceId },
      limit: 1,
    })

    if (!countryServiceResult.data || countryServiceResult.data.length === 0) {
      console.log(`[JOB-VALIDATION] Service not available in destination country ${destCountryId}`)

      // Find what services ARE available
      const availableServicesResult = await queryDatabase({
        description: `Find all services available in destination country ${destCountryId}`,
        tables: ["country_services"],
        filters: { country_id: destCountryId },
        limit: 20,
      })

      const availableServices = availableServicesResult.data?.map((cs: any) => {
        const service = cs.service_name || `Service ${cs.service_id}`
        const status = cs.availability_status || "available"
        return `${service} (${status})`
      }) || ["Contact sales for details"]

      return {
        valid: false,
        status: "unavailable",
        message: `Service "${data.service_type}" is not available in ${data.destination_country}. Available services: ${availableServices.join(", ")}. Please contact our sales team for alternatives.`,
        issues: [`${data.service_type} not available in destination country`],
        available_services: availableServices,
      }
    }

    const availability = countryServiceResult.data[0].availability_status

    if (availability === "unavailable" || availability === "not_available") {
      console.log("[JOB-VALIDATION] Service is marked unavailable")
      return {
        valid: false,
        status: "unavailable",
        message: `Service "${data.service_type}" to ${data.destination_country} is currently unavailable. Please contact our sales team for assistance.`,
        issues: [`Service availability: ${availability}`],
      }
    }

    if (availability === "by_arrangement" || availability === "case_by_case") {
      console.log("[JOB-VALIDATION] Service requires special arrangement")
      return {
        valid: false,
        status: "unavailable",
        message: `Service "${data.service_type}" to ${data.destination_country} requires special arrangement. Please contact our sales team to discuss your specific needs.`,
        issues: [`Service requires: ${availability}`],
      }
    }

    console.log("[JOB-VALIDATION] Service availability validated:", availability)

    // STEP 7: All validations passed!
    console.log("[JOB-VALIDATION] ✓ All validations passed!")

    return {
      valid: true,
      status: "valid",
      message: `✓ Shipment request validated successfully! We can ship your cargo from ${data.origin_city}, ${data.origin_country} to ${data.destination_city}, ${data.destination_country} using ${data.service_type}. Estimated transit: ${transitDays} days. A representative will contact you shortly to confirm pricing and booking details.`,
      estimated_details: {
        route: `${data.origin_city}, ${data.origin_country} → ${data.destination_city}, ${data.destination_country}`,
        service: data.service_type!,
        estimated_days: transitDays,
      },
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("[JOB-VALIDATION] Validation error:", errorMessage)

    return {
      valid: false,
      status: "invalid_data",
      message: `Validation error: ${errorMessage}. Please try again or contact support.`,
      issues: [errorMessage],
    }
  }
}

/**
 * Parse natural language job request into structured data
 * Used by the agent when extracting job info from free-form customer messages
 */
export function parseJobRequest(text: string): Partial<JobRequestData> {
  // This is a placeholder - the agent will extract this data via prompting
  // In a real scenario, you might use NER (Named Entity Recognition) here
  return {}
}
