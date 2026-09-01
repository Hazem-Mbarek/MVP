# Job Request Validation Feature - Testing Guide

## Overview
This document outlines the complete testing workflow for the job request validation feature. The feature allows external clients to submit shipment details through a form, which the agent validates against availability rules and returns confirmation or error messages.

## Architecture Flow
```
1. Frontend Form (JobRequestForm)
   ↓
2. User submits form with shipment details
   ↓
3. Form converted to natural language message
   ↓
4. ExternalAgentTester sends to /api/chat/external
   ↓
5. ExternalAgentOrchestrator decomposes message
   ↓
6. Recognizes as JOB_REQUEST task type
   ↓
7. Executes job_request task with agent rules
   ↓
8. Agent calls validate_job_request tool
   ↓
9. Tool validates against database
   ↓
10. Returns validation result to agent
    ↓
11. Agent synthesizes customer-friendly response
    ↓
12. Response displayed to user
```

## Test Scenarios

### Test 1: Valid Shipment Request (Happy Path)
**Input:**
- Pickup: Dortmund, Germany
- Delivery: Paris, France
- Service: FTL (Full Truckload)
- Cargo: Palletized retail goods
- Weight: 15000 kg
- Departure: 2026-09-15
- Arrival: 2026-09-17

**Expected Result:**
- ✓ Validation passes
- ✓ Message: "Shipment request validated successfully!"
- ✓ Route: "Dortmund, Germany → Paris, France"
- ✓ Service: "FTL"
- ✓ Estimated transit: 2 days
- ✓ Next steps mentioned

**Verification Checklist:**
- [ ] Form submits without errors
- [ ] Agent receives message
- [ ] Decomposition identifies as job_request task
- [ ] validate_job_request tool is called
- [ ] Database queries for countries succeed
- [ ] Service availability check passes
- [ ] Response contains confirmation message
- [ ] Download button appears in right panel

---

### Test 2: Missing Required Fields
**Input:**
- Pickup: Amsterdam (NO COUNTRY)
- Delivery: Hamburg, Germany
- Service: LTL
- Cargo: Building materials
- Weight: (EMPTY)
- Departure: 2026-09-15
- Arrival: 2026-09-17

**Expected Result:**
- ✗ Validation fails
- ✗ Status: "missing_fields"
- ✗ Message: "Missing required information: origin_country, weight_kg"
- ✗ List of missing fields provided

**Verification Checklist:**
- [ ] Form shows validation errors before submit (frontend)
- [ ] User cannot submit with empty required fields
- [ ] If bypassed, backend returns clear error message

---

### Test 3: Invalid Dates
**Input:**
- Pickup: Bremen, Germany
- Delivery: Brussels, Belgium
- Service: LTL
- Cargo: General freight
- Weight: 8000 kg
- Departure: 2026-08-01 (PAST DATE)
- Arrival: 2026-08-05

**Expected Result:**
- ✗ Validation fails
- ✗ Status: "invalid_dates"
- ✗ Message: "Departure date cannot be in the past"

**Verification Checklist:**
- [ ] Frontend validates date is not in past
- [ ] Arrival date after departure
- [ ] Error message is user-friendly

---

### Test 4: Destination Country Not in Service Area
**Input:**
- Pickup: Berlin, Germany
- Delivery: Warsaw, Poland
- Service: Moving (only available in Germany, France, Belgium, Netherlands)
- Cargo: Furniture
- Weight: 5000 kg
- Departure: 2026-09-20
- Arrival: 2026-09-22

**Expected Result:**
- ✗ Validation fails
- ✗ Status: "unavailable"
- ✗ Message: "Service 'Moving' to Poland is currently unavailable" OR service not available in that region
- ✗ Available services listed

**Verification Checklist:**
- [ ] Database query for destination country succeeds
- [ ] Service availability matrix check fails
- [ ] Error message guides to alternatives or sales

---

### Test 5: Invalid Service Type
**Input:**
- Pickup: Cologne, Germany
- Delivery: Amsterdam, Netherlands
- Service: "UNKNOWN_SERVICE"
- Cargo: General freight
- Weight: 10000 kg
- Departure: 2026-09-18
- Arrival: 2026-09-19

**Expected Result:**
- ✗ Validation fails
- ✗ Status: "unavailable"
- ✗ Message: "Service type 'UNKNOWN_SERVICE' is not available"
- ✗ Available services listed

**Verification Checklist:**
- [ ] Service lookup fails gracefully
- [ ] Agent suggests alternatives
- [ ] User is directed to contact sales

---

### Test 6: Excessive Weight
**Input:**
- Pickup: Leipzig, Germany
- Delivery: Strasbourg, France
- Service: FTL
- Cargo: Industrial machinery
- Weight: 75000 kg (exceeds 50,000 kg limit)
- Departure: 2026-09-25
- Arrival: 2026-09-26

**Expected Result:**
- ✗ Validation fails
- ✗ Status: "invalid_data"
- ✗ Message: "Weight exceeds standard limits (>50,000 kg). Please contact sales for special arrangements."

**Verification Checklist:**
- [ ] Weight validation triggers
- [ ] Escalation path to sales offered

---

