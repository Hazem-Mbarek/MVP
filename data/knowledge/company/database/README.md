# LogHub Database Documentation

## Overview

The LogHub database is a SQLite-based relational database that stores comprehensive organizational and operational data for **NordRoute Logistics GmbH**, a European logistics and moving services company.

**Database File:** `loghub.db`  
**Engine:** SQLite 3  
**Status:** ✅ Fully seeded with sample data

---

## Database Schema

### Entity Relationship Diagram (Conceptual)

```
┌─────────────────┐
│    COMPANY      │ (1) ─────────────┬──────────────┬──────────────┐
├─────────────────┤                  │              │              │
│ company_id (PK) │                  │              │              │
│ legal_name      │                  │              │              │
│ trading_name    │                  │              │              │
│ founded_year    │                  │              │              │
│ headquarters    │                  │              │              │
└─────────────────┘                  │              │              │
         │                            │              │              │
         │ (1:N)                      │              │              │
         ├──────────────────────────┐ │              │              │
         │                          │ │              │              │
    ┌────────────────┐    ┌────────────────────┐    │              │
    │  DEPARTMENTS   │    │    WAREHOUSES      │    │              │
    ├────────────────┤    ├────────────────────┤    │              │
    │ department_id  │    │ warehouse_id (PK)  │    │              │
    │ company_id (FK)│    │ company_id (FK) ───┼────┘              │
    │ name           │    │ warehouse_code     │                   │
    └────────────────┘    │ city, country      │                   │
         │                │ pallet_capacity    │                   │
         │ (1:N)          │ loading_docks      │                   │
         │                └────────────────────┘                   │
    ┌────────────────┐            │                               │
    │  EMPLOYEES     │            │ (1:N)                         │
    ├────────────────┤            │                               │
    │ employee_id    │     ┌──────────────────────┐               │
    │ department_id  │     │ WAREHOUSE_CAPABILITIES│               │
    │ manager_id (FK)│     ├──────────────────────┤               │
    │ job_title      │     │ warehouse_id (FK)    │               │
    │ can_approve_*  │     │ capability_code      │               │
    └────────────────┘     │ availability_status  │               │
         │                 └──────────────────────┘               │
         │ (1:N)                                                   │
         │                 ┌──────────────────────┐               │
         │                 │     VEHICLES         │               │
         │                 ├──────────────────────┤               │
         │        ┌────────│ vehicle_id (PK)      │               │
         │        │        │ company_id (FK) ─────┼───────────────┘
         │        │        │ vehicle_code         │
         │        │        │ vehicle_type, payload│
         │        │        └──────────────────────┘
         │        │
         │        │ (1:N - driver)
         │        │
    ┌────────────────────────┐
    │   COMMERCIAL: JOBS     │
    ├────────────────────────┤
    │ job_id (PK)            │
    │ client_id (FK) ───────┐│
    │ service_id (FK)  ─┐   ││
    │ vehicle_id (FK) ──┤   ││
    │ driver_id (FK) ───┤   ││
    │ pricing_model_id  │   ││
    │ status, dates     │   ││
    └────────────────────────┘
         │                   
         │ (1:N)            
         │                   
    ┌────────────────────────┐
    │  COMMERCIAL: ISSUES    │
    ├────────────────────────┤
    │ issue_id (PK)          │
    │ job_id (FK) ───────────┤
    │ client_id (FK) ────────┤
    │ responsible_id (FK)    │
    │ issue_type, severity   │
    │ cost, compensation     │
    └────────────────────────┘

    ┌──────────────┐
    │   CLIENTS    │ (1:N)
    ├──────────────┤ ──────→ JOBS
    │ client_id    │ ──────→ ISSUES
    │ client_code  │
    │ company_name │
    │ contact_*    │
    │ status       │
    └──────────────┘

    ┌──────────────────────┐
    │  PRICING_MODELS      │ (1:N)
    ├──────────────────────┤ ──────→ JOBS
    │ pricing_model_id     │
    │ name                 │
    │ pricing_method       │
    │ currency             │
    └──────────────────────┘

┌──────────────┐         ┌──────────────────┐
│  COUNTRIES   │ (1:N)   │  COUNTRY_SERVICES│
├──────────────┤ ────┬─→ ├──────────────────┤
│ country_id   │     │   │ country_id (FK)  │
│ country_code │     │   │ service_id (FK)  │
│ country_name │     │   │ availability_*   │
└──────────────┘     │   └──────────────────┘
                     │
                     │   ┌──────────────┐
                     └─→ │   SERVICES   │ (1:N)
                         ├──────────────┤ ──────→ JOBS
                         │ service_id   │
                         │ service_code │
                         │ service_name │
                         └──────────────┘
```

**Legend:**
- `(1:N)` = One-to-Many relationship
- `(FK)` = Foreign Key reference
- Arrow `→` indicates direction of relationship

