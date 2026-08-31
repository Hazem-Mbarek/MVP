"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, CheckCircle, Send } from "lucide-react"

interface JobRequestFormProps {
  selectedContact?: {
    id?: string
    name: string
    company: string
    email: string
    phone: string
    city: string
    country: string
  }
  onSubmit?: (message: string) => void
  isLoading?: boolean
}

export function JobRequestForm({ selectedContact, onSubmit, isLoading }: JobRequestFormProps) {
  const [formData, setFormData] = useState({
    origin_city: "",
    origin_country: "",
    destination_city: "",
    destination_country: "",
    shipment_type: "",
    content_description: "",
    weight_kg: "",
    volume_m3: "",
    service_type: "",
    departure_date: "",
    arrival_date: "",
    temperature_controlled: false,
    adr_capable: false,
    special_requirements: "",
  })

  const [showForm, setShowForm] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const services = [
    "Full Truckload",
    "Less Than Truckload",
    "Groupage",
    "International Moving",
    "Office Relocation",
    "Packing",
    "Temporary Storage",
    "Cross-Docking",
    "Customs & Documentation Assistance",
    "Express Transport",
    "Special Cargo",
    "Shipment Coordination",
    "Domestic Moving",
  ]
  const shipmentTypes = [
    "General freight",
    "Palletized goods",
    "Building materials",
    "Electronics",
    "Food & Beverages",
    "Furniture",
    "Documents",
    "Urgent spare parts",
    "Office relocation",
  ]
  const countries = [
    "Germany",
    "France",
    "Belgium",
    "Netherlands",
    "Poland",
  ]

  const validateForm = (): boolean => {
    const newErrors: string[] = []

    if (!formData.origin_city) newErrors.push("Origin city required")
    if (!formData.origin_country) newErrors.push("Origin country required")
    if (!formData.destination_city) newErrors.push("Destination city required")
    if (!formData.destination_country) newErrors.push("Destination country required")
    if (!formData.shipment_type) newErrors.push("Shipment type required")
    if (!formData.content_description) newErrors.push("Content description required")
    if (!formData.weight_kg || parseFloat(formData.weight_kg) <= 0) newErrors.push("Valid weight required")
    if (!formData.service_type) newErrors.push("Service type required")
    if (!formData.departure_date) newErrors.push("Departure date required")
    if (!formData.arrival_date) newErrors.push("Arrival date required")

    // Validate dates
    if (formData.departure_date && formData.arrival_date) {
      const departure = new Date(formData.departure_date)
      const arrival = new Date(formData.arrival_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (departure < today) newErrors.push("Departure date cannot be in the past")
      if (arrival <= departure) newErrors.push("Arrival date must be after departure date")
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) return

    // Build a structured message with clear job request data
    // The agent will recognize this format and call validate_job_request tool
    const message = `[JOB_REQUEST_SUBMISSION]
origin_city: ${formData.origin_city}
origin_country: ${formData.origin_country}
destination_city: ${formData.destination_city}
destination_country: ${formData.destination_country}
shipment_type: ${formData.shipment_type}
content_description: ${formData.content_description}
weight_kg: ${formData.weight_kg}
${formData.volume_m3 ? `volume_m3: ${formData.volume_m3}` : ""}
service_type: ${formData.service_type}
departure_date: ${formData.departure_date}
arrival_date: ${formData.arrival_date}
${formData.temperature_controlled ? "temperature_controlled: true" : ""}
${formData.adr_capable ? "adr_capable: true" : ""}
${formData.special_requirements ? `special_requirements: ${formData.special_requirements}` : ""}

Please validate this shipment request and let me know if it's available.`

    onSubmit?.(message)
    setShowForm(false)
    setFormData({
      origin_city: "",
      origin_country: "",
      destination_city: "",
      destination_country: "",
      shipment_type: "",
      content_description: "",
      weight_kg: "",
      volume_m3: "",
      service_type: "",
      departure_date: "",
      arrival_date: "",
      temperature_controlled: false,
      adr_capable: false,
      special_requirements: "",
    })
    setErrors([])
  }

  const handleCancel = () => {
    setShowForm(false)
    setErrors([])
  }

  if (!selectedContact) {
    return (
      <Card className="border border-amber-200/50 bg-amber-50/30">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-xs text-amber-700">
            <AlertCircle className="h-4 w-4" />
            <span>Select a client contact to submit a job request</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Request a Shipment</CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Submit your shipment details for availability validation
        </p>
      </CardHeader>
      <CardContent>
        {!showForm ? (
          <Button
            onClick={() => setShowForm(true)}
            disabled={isLoading}
            className="w-full"
            size="sm"
          >
            <Send className="h-3 w-3 mr-1" />
            New Shipment Request
          </Button>
        ) : (
          <div className="space-y-4">
            {/* Origin */}
            <div className="space-y-2">
              <label className="text-xs font-medium">Pickup Location *</label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="City"
                  value={formData.origin_city}
                  onChange={(e) => setFormData({ ...formData, origin_city: e.target.value })}
                  className="text-xs"
                  disabled={isLoading}
                />
                <Select
                  value={formData.origin_country}
                  onValueChange={(value) =>
                    setFormData({ ...formData, origin_country: value })
                  }
                >
                  <SelectTrigger className="text-xs" disabled={isLoading}>
                    <SelectValue placeholder="Country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Destination */}
            <div className="space-y-2">
              <label className="text-xs font-medium">Delivery Location *</label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="City"
                  value={formData.destination_city}
                  onChange={(e) => setFormData({ ...formData, destination_city: e.target.value })}
                  className="text-xs"
                  disabled={isLoading}
                />
                <Select
                  value={formData.destination_country}
                  onValueChange={(value) =>
                    setFormData({ ...formData, destination_country: value })
                  }
                >
                  <SelectTrigger className="text-xs" disabled={isLoading}>
                    <SelectValue placeholder="Country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Cargo Info */}
            <div className="space-y-2">
              <label className="text-xs font-medium">Shipment Type *</label>
              <Select
                value={formData.shipment_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, shipment_type: value })
                }
              >
                <SelectTrigger className="text-xs" disabled={isLoading}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {shipmentTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium">What are you shipping? *</label>
              <Textarea
                placeholder="Describe the cargo contents..."
                value={formData.content_description}
                onChange={(e) =>
                  setFormData({ ...formData, content_description: e.target.value })
                }
                className="text-xs resize-none"
                rows={2}
                disabled={isLoading}
              />
            </div>

            {/* Weight & Volume */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <label className="text-xs font-medium">Weight (kg) *</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.weight_kg}
                  onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                  className="text-xs"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Volume (m³)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.volume_m3}
                  onChange={(e) => setFormData({ ...formData, volume_m3: e.target.value })}
                  className="text-xs"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Service Type */}
            <div className="space-y-2">
              <label className="text-xs font-medium">Service Type *</label>
              <Select
                value={formData.service_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, service_type: value })
                }
              >
                <SelectTrigger className="text-xs" disabled={isLoading}>
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <label className="text-xs font-medium">Departure Date *</label>
                <Input
                  type="date"
                  value={formData.departure_date}
                  onChange={(e) => setFormData({ ...formData, departure_date: e.target.value })}
                  className="text-xs"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Arrival Date *</label>
                <Input
                  type="date"
                  value={formData.arrival_date}
                  onChange={(e) => setFormData({ ...formData, arrival_date: e.target.value })}
                  className="text-xs"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Special Requirements */}
            <div className="space-y-2">
              <label className="text-xs font-medium">Special Requirements</label>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={formData.temperature_controlled}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        temperature_controlled: checked as boolean,
                      })
                    }
                    disabled={isLoading}
                  />
                  <span className="text-xs">Temperature-controlled transport</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={formData.adr_capable}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        adr_capable: checked as boolean,
                      })
                    }
                    disabled={isLoading}
                  />
                  <span className="text-xs">Hazardous goods (ADR)</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium">Additional Notes</label>
              <Textarea
                placeholder="Any other requirements or notes..."
                value={formData.special_requirements}
                onChange={(e) =>
                  setFormData({ ...formData, special_requirements: e.target.value })
                }
                className="text-xs resize-none"
                rows={2}
                disabled={isLoading}
              />
            </div>

            {/* Errors */}
            {errors.length > 0 && (
              <div className="bg-red-50/50 border border-red-200/50 rounded p-2">
                <p className="text-xs font-medium text-red-700 mb-1">Please fix errors:</p>
                <ul className="text-xs text-red-600 space-y-0.5">
                  {errors.map((error, i) => (
                    <li key={i}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1"
                size="sm"
              >
                <Send className="h-3 w-3 mr-1" />
                Submit Request
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                disabled={isLoading}
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
