# Job Request Feature - User & Developer Guide

## What's New

The external agent now supports **job request validation**. Clients can submit shipment details through a form, and the agent will validate availability and return confirmation or error messages.

## For Clients

### How to Submit a Job Request

1. **Select a client contact** from the left sidebar
2. Click **"New Request"** button in the right panel
3. Fill in the shipment details:
   - **Pickup Location**: City and country (e.g., Dortmund, Germany)
   - **Delivery Location**: City and country (e.g., Paris, France)
   - **Shipment Type**: What kind of cargo (Palletized goods, Building materials, etc.)
   - **Content Description**: Details about the shipment
   - **Weight**: Total weight in kilograms
   - **Volume**: Optional, volume in cubic meters
   - **Service Type**: FTL, LTL, Moving, Express, etc.
   - **Departure & Arrival Dates**: When you need pickup and delivery
   - **Special Requirements**: Temperature control, hazmat, etc.
4. Click **"Submit Request"**
5. The agent will validate your request and respond with:
   - ✓ **Confirmation**: "Shipment request validated! Your route is available..."
   - ✗ **Error**: "Service not available in destination country..." + alternatives

### What Gets Validated

- All required fields are provided
- Dates are in the future and arrival is after departure
- Weight is positive and not excessive (>50,000 kg)
- Origin and destination are different
- Pickup country is in our service network
- Delivery country is in our service network
- Requested service is available in the delivery country

### Download Results

- When the agent validates your request, a **"Download PDF"** button appears
- Click to download a statement document with the validation details

---

## For Developers

### Architecture

```
JobRequestForm (frontend)
  ↓ (user fills form + clicks submit)
ExternalAgentTester (frontend)
  ↓ (converts to natural language message)
POST /api/chat/external (backend)
  ↓ (extracts client ID, creates orchestrator)
ExternalAgentOrchestrator.processQuestion()
  ↓ (stage 1: decomposition)
DECOMPOSITION_PROMPT recognizes as job_request
  ↓ (stage 2: task execution)
executeTask() → job_request case
  ↓ (agent receives job_request rules)
Agent calls validate_job_request tool
  ↓ (agent tool calling via OpenRouter)
handleValidateJobRequest() (backend/src/knowledge/tools.ts)
  ↓
validateJobRequest() (backend/src/knowledge/job-validation.ts)
  ↓ (validates data, queries database)
Returns ValidationResult {valid, status, message, ...}
  ↓ (stage 3: synthesis)
Agent synthesizes customer response
  ↓
Final response returned to frontend
  ↓ (displayed as message with Download button)
User sees result
```

### Key Files

1. **Backend**
   - `src/knowledge/job-validation.ts` - Core validation logic
   - `src/knowledge/tools.ts` - Tool schema and handler
   - `src/services/openrouter.service.ts` - Tool invocation integration
   - `src/services/external-agent-orchestrator.ts` - Task type routing
   - `src/services/external-agent-rules.ts` - Agent rules and routing

2. **Frontend**
   - `components/dashboard/job-request-form.tsx` - Form component
   - `components/dashboard/external-agent-tester.tsx` - Integration

### Running Tests Locally

#### Start Services
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

#### Test Scenario 1: Valid Request
1. Navigate to http://localhost:3000/agents/external
2. Select "Groupe Chartier Distribution SAS" (or any client)
3. Click "New Request"
4. Fill form:
   - Pickup: Dortmund, Germany
   - Delivery: Paris, France
   - Service: FTL
   - Cargo: Palletized retail goods
   - Weight: 15000 kg
   - Departure: 2026-09-15
   - Arrival: 2026-09-17
5. Click "Submit Request"
6. **Expected**: Agent responds with "✓ Shipment request validated successfully!"

#### Test Scenario 2: Invalid Country
1. Click "New Request"
2. Fill form:
   - Pickup: Berlin, Germany
   - Delivery: Tokyo, Japan (NOT in service area)
   - Service: FTL
   - Cargo: General freight
   - Weight: 10000 kg
   - Departure: 2026-09-20
   - Arrival: 2026-09-21
3. Click "Submit Request"
4. **Expected**: Agent responds with "Destination country not recognized"

#### Test Scenario 3: Missing Fields
1. Click "New Request"
2. Leave form mostly empty except weight
3. Try to click "Submit Request"
4. **Expected**: Form shows "Please fix errors" with list of missing fields

### How the Validation Works

#### Step 1: Form Submission (Frontend)
```typescript
// JobRequestForm converts data to message:
const message = `I would like to request a shipment quote with the following details:
**Pickup:** ${origin_city}, ${origin_country}
**Delivery:** ${destination_city}, ${destination_country}
...`

// Calls onSubmit(message)
```

#### Step 2: Message Processing (Backend)
```typescript
// ExternalAgentOrchestrator.processQuestion(message)
// Stage 1: Decomposition
// DECOMPOSITION_PROMPT recognizes shipment details → job_request task
// Stage 2: Execution
// Agent rule: "Extract details from message, call validate_job_request tool"
// Agent calls: validate_job_request({
//   origin_city, origin_country, destination_city, ...
// })
```