---

## Tables

### 1. **COMPANY**
Stores organization-level information for NordRoute Logistics GmbH.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `company_id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique company identifier |
| `legal_name` | VARCHAR(200) | NOT NULL | Official registered company name |
| `trading_name` | VARCHAR(200) | | Business trading name |
| `legal_form` | VARCHAR(100) | | Corporate legal structure (GmbH, etc.) |
| `founded_year` | INTEGER | | Year company was founded |
| `headquarters_city` | VARCHAR(100) | | City of headquarters |
| `headquarters_country` | VARCHAR(100) | | Country of headquarters |
| `employee_count` | INTEGER | | Total employee headcount |
| `primary_currency` | CHAR(3) | DEFAULT 'EUR' | Primary operating currency |
| `timezone` | VARCHAR(100) | | Company timezone (CET/CEST) |

**Sample Data:** 1 record  
**NordRoute GmbH** - Founded 2017, Dortmund, Germany, 44 employees

---

### 2. **DEPARTMENTS**
Organizational structure and departmental groupings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `department_id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique department identifier |
| `company_id` | INTEGER | FOREIGN KEY → company | Parent company reference |
| `name` | VARCHAR(100) | NOT NULL | Department name |
| `description` | TEXT | | Department function/scope |
| `employee_count` | INTEGER | | Number of employees in department |
| | | UNIQUE(company_id, name) | One department name per company |

**Sample Data:** 8 departments
- Management (2)
- Sales & Business Development (5)
- Customer Service (5)
- Operations & Dispatch (9)
- Customs & Documentation (5)
- Warehouse (8)
- Drivers (8)
- Finance & Administration (2)

---

### 3. **EMPLOYEES**
Comprehensive employee records with hierarchical management structure.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `employee_id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique employee identifier |
| `company_id` | INTEGER | FOREIGN KEY → company | Parent company |
| `department_id` | INTEGER | FOREIGN KEY → departments | Assigned department |
| `employee_code` | VARCHAR(20) | UNIQUE, NOT NULL | Employee personnel code (NR-EMP-001) |
| `first_name` | VARCHAR(100) | NOT NULL | Employee first name |
| `last_name` | VARCHAR(100) | NOT NULL | Employee last name |
| `job_title` | VARCHAR(150) | NOT NULL | Job position/title |
| `email` | VARCHAR(200) | | Corporate email address |
| `phone` | VARCHAR(50) | | Work phone number |
| `employment_status` | VARCHAR(30) | DEFAULT 'active' | Employment status (active/inactive) |
| `manager_id` | INTEGER | FOREIGN KEY → employees | Direct manager (self-referential) |
| `hire_date` | DATE | | Date employee was hired |
| `can_approve_discounts` | BOOLEAN | DEFAULT 0 | Approval permission for discounts |
| `can_approve_claims` | BOOLEAN | DEFAULT 0 | Approval permission for claims |
| `can_approve_shipments` | BOOLEAN | DEFAULT 0 | Approval permission for shipments |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |

**Sample Data:** 44 employees  
**Key Features:**
- Self-referential manager hierarchy (manager_id points to other employees)
- Role-based approval permissions
- Realistic organizational structure with reporting lines

---

### 4. **COUNTRIES**
Geographic markets and service territories.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `country_id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique country identifier |
| `country_code` | CHAR(2) | UNIQUE, NOT NULL | ISO 3166-1 country code |
| `country_name` | VARCHAR(100) | NOT NULL | Country name |
| `is_home_market` | BOOLEAN | DEFAULT 0 | Flag: home market (Germany) |
| `is_active_market` | BOOLEAN | DEFAULT 1 | Flag: currently active market |

**Sample Data:** 5 countries
- Germany (DE) - Home market ✓
- France (FR)
- Belgium (BE)
- Netherlands (NL)
- Poland (PL)

---

### 5. **SERVICES**
Logistics and moving services offered by NordRoute.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `service_id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique service identifier |
| `service_code` | VARCHAR(50) | UNIQUE, NOT NULL | Service code (FTL, LTL, etc.) |
| `service_name` | VARCHAR(150) | NOT NULL | Service display name |
| `description` | TEXT | | Detailed service description |
| `is_active` | BOOLEAN | DEFAULT 1 | Flag: service currently offered |

**Sample Data:** 13 services
- Full Truckload (FTL)
- Less Than Truckload (LTL)
- Groupage
- International Moving
- Office Relocation
- Packing
- Temporary Storage
- Cross-Docking
- Customs & Documentation Assistance
- Express Transport
- Special Cargo
- Shipment Coordination
- Domestic Moving

---

### 6. **COUNTRY_SERVICES**
Service availability matrix by country.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `country_service_id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique record identifier |
| `country_id` | INTEGER | FOREIGN KEY → countries | Service country |
| `service_id` | INTEGER | FOREIGN KEY → services | Offered service |
| `availability_status` | VARCHAR(30) | NOT NULL | Availability level |
| `notes` | TEXT | | Additional availability details |
| | | UNIQUE(country_id, service_id) | One availability per country/service pair |