### Test 7: Same Origin and Destination
**Input:**
- Pickup: Frankfurt, Germany
- Delivery: Frankfurt, Germany
- Service: LTL
- Cargo: Documents
- Weight: 500 kg
- Departure: 2026-09-16
- Arrival: 2026-09-16

**Expected Result:**
- ✗ Validation fails
- ✗ Status: "invalid_data"
- ✗ Message: "Pickup and delivery locations cannot be the same"

**Verification Checklist:**
- [ ] Origin/destination check catches same city/country

---

### Test 8: Unrealistic Transit Time (>30 days)
**Input:**
- Pickup: Munich, Germany
- Delivery: Barcelona, Spain (NOT in service area, but assume for test)
- Service: Express
- Cargo: Documentation
- Weight: 100 kg
- Departure: 2026-09-01
- Arrival: 2026-11-01 (60 days later)

**Expected Result:**
- ✗ Validation fails
- ✗ Status: "invalid_data"
- ✗ Message: "Transit time appears unusually long (>30 days). Please verify your dates."

**Verification Checklist:**
- [ ] Days calculation correct
- [ ] Warning for unrealistic timelines

---

## Frontend Testing Checklist

- [ ] Form displays all required fields
- [ ] Form validation works before submit:
  - [ ] Required fields enforce input
  - [ ] Date picker prevents past dates
  - [ ] Weight field accepts numbers only
  - [ ] Submit button disabled until valid
- [ ] "New Request" button appears in header
- [ ] Clicking opens form
- [ ] "Back to Chat" button closes form
- [ ] Form clears after successful submit
- [ ] Loading state shows while processing
- [ ] Error messages display inline

---

## Backend Testing Checklist

### Job Validation Service (job-validation.ts)
- [ ] `validateJobRequest()` accepts JobRequestData
- [ ] Required fields validation works
- [ ] Date validation logic correct
- [ ] Weight validation logic correct
- [ ] Database queries succeed
- [ ] Country lookup queries work
- [ ] Service availability queries work
- [ ] ValidationResult structure correct
- [ ] Error messages are user-friendly

### Agent Integration
- [ ] Decomposition prompt routes to job_request
- [ ] Task type recognized in executeTask switch
- [ ] Agent rules applied correctly
- [ ] validate_job_request tool is called
- [ ] Tool receives correct parameters
- [ ] Tool response parsed correctly
- [ ] Synthesis stage creates customer response
- [ ] Response includes confirmation or clear rejection reason

### API Endpoints
- [ ] POST /api/chat/external accepts job request message
- [ ] Client ID extracted correctly
- [ ] Message decomposed to job_request task
- [ ] Response returned successfully
- [ ] Error handling for invalid data
- [ ] Logging shows full request/response flow

---

## Performance Testing

- [ ] Form submission responds in <2 seconds
- [ ] Agent processing completes in <10 seconds
- [ ] Database queries are efficient
- [ ] No N+1 query problems
- [ ] Validation doesn't timeout

---

## Manual Test Script

### Setup
1. Start backend: `cd backend && npm run dev` (or appropriate command)
2. Start frontend: `cd frontend && npm run dev`
3. Open browser to localhost:3000
4. Navigate to agents page
5. Select a client contact (e.g., "Groupe Chartier Distribution SAS")

### Test Execution
1. Click "New Request" button in right panel
2. Fill form with Test 1 data (valid request)
3. Click "Submit Request"
4. Observe:
   - Message appears in chat
   - Loading indicator shows
   - Agent response appears with validation result
   - Download button available for response
5. Repeat with Test 2-8 scenarios

---

## Success Criteria

✓ All 8 test scenarios pass with expected results  
✓ Frontend form validation prevents invalid submissions  
✓ Agent correctly identifies and routes job_request tasks  
✓ validate_job_request tool executes without errors  
✓ Database queries return correct availability data  
✓ Agent response is clear and actionable  
✓ Error messages guide users to next steps  
✓ Performance is acceptable (<10s per request)  
✓ No console errors or warnings (except expected logs)  
✓ All builds pass without TypeScript errors  

---

## Rollback Plan

If critical issues found:
1. Revert job-validation.ts
2. Revert external-agent-orchestrator.ts task type
3. Revert external-agent-rules.ts
4. Revert tools.ts and openrouter.service.ts
5. Revert job-request-form.tsx and external-agent-tester.tsx
6. Rebuild backend and frontend

---

## Known Limitations

1. **Service availability matrix is simplified**: Only covers Germany, France, Belgium, Netherlands, Poland
2. **No real-time vehicle/driver assignment**: Validation only checks if route/service exists, not availability
3. **Pricing not calculated**: Validation only confirms availability, pricing must be done separately
4. **No persistence**: Job requests validated but not saved to database automatically
5. **No email confirmation**: Validated requests don't trigger email to customer

---

## Future Enhancements

1. Add real-time availability checking for specific dates
2. Implement pricing calculation based on weight/distance
3. Persist validated job requests for sales team review
4. Send email confirmation to customer
5. Allow customers to select from multiple transport options
6. Add calendar picker for date selection
7. Support for multiple pickup/delivery locations
8. Integration with shipment tracking