#### Step 3: Validation (Backend)
```typescript
// validateJobRequest() in job-validation.ts
// 1. Check required fields present
// 2. Validate dates (future, arrival > departure)
// 3. Validate weight (positive, < 50000 kg)
// 4. Query database for origin country
// 5. Query database for destination country
// 6. Query for service by name/code
// 7. Query country_services for availability
// 8. Return ValidationResult { valid, status, message }
```

#### Step 4: Synthesis (Backend)
```typescript
// Agent receives tool result and synthesizes for customer:
// If valid: "✓ Shipment request validated successfully! We can ship from X to Y..."
// If invalid: "✗ Service not available in destination country. Available: LTL, Express..."
```

### Database Queries

The validation makes these queries:

```sql
-- Find origin country
SELECT country_id FROM countries WHERE country_name = ?

-- Find destination country
SELECT country_id FROM countries WHERE country_name = ?

-- Find service by name or code
SELECT service_id FROM services WHERE service_code = ? OR service_name = ?

-- Check service availability in destination
SELECT availability_status FROM country_services 
WHERE country_id = ? AND service_id = ?
```

### Error Handling

1. **Missing Fields** → Frontend validation prevents submit, or backend returns list
2. **Invalid Dates** → Frontend date picker + backend validation
3. **Country Not Found** → User-friendly message, suggestion to check spelling
4. **Service Not Available** → List available alternatives
5. **Database Error** → Graceful error with suggestion to contact support

### Adding New Validation Rules

To add new validation in `job-validation.ts`:

```typescript
// Add new rule in validateJobRequest()
if (someCondition) {
  return {
    valid: false,
    status: "invalid_data",
    message: "User-friendly error message",
    issues: ["Specific issue"],
  }
}
```

To add new service type in form, update `job-request-form.tsx`:

```typescript
const services = ["FTL", "LTL", "Moving", "Express", "Groupage", "NEW_SERVICE"]
```

To add new shipment type in form:

```typescript
const shipmentTypes = [
  "General freight",
  "New Type Here",
  // ...
]
```

### Extending to Support Real Booking

To convert this validation feature into actual booking:

1. **Add booking creation**: When validation passes, insert into jobs table
2. **Send confirmation email**: After creating job, email customer
3. **Assign vehicle/driver**: Query available vehicles for date range
4. **Calculate pricing**: Use pricing_models table
5. **Track shipment**: Return tracking number to customer
6. **Add payment collection**: Integrate payment processor

### Logging

All steps are logged with prefixes:

- `[JOB-VALIDATION]` - Validation service
- `[TOOLS]` - Tool execution
- `[EXTERNAL-ORCHESTRATOR]` - Agent orchestration
- `[EXTERNAL-CHAT]` - HTTP endpoint
- `[DATABASE]` - Database queries

Check server logs in backend terminal to debug.

### Common Issues

**Issue**: Form won't submit
- **Check**: All required fields filled
- **Check**: Dates are valid and not in past
- **Check**: Weight is a positive number

**Issue**: Agent doesn't recognize job request
- **Check**: Message format includes shipment details
- **Check**: Backend logs show "job_request" task type
- **Check**: DECOMPOSITION_PROMPT is being used

**Issue**: Database queries fail
- **Check**: Database file exists at `data/knowledge/company/database/loghub.db`
- **Check**: PRAGMA foreign_keys = ON in database
- **Check**: Country names match exactly (case-sensitive in query)

**Issue**: Service not found
- **Check**: Service name matches exactly (e.g., "FTL" not "ftl")
- **Check**: Service exists in database (query `services` table)
- **Check**: Service is marked `is_active = 1`

**Issue**: Empty agent response
- **Check**: Tool result returned correctly
- **Check**: Synthesis prompt executed
- **Check**: Check backend logs for errors

---

## Testing Checklist

- [ ] Frontend form loads without errors
- [ ] Form validation prevents submit with empty fields
- [ ] "New Request" button visible in right panel
- [ ] Form submits valid request successfully
- [ ] Backend receives and processes message
- [ ] Agent decomposes to job_request task
- [ ] validate_job_request tool is called
- [ ] Tool returns ValidationResult
- [ ] Agent response appears in chat
- [ ] Download PDF button appears
- [ ] Invalid request returns clear error message
- [ ] Error messages guide to alternatives or next steps

---

## Questions?

Refer to:
- Backend logs with `[JOB-VALIDATION]`, `[TOOLS]`, `[EXTERNAL-ORCHESTRATOR]` prefixes
- `TEST_JOB_REQUEST.md` for detailed test scenarios
- Code comments in:
  - `job-validation.ts` - What each validation checks
  - `job-request-form.tsx` - Form logic
  - `external-agent-rules.ts` - Agent rules for job_request task