**Availability Status Values:**
- `standard` - Regularly offered service
- `available` - Available on request
- `by_arrangement` - Requires prior arrangement
- `limited` - Capacity or geographic limitations
- `case_by_case` - Individual assessment required

**Sample Data:** 56 records spanning all country/service combinations

---

### 7. **WAREHOUSES**
Storage and handling facilities managed by NordRoute.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `warehouse_id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique warehouse identifier |
| `company_id` | INTEGER | FOREIGN KEY → company | Operating company |
| `warehouse_code` | VARCHAR(20) | UNIQUE, NOT NULL | Warehouse code (NR-WH-01) |
| `name` | VARCHAR(150) | NOT NULL | Facility name |
| `facility_role` | VARCHAR(100) | | Facility purpose/role |
| `city` | VARCHAR(100) | NOT NULL | City location |
| `region` | VARCHAR(100) | | State/region |
| `country` | VARCHAR(100) | NOT NULL | Country |
| `area_sqm` | INTEGER | | Total facility area in m² |
| `pallet_capacity` | INTEGER | | Maximum pallet storage capacity |
| `loading_docks` | INTEGER | | Number of loading dock doors |
| `forklift_count` | INTEGER | | Number of forklifts available |
| `temperature_controlled` | BOOLEAN | DEFAULT 0 | Flag: temperature-controlled environment |
| `hazardous_goods_storage` | BOOLEAN | DEFAULT 0 | Flag: ADR hazardous goods certified |
| `cross_docking` | BOOLEAN | DEFAULT 0 | Flag: cross-docking capability |
| `short_term_storage` | BOOLEAN | DEFAULT 0 | Flag: short-term storage available |
| `medium_term_storage` | BOOLEAN | DEFAULT 0 | Flag: medium-term storage available |
| `cctv` | BOOLEAN | DEFAULT 0 | Flag: CCTV security installed |
| `operating_hours` | TEXT | | Operating hours schedule |
| `is_active` | BOOLEAN | DEFAULT 1 | Flag: facility currently operational |

**Sample Data:** 2 warehouses
1. **Dortmund Main Warehouse** (NR-WH-01)
   - 2,200 m², 1,100 pallet capacity
   - 5 loading docks, 3 forklifts
   - Cross-docking, short & medium-term storage

2. **Leipzig Satellite Warehouse** (NR-WH-02)
   - 750 m², 300 pallet capacity
   - 2 loading docks, 1 forklift
   - Eastern Germany operations support

---

### 8. **WAREHOUSE_CAPABILITIES**
Detailed capabilities and limitations of each warehouse.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `warehouse_capability_id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique record identifier |
| `warehouse_id` | INTEGER | FOREIGN KEY → warehouses | Associated warehouse |
| `capability_code` | VARCHAR(100) | NOT NULL | Capability identifier |
| `capability_name` | VARCHAR(150) | NOT NULL | Human-readable capability name |
| `availability_status` | VARCHAR(30) | DEFAULT 'available' | Capability status |
| `notes` | TEXT | | Capability-specific notes/limitations |
| | | UNIQUE(warehouse_id, capability_code) | One capability per warehouse |

**Capability Examples:**
- Pallet Storage
- Short/Medium-Term Storage
- Cross-Docking
- Receiving/Dispatch
- Loading/Unloading
- Shipment Preparation
- Standard Pallet Handling
- Temperature-Controlled (unavailable in current facilities)
- Hazardous-Goods Storage (unavailable in current facilities)

**Sample Data:** 30 capability records documenting detailed warehouse features

---

### 9. **VEHICLES**
Fleet inventory and vehicle specifications.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `vehicle_id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique vehicle identifier |
| `company_id` | INTEGER | FOREIGN KEY → company | Operating company |
| `vehicle_code` | VARCHAR(30) | UNIQUE, NOT NULL | Vehicle registration/code |
| `vehicle_type` | VARCHAR(100) | NOT NULL | Vehicle type (Curtain-side, Box, etc.) |
| `registration_country` | CHAR(2) | | Vehicle registration country |
| `payload_kg` | INTEGER | | Maximum payload in kilograms |
| `volume_m3` | DECIMAL(10,2) | | Cargo volume capacity in m³ |
| `pallet_capacity` | INTEGER | | Standard Euro pallets capacity |
| `has_tail_lift` | BOOLEAN | DEFAULT 0 | Flag: tail lift equipped |
| `has_gps` | BOOLEAN | DEFAULT 1 | Flag: GPS tracking installed |
| `side_loading` | BOOLEAN | DEFAULT 0 | Flag: side-loading capability |
| `rear_loading` | BOOLEAN | DEFAULT 1 | Flag: rear-loading capability |
| `temperature_controlled` | BOOLEAN | DEFAULT 0 | Flag: refrigerated unit |
| `adr_capable` | BOOLEAN | DEFAULT 0 | Flag: ADR hazardous goods certified |
| `current_status` | VARCHAR(50) | DEFAULT 'available' | Operational status |
| `current_location` | VARCHAR(150) | | Current location (operational data) |
| `notes` | TEXT | | Vehicle-specific notes |

**Vehicle Status Values:**
- `available` - Ready for service
- `in_service` - Currently in operation
- `maintenance` - Undergoing maintenance

**Sample Data:** 8 vehicles
- 5 × Curtain-side tractor/trailer combinations (24t, 33 pallets)
- 2 × Box trucks (one with tail lift)
- 1 × Dedicated moving truck

---

## COMMERCIAL TABLES (Operations & Billing)

### 10. **CLIENTS**
Customer/client records for logistics services.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `client_id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique client identifier |
| `client_code` | VARCHAR(30) | UNIQUE, NOT NULL | Client business code |
| `company_name` | VARCHAR(200) | NOT NULL | Official company name |
| `contact_name` | VARCHAR(200) | | Primary contact person |
| `email` | VARCHAR(200) | | Contact email address |
| `phone` | VARCHAR(50) | | Contact phone number |
| `country` | VARCHAR(100) | | Client country |
| `city` | VARCHAR(100) | | Client city |
| `client_type` | VARCHAR(50) | | Type: corporate, SME, individual |
| `status` | VARCHAR(30) | DEFAULT 'active' | Client status: active, inactive, suspended |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |
| `notes` | TEXT | | Additional client information |

**Purpose:** Stores all customers using NordRoute logistics services.

---

### 11. **PRICING_MODELS**
Pricing structures and billing methodologies.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `pricing_model_id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique pricing model identifier |
| `name` | VARCHAR(100) | UNIQUE, NOT NULL | Model name (e.g., "FTL Standard", "LTL Weight-based") |
| `description` | TEXT | | Model description and rules |
| `pricing_method` | VARCHAR(50) | NOT NULL | Method: flat_rate, weight_based, volume_based, pallets, distance, mixed |
| `currency` | CHAR(3) | DEFAULT 'EUR' | Billing currency (ISO 4217) |
| `is_active` | BOOLEAN | DEFAULT 1 | Flag: currently available for use |

**Purpose:** Defines how shipments are priced (billing logic templates).

**Example Models:**
- FTL Standard (flat rate per truck)
- LTL Weight-based (per kg with minimums)
- LTL Volume-based (per m³)
- Pallet-based Groupage (per pallet)
- Distance-based (per km traveled)

---

### 12. **JOBS**
Individual shipment/transport jobs with complete operational details.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `job_id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique job identifier |
| `client_id` | INTEGER | FOREIGN KEY → clients | Booking client |
| `service_id` | INTEGER | FOREIGN KEY → services | Service type (FTL, LTL, Moving, etc.) |
| `job_code` | VARCHAR(30) | UNIQUE, NOT NULL | Job reference code |
| `shipment_type` | VARCHAR(100) | | Cargo type (General, Palletized, Moving, etc.) |
| `content_description` | TEXT | | What is being transported |
| `weight_kg` | DECIMAL(10,2) | | Total shipment weight in kg |
| `origin_city` | VARCHAR(100) | | Pickup city |
| `origin_country` | VARCHAR(100) | | Pickup country |
| `destination_city` | VARCHAR(100) | | Delivery city |
| `destination_country` | VARCHAR(100) | | Delivery country |
| `departure_date` | DATE | | Scheduled departure date |
| `arrival_date` | DATE | | Scheduled arrival date |
| `return_to_warehouse_date` | DATE | | Return date (for moving jobs) |
| `vehicle_id` | INTEGER | FOREIGN KEY → vehicles | Assigned vehicle |
| `driver_employee_id` | INTEGER | FOREIGN KEY → employees | Assigned driver |
| `pricing_model_id` | INTEGER | FOREIGN KEY → pricing_models | Applied pricing structure |
| `price` | DECIMAL(12,2) | | Final charge amount |
| `currency` | CHAR(3) | DEFAULT 'EUR' | Transaction currency |
| `voyage_length_km` | DECIMAL(10,2) | | Distance in kilometers |
| `status` | VARCHAR(50) | DEFAULT 'planned' | Job status: planned, in_transit, delivered, completed, cancelled |
| `notes` | TEXT | | Job-specific notes/instructions |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Job creation timestamp |

**Status Workflow:**
- `planned` → `in_transit` → `delivered` → `completed`
- Any stage can transition to `cancelled`

**Purpose:** Core operational data linking clients to service execution.

---

### 13. **ISSUES**
Problems, incidents, and claims related to jobs.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `issue_id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique issue identifier |
| `job_id` | INTEGER | FOREIGN KEY → jobs | Related job/shipment |
| `client_id` | INTEGER | FOREIGN KEY → clients | Affected client |
| `issue_type` | VARCHAR(50) | NOT NULL | Type: delay, damage, loss, documentation, other |
| `severity` | VARCHAR(30) | DEFAULT 'medium' | Level: low, medium, high, critical |
| `status` | VARCHAR(30) | DEFAULT 'open' | Status: open, under_investigation, resolved, closed |
| `reported_date` | DATE | DEFAULT CURRENT_DATE | When issue was reported |
| `description` | TEXT | | Issue details and circumstances |
| `responsible_employee_id` | INTEGER | FOREIGN KEY → employees | Assigned handler/investigator |
| `company_decision` | TEXT | | NordRoute's decision on liability/outcome |
| `resolution` | TEXT | | How the issue was resolved |
| `resolved_date` | DATE | | Date when issue was resolved |
| `cost` | DECIMAL(12,2) | DEFAULT 0 | Total cost to company |
| `client_compensation` | DECIMAL(12,2) | DEFAULT 0 | Amount paid to client |
| `notes` | TEXT | | Additional details and follow-up info |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |

**Issue Types:**
- `delay` - Late delivery
- `damage` - Cargo damaged in transit
- `loss` - Cargo missing/lost
- `documentation` - Documentation errors or issues
- `other` - Other operational problems

**Severity Levels:**
- `low` - Minor issue, resolved easily
- `medium` - Standard issue requiring investigation
- `high` - Significant issue with client impact
- `critical` - Major incident, escalated handling

**Purpose:** Tracks all service failures and customer complaints for quality assurance and liability management.

---

## Data Relationships & Integrity

### Complete Foreign Key Relationships

#### Operational/Organizational Structure
1. **DEPARTMENTS → COMPANY** (1:N)
   - Each department belongs to exactly one company
   - Enforces organizational hierarchy

2. **EMPLOYEES → COMPANY** (1:N)
   - All employees employed by the company
   - Links workforce to organization

3. **EMPLOYEES → DEPARTMENTS** (1:N)
   - Each employee assigned to one department
   - Organizes employees by function

4. **EMPLOYEES → EMPLOYEES** (1:N, Self-Referential)
   - `manager_id` references other employees
   - Enables organizational reporting structure
   - Allows NULL for top-level management

#### Assets (Fleet & Facilities)
5. **WAREHOUSES → COMPANY** (1:N)
   - Company owns/operates multiple warehouses
   - Central hub for inventory management

6. **WAREHOUSE_CAPABILITIES → WAREHOUSES** (1:N)
   - Each warehouse has multiple capabilities
   - Documents facility features/limitations

7. **VEHICLES → COMPANY** (1:N)
   - Company owns and operates vehicle fleet
   - Tracks asset inventory and specifications

#### Geographic/Service Structure
8. **COUNTRY_SERVICES → COUNTRIES** (N:1)
   - Service availability mapped to countries
   - Cross-references service offerings by region

9. **COUNTRY_SERVICES → SERVICES** (N:1)
   - Links services to geographic availability
   - Supports multi-country service matrix

#### Commercial Operations (NEW)
10. **JOBS → CLIENTS** (N:1)
    - Each job/shipment belongs to one client
    - Links revenue to customer accounts

11. **JOBS → SERVICES** (N:1)
    - Job uses one service type (FTL, LTL, Moving, etc.)
    - Tracks service utilization

12. **JOBS → VEHICLES** (N:1)
    - Job assigned to one vehicle (nullable if planned only)
    - Tracks vehicle utilization and scheduling

13. **JOBS → EMPLOYEES** (N:1, via driver_employee_id)
    - Job assigned to one driver (nullable if planned only)
    - Tracks driver assignments and workload

14. **JOBS → PRICING_MODELS** (N:1)
    - Job uses one pricing structure
    - Applies billing methodology

15. **ISSUES → JOBS** (N:1)
    - Each issue relates to one job
    - Tracks problems per shipment

16. **ISSUES → CLIENTS** (N:1)
    - Each issue involves one client
    - Manages customer complaints

17. **ISSUES → EMPLOYEES** (N:1, via responsible_employee_id)
    - Issue assigned to one employee handler
    - Routes responsibility for resolution

### Unique Constraints

| Table | Constraint | Purpose |
|-------|-----------|---------|
| `employees` | `employee_code` | Unique personnel identifier |
| `warehouses` | `warehouse_code` | Unique facility identifier |
| `vehicles` | `vehicle_code` | Unique registration/vehicle identifier |
| `countries` | `country_code` | Unique ISO country codes |
| `services` | `service_code` | Unique service identifiers |
| `clients` | `client_code` | Unique customer business code |
| `pricing_models` | `name` | Unique pricing model names |
| `jobs` | `job_code` | Unique shipment reference code |
| `departments` | `(company_id, name)` | Department names unique per company |
| `country_services` | `(country_id, service_id)` | One availability record per country/service pair |
| `warehouse_capabilities` | `(warehouse_id, capability_code)` | One capability per warehouse |

### Referential Integrity

All foreign key constraints use implicit deletion rules:
- **No cascading deletes** - Prevents accidental data loss
- **Restrict updates** - Maintains referential consistency
- **Validate on INSERT** - Ensures only valid references exist

**Enable foreign keys before operations:**
```sql
PRAGMA foreign_keys = ON;
```

### Data Relationships by Domain

#### Organizational Operations
```
COMPANY
  ├── DEPARTMENTS
  │    └── EMPLOYEES (with self-referential managers)
  ├── WAREHOUSES
  │    └── WAREHOUSE_CAPABILITIES
  └── VEHICLES
```

#### Service Offerings
```
SERVICES
  └── COUNTRY_SERVICES
       └── COUNTRIES
```

#### Commercial Transactions
```
CLIENTS
  ├── JOBS
  │    ├── SERVICES (what was transported)
  │    ├── VEHICLES (which vehicle)
  │    ├── EMPLOYEES (which driver)
  │    └── PRICING_MODELS (how it was priced)
  └── ISSUES
       ├── JOBS (problem with which shipment)
       ├── EMPLOYEES (who is handling it)
       └── [compensation/cost tracking]
```

---

## Sample Data Highlights

### Organizational Structure
- **Total Employees:** 44
- **Departments:** 8
- **Management Chain:** 3 levels (Director → Manager → Specialist)
- **Approval Permissions:** Distributed across management hierarchy

### Geographic Coverage
- **Home Market:** Germany (Dortmund)
- **Operating Markets:** 5 countries (Germany, France, Belgium, Netherlands, Poland)
- **Service Availability:** Varies by country (standard, limited, by arrangement)

### Operational Assets
- **Warehouses:** 2 (1 main, 1 satellite)
- **Total Capacity:** 1,400 pallets
- **Vehicles:** 8 (specialized fleet for moving and logistics)
- **Equipment:** 4 forklifts, 7 loading docks

### Service Portfolio
- **13 Services** offered across all markets
- **56 Country/Service Combinations** with defined availability
- **Specialization:** Moving services + standard logistics

### Commercial Data (Ready for Seeding)

The following commercial tables are available but require seed data:

**CLIENTS Table:**
- Stores customer/client information
- Ready for customer database population
- Supports client_type classification (corporate, SME, individual)
- Status tracking (active, inactive, suspended)

**PRICING_MODELS Table:**
- Defines billing methodologies
- Supports multiple pricing methods: flat_rate, weight_based, volume_based, pallets, distance, mixed
- Multi-currency support

**JOBS Table:**
- Core operational records linking clients to service execution
- Tracks complete job lifecycle from planning to completion
- Links to vehicles, drivers, pricing models, and services
- Status workflow: planned → in_transit → delivered → completed

**ISSUES Table:**
- Problem/incident tracking system
- Issue types: delay, damage, loss, documentation, other
- Severity levels: low, medium, high, critical
- Financial tracking (cost to company, client compensation)

**Structure Note:** Tables created via `create_com.sql` all use proper foreign keys referencing existing operational tables, maintaining referential integrity.

---

## Accessing the Database

### Python
```python
import sqlite3

conn = sqlite3.connect('data/knowledge/company/database/loghub.db')
cursor = conn.cursor()

# Enable foreign keys
cursor.execute('PRAGMA foreign_keys = ON')

# Example query: Get all active employees with their managers
query = '''
SELECT 
  e.first_name, e.last_name, e.job_title,
  d.name as department,
  m.first_name as manager_first, m.last_name as manager_last
FROM employees e
LEFT JOIN departments d ON e.department_id = d.department_id
LEFT JOIN employees m ON e.manager_id = m.employee_id
WHERE e.employment_status = 'active'
ORDER BY e.employee_id
'''

cursor.execute(query)
for row in cursor.fetchall():
    print(row)

conn.close()
```

### Node.js (better-sqlite3)
```javascript
const Database = require('better-sqlite3');
const db = new Database('data/knowledge/company/database/loghub.db');

db.pragma('foreign_keys = ON');

const stmt = db.prepare(`
  SELECT company_id, legal_name, employee_count, headquarters_city 
  FROM company
`);

const result = stmt.all();
console.log(result);
```

---

## Query Examples

### Organizational Queries

#### Find all employees in a specific department
```sql
SELECT e.employee_code, e.first_name, e.last_name, e.job_title
FROM employees e
JOIN departments d ON e.department_id = d.department_id
WHERE d.name = 'Operations & Dispatch'
ORDER BY e.employee_id;
```

#### Organizational hierarchy tree
```sql
WITH RECURSIVE org_tree AS (
  SELECT employee_id, first_name, last_name, manager_id, 0 as level
  FROM employees
  WHERE manager_id IS NULL
  
  UNION ALL
  
  SELECT e.employee_id, e.first_name, e.last_name, e.manager_id, ot.level + 1
  FROM employees e
  JOIN org_tree ot ON e.manager_id = ot.employee_id
)
SELECT 
  REPEAT('  ', level) || first_name || ' ' || last_name as name,
  level
FROM org_tree
ORDER BY level, employee_id;
```

### Facility Queries

#### Get warehouse capabilities and availability
```sql
SELECT w.name, wc.capability_name, wc.availability_status, wc.notes
FROM warehouses w
LEFT JOIN warehouse_capabilities wc ON w.warehouse_id = wc.warehouse_id
WHERE w.is_active = 1
ORDER BY w.warehouse_id, wc.capability_name;
```

### Service Queries

#### Check service availability in specific countries
```sql
SELECT c.country_name, s.service_name, cs.availability_status
FROM country_services cs
JOIN countries c ON cs.country_id = c.country_id
JOIN services s ON cs.service_id = s.service_id
WHERE c.country_code IN ('DE', 'FR')
ORDER BY c.country_name, s.service_name;
```

### Commercial/Operations Queries (NEW)

#### Get all active jobs for a specific client
```sql
SELECT 
  j.job_code,
  j.shipment_type,
  j.weight_kg,
  CONCAT(j.origin_city, ', ', j.origin_country) as origin,
  CONCAT(j.destination_city, ', ', j.destination_country) as destination,
  j.departure_date,
  j.status,
  j.price,
  j.currency
FROM jobs j
JOIN clients c ON j.client_id = c.client_id
WHERE c.client_code = 'CLIENT_001'
  AND j.status != 'cancelled'
ORDER BY j.departure_date DESC;
```

#### List all pending jobs with assigned vehicles and drivers
```sql
SELECT 
  j.job_code,
  c.company_name as client,
  s.service_name as service,
  CONCAT(e.first_name, ' ', e.last_name) as driver_name,
  v.vehicle_code as vehicle,
  j.status,
  j.departure_date
FROM jobs j
JOIN clients c ON j.client_id = c.client_id
JOIN services s ON j.service_id = s.service_id
LEFT JOIN employees e ON j.driver_employee_id = e.employee_id
LEFT JOIN vehicles v ON j.vehicle_id = v.vehicle_id
WHERE j.status IN ('planned', 'in_transit')
ORDER BY j.departure_date;
```

#### Pricing analysis by service type
```sql
SELECT 
  s.service_name,
  COUNT(j.job_id) as total_jobs,
  AVG(j.price) as avg_price,
  SUM(j.price) as total_revenue,
  j.currency
FROM jobs j
JOIN services s ON j.service_id = s.service_id
GROUP BY s.service_name, j.currency
ORDER BY total_revenue DESC;
```

#### Issues by client with resolution status
```sql
SELECT 
  c.company_name as client,
  COUNT(i.issue_id) as total_issues,
  SUM(CASE WHEN i.status = 'open' THEN 1 ELSE 0 END) as open_issues,
  SUM(i.cost) as total_cost,
  SUM(i.client_compensation) as total_compensation
FROM issues i
JOIN clients c ON i.client_id = c.client_id
GROUP BY c.company_name
HAVING total_issues > 0
ORDER BY total_issues DESC;
```

#### Critical issues requiring immediate attention
```sql
SELECT 
  i.issue_id,
  i.issue_code,
  c.company_name as client,
  j.job_code,
  i.issue_type,
  i.severity,
  i.reported_date,
  CONCAT(e.first_name, ' ', e.last_name) as assigned_to,
  i.description
FROM issues i
JOIN clients c ON i.client_id = c.client_id
JOIN jobs j ON i.job_id = j.job_id
LEFT JOIN employees e ON i.responsible_employee_id = e.employee_id
WHERE i.status = 'open'
  AND i.severity IN ('high', 'critical')
ORDER BY i.reported_date ASC;
```

#### Job completion rate by vehicle
```sql
SELECT 
  v.vehicle_code,
  v.vehicle_type,
  COUNT(j.job_id) as total_jobs,
  SUM(CASE WHEN j.status = 'completed' THEN 1 ELSE 0 END) as completed,
  SUM(CASE WHEN j.status = 'in_transit' THEN 1 ELSE 0 END) as in_transit,
  SUM(CASE WHEN j.status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
  ROUND(100.0 * SUM(CASE WHEN j.status = 'completed' THEN 1 ELSE 0 END) / COUNT(j.job_id), 2) as completion_rate
FROM vehicles v
LEFT JOIN jobs j ON v.vehicle_id = j.vehicle_id
GROUP BY v.vehicle_id
ORDER BY completion_rate DESC;
```

#### Client payment analysis
```sql
SELECT 
  c.company_name,
  c.client_type,
  COUNT(j.job_id) as jobs_total,
  SUM(j.price) as revenue_total,
  AVG(j.price) as avg_job_value,
  COUNT(DISTINCT j.service_id) as services_used,
  MAX(j.created_at) as last_job_date
FROM jobs j
JOIN clients c ON j.client_id = c.client_id
GROUP BY c.client_id
ORDER BY revenue_total DESC;
```

### Advanced Analytical Queries

#### End-to-end job workflow with issues
```sql
SELECT 
  j.job_code,
  c.company_name as client,
  j.status as job_status,
  COUNT(i.issue_id) as issue_count,
  SUM(CASE WHEN i.status = 'open' THEN 1 ELSE 0 END) as unresolved_issues,
  j.price,
  SUM(COALESCE(i.client_compensation, 0)) as compensation_paid
FROM jobs j
JOIN clients c ON j.client_id = c.client_id
LEFT JOIN issues i ON j.job_id = i.job_id
GROUP BY j.job_id
ORDER BY j.created_at DESC;
```

#### Employee performance: drivers by completions and issues
```sql
SELECT 
  CONCAT(e.first_name, ' ', e.last_name) as driver_name,
  COUNT(j.job_id) as jobs_assigned,
  SUM(CASE WHEN j.status = 'completed' THEN 1 ELSE 0 END) as jobs_completed,
  COUNT(DISTINCT i.issue_id) as issues_caused,
  SUM(COALESCE(i.cost, 0)) as cost_of_issues
FROM employees e
LEFT JOIN jobs j ON e.employee_id = j.driver_employee_id
LEFT JOIN issues i ON j.job_id = i.job_id
WHERE e.job_title LIKE '%Driver%'
GROUP BY e.employee_id
ORDER BY jobs_completed DESC;
```

---

## Database Evolution

### Schema Versions

**Version 1.0** - Core Operations & Assets
- Tables: company, departments, employees, countries, services, country_services, warehouses, warehouse_capabilities, vehicles
- 9 tables, 44 seeded employees, 2 warehouses, 8 vehicles

**Version 1.1** - Commercial Operations (NEW)
- Additional tables: clients, pricing_models, jobs, issues
- Enables: job scheduling, client management, pricing structures, issue/claim tracking
- 4 new tables extending core schema with revenue and problem tracking

### Table Count
- **Total Tables:** 14 (including sqlite_sequence system table)
- **Core Operational:** 9 tables
- **Commercial:** 4 tables
- **System:** 1 table (sqlite_sequence)

---

## Notes

- **Synthetic Data:** Employee names, emails, and contact details are synthetic seed data for development/testing
- **Operational Status:** Vehicle `current_status` and `current_location` are operational data that should be updated dynamically
- **Foreign Key Support:** SQLite has foreign keys disabled by default; enable with `PRAGMA foreign_keys = ON`
- **Timestamps:** Timestamp fields use SQLite's `CURRENT_TIMESTAMP`
- **Boolean Values:** SQLite stores booleans as INTEGER (0/1)

### Commercial Tables Notes

- **CLIENTS:** Ready for customer database population; `client_type` helps segment customer base
- **PRICING_MODELS:** Flexible structure supports multiple billing methodologies; add new models as business expands
- **JOBS:** Core operational table; designed for high transaction volume with efficient status tracking
- **ISSUES:** Quality assurance and liability tracking; supports cost allocation and customer compensation management

### Data Quality Assurance

- All foreign key constraints active (when `PRAGMA foreign_keys = ON`)
- Unique constraints prevent duplicate codes/identifiers
- NOT NULL constraints ensure required fields are populated
- Referential integrity maintained across all related tables

### Performance Considerations

For high-volume job operations, consider adding indexes on:
- `jobs.status` (frequently filtered)
- `jobs.client_id` (join operations)
- `issues.job_id` (issue lookups)
- `jobs.departure_date` (date range queries)

---

## Files in This Directory

| File | Purpose |
|------|---------|
| `loghub.db` | SQLite database file (production data, fully seeded) |
| `create_sqlite.sql` | Schema for operational tables (companies, employees, warehouses, vehicles, etc.) |
| `create_com.sql` | Schema for commercial tables (clients, jobs, pricing models, issues) |
| `seed2.sql` | Complete seed data (18 clients, 6 pricing models, 88 jobs, 9 issues) |
| `README.md` | This documentation file |

**Setup Status:** ✅ Complete - Database is fully initialized and seeded, ready for use.

---

**For questions or schema modifications, refer to:**
- Operational schema: `create_sqlite.sql`
- Commercial schema: `create_com.sql`
- Seed data: `seed2.sql`
- Company profile: `company_profile.md`
