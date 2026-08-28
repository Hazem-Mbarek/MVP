# Data Structure Documentation

Generated: 2026-08-28

## Overview

This document provides a comprehensive map of all data sources, database tables, and JSONL file structures in the LogHub system.

---

## Database Schema

**File:** `data/knowledge/company/database/loghub.db` (SQLite 3)

### Operational Tables (9)

#### company

| Column | Type | Required | PK |
|--------|------|----------|----|
| company_id | INTEGER |  | ✓ |
| legal_name | VARCHAR(200) | ✓ |  |
| trading_name | VARCHAR(200) |  |  |
| legal_form | VARCHAR(100) |  |  |
| founded_year | INTEGER |  |  |
| headquarters_city | VARCHAR(100) |  |  |
| headquarters_country | VARCHAR(100) |  |  |
| employee_count | INTEGER |  |  |
| primary_currency | CHAR(3) |  |  |
| timezone | VARCHAR(100) |  |  |

#### departments

| Column | Type | Required | PK |
|--------|------|----------|----|
| department_id | INTEGER |  | ✓ |
| company_id | INTEGER | ✓ |  |
| name | VARCHAR(100) | ✓ |  |
| description | TEXT |  |  |
| employee_count | INTEGER |  |  |

#### employees

| Column | Type | Required | PK |
|--------|------|----------|----|
| employee_id | INTEGER |  | ✓ |
| company_id | INTEGER | ✓ |  |
| department_id | INTEGER |  |  |
| employee_code | VARCHAR(20) | ✓ |  |
| first_name | VARCHAR(100) | ✓ |  |
| last_name | VARCHAR(100) | ✓ |  |
| job_title | VARCHAR(150) | ✓ |  |
| email | VARCHAR(200) |  |  |
| phone | VARCHAR(50) |  |  |
| employment_status | VARCHAR(30) | ✓ |  |
| manager_id | INTEGER |  |  |
| hire_date | DATE |  |  |
| can_approve_discounts | BOOLEAN |  |  |
| can_approve_claims | BOOLEAN |  |  |
| can_approve_shipments | BOOLEAN |  |  |
| created_at | TIMESTAMP |  |  |

#### countries

| Column | Type | Required | PK |
|--------|------|----------|----|
| country_id | INTEGER |  | ✓ |
| country_code | CHAR(2) | ✓ |  |
| country_name | VARCHAR(100) | ✓ |  |
| is_home_market | BOOLEAN |  |  |
| is_active_market | BOOLEAN |  |  |

#### services

| Column | Type | Required | PK |
|--------|------|----------|----|
| service_id | INTEGER |  | ✓ |
| service_code | VARCHAR(50) | ✓ |  |
| service_name | VARCHAR(150) | ✓ |  |
| description | TEXT |  |  |
| is_active | BOOLEAN |  |  |

#### country_services

| Column | Type | Required | PK |
|--------|------|----------|----|
| country_service_id | INTEGER |  | ✓ |
| country_id | INTEGER | ✓ |  |
| service_id | INTEGER | ✓ |  |
| availability_status | VARCHAR(30) | ✓ |  |
| notes | TEXT |  |  |

#### warehouses

| Column | Type | Required | PK |
|--------|------|----------|----|
| warehouse_id | INTEGER |  | ✓ |
| company_id | INTEGER | ✓ |  |
| warehouse_code | VARCHAR(20) | ✓ |  |
| name | VARCHAR(150) | ✓ |  |
| facility_role | VARCHAR(100) |  |  |
| city | VARCHAR(100) | ✓ |  |
| region | VARCHAR(100) |  |  |
| country | VARCHAR(100) | ✓ |  |
| area_sqm | INTEGER |  |  |
| pallet_capacity | INTEGER |  |  |
| loading_docks | INTEGER |  |  |
| forklift_count | INTEGER |  |  |
| temperature_controlled | BOOLEAN |  |  |
| hazardous_goods_storage | BOOLEAN |  |  |
| cross_docking | BOOLEAN |  |  |
| short_term_storage | BOOLEAN |  |  |
| medium_term_storage | BOOLEAN |  |  |
| cctv | BOOLEAN |  |  |
| operating_hours | TEXT |  |  |
| is_active | BOOLEAN |  |  |

#### warehouse_capabilities

| Column | Type | Required | PK |
|--------|------|----------|----|
| warehouse_capability_id | INTEGER |  | ✓ |
| warehouse_id | INTEGER | ✓ |  |
| capability_code | VARCHAR(100) | ✓ |  |
| capability_name | VARCHAR(150) | ✓ |  |
| availability_status | VARCHAR(30) |  |  |
| notes | TEXT |  |  |

#### vehicles

| Column | Type | Required | PK |
|--------|------|----------|----|
| vehicle_id | INTEGER |  | ✓ |
| company_id | INTEGER | ✓ |  |
| vehicle_code | VARCHAR(30) | ✓ |  |
| vehicle_type | VARCHAR(100) | ✓ |  |
| registration_country | CHAR(2) |  |  |
| payload_kg | INTEGER |  |  |
| volume_m3 | DECIMAL(10,2) |  |  |
| pallet_capacity | INTEGER |  |  |
| has_tail_lift | BOOLEAN |  |  |
| has_gps | BOOLEAN |  |  |
| side_loading | BOOLEAN |  |  |
| rear_loading | BOOLEAN |  |  |
| temperature_controlled | BOOLEAN |  |  |
| adr_capable | BOOLEAN |  |  |
| current_status | VARCHAR(50) | ✓ |  |
| current_location | VARCHAR(150) |  |  |
| notes | TEXT |  |  |

### Commercial Tables (4)

#### clients

| Column | Type | Required | PK |
|--------|------|----------|----|
| client_id | INTEGER |  | ✓ |
| client_code | VARCHAR(30) | ✓ |  |
| company_name | VARCHAR(200) | ✓ |  |
| contact_name | VARCHAR(200) |  |  |
| email | VARCHAR(200) |  |  |
| phone | VARCHAR(50) |  |  |
| country | VARCHAR(100) |  |  |
| city | VARCHAR(100) |  |  |
| client_type | VARCHAR(50) |  |  |
| status | VARCHAR(30) |  |  |
| created_at | TIMESTAMP |  |  |
| notes | TEXT |  |  |

#### pricing_models

| Column | Type | Required | PK |
|--------|------|----------|----|
| pricing_model_id | INTEGER |  | ✓ |
| name | VARCHAR(100) | ✓ |  |
| description | TEXT |  |  |
| pricing_method | VARCHAR(50) | ✓ |  |
| currency | CHAR(3) |  |  |
| is_active | BOOLEAN |  |  |

#### jobs

| Column | Type | Required | PK |
|--------|------|----------|----|
| job_id | INTEGER |  | ✓ |
| client_id | INTEGER | ✓ |  |
| service_id | INTEGER |  |  |
| job_code | VARCHAR(30) | ✓ |  |
| shipment_type | VARCHAR(100) |  |  |
| content_description | TEXT |  |  |
| weight_kg | DECIMAL(10,2) |  |  |
| origin_city | VARCHAR(100) |  |  |
| origin_country | VARCHAR(100) |  |  |
| destination_city | VARCHAR(100) |  |  |
| destination_country | VARCHAR(100) |  |  |
| departure_date | DATE |  |  |
| arrival_date | DATE |  |  |
| return_to_warehouse_date | DATE |  |  |
| vehicle_id | INTEGER |  |  |
| driver_employee_id | INTEGER |  |  |
| pricing_model_id | INTEGER |  |  |
| price | DECIMAL(12,2) |  |  |
| currency | CHAR(3) |  |  |
| voyage_length_km | DECIMAL(10,2) |  |  |
| status | VARCHAR(50) |  |  |
| notes | TEXT |  |  |
| created_at | TIMESTAMP |  |  |

#### issues

| Column | Type | Required | PK |
|--------|------|----------|----|
| issue_id | INTEGER |  | ✓ |
| job_id | INTEGER | ✓ |  |
| client_id | INTEGER | ✓ |  |
| issue_type | VARCHAR(50) | ✓ |  |
| severity | VARCHAR(30) |  |  |
| status | VARCHAR(30) |  |  |
| reported_date | DATE |  |  |
| description | TEXT |  |  |
| responsible_employee_id | INTEGER |  |  |
| company_decision | TEXT |  |  |
| resolution | TEXT |  |  |
| resolved_date | DATE |  |  |
| cost | DECIMAL(12,2) |  |  |
| client_compensation | DECIMAL(12,2) |  |  |
| notes | TEXT |  |  |
| created_at | TIMESTAMP |  |  |

**Total Tables:** 14

---

## JSONL Data Files

### faq.jsonl

**Path:** `data/knowledge/faq/faq.jsonl`

**Description:** FAQ entries covering company operations, services, pricing, and policies

**Record Type:** Q&A pair

**Total Records:** 50

**Fields:**
- `answer`
- `category`
- `id`
- `last_updated`
- `question`
- `related_country`
- `related_service_codes`
- `source`

### incoterms.jsonl

**Path:** `data/knowledge/incoterms/incoterms.jsonl`

**Description:** Incoterms 2020 rules with detailed operational guidance and transport compatibility

**Record Type:** Incoterm rule with sub-sections

**Total Records:** 11

**Fields:**
- `category`
- `code`
- `id`
- `last_updated`
- `metadata`
- `mode_scope`
- `name`
- `related_rules`
- `road_compatible`
- `rule_number`
- `sections`
- `source`
- `source_file`
- `text`
- `transport_modes`
- `version`

### cmr.jsonl

**Path:** `data/knowledge/cmr/cmr.jsonl`

**Description:** CMR Convention articles with granular paragraph-level records for RAG

**Record Type:** Article + sub-records by paragraph

**Total Records:** 135

**Fields:**
- `article_number`
- `id`
- `last_updated`
- `source`
- `source_file`
- `text`
- `title`

---

## Data Flow & Architecture

```
┌─ Database (SQLite)
│  ├─ Operational Data
│  │  ├─ company, departments, employees
│  │  ├─ warehouses, vehicles
│  │  ├─ countries, services
│  │  └─ country_services
│  └─ Commercial Data
│     ├─ clients, pricing_models
│     ├─ jobs, issues
│     └─ Audit trail & metrics

├─ Knowledge Base (JSONL)
│  ├─ FAQ (50 Q&A entries)
│  ├─ Incoterms (11 rules + 32 sub-records)
│  └─ CMR (31 articles + 104 sub-records)

└─ Backend APIs
   ├─ Chat: OpenRouter integration
   ├─ RAG: Vector search on JSONL
   └─ Queries: SQLite for operational data
```

---

## Usage Patterns

### Database Access

**Python:**
```python
import sqlite3
conn = sqlite3.connect('data/knowledge/company/database/loghub.db')
cursor = conn.cursor()
cursor.execute('PRAGMA foreign_keys = ON')
# Query operational data
```

**Node.js:**
```javascript
const Database = require('better-sqlite3');
const db = new Database('data/knowledge/company/database/loghub.db');
db.pragma('foreign_keys = ON');
// Query operational data
```

### JSONL Access (for RAG/Embedding)

**Python:**
```python
import json
with open('data/knowledge/faq/faq.jsonl', 'r') as f:
    for line in f:
        record = json.loads(line)
        # Process for embedding
```

### Recommended Chunking Strategy

- **FAQ:** Use full record (short enough for single chunk)
- **Incoterms:** Use full rule OR individual subsections based on query complexity
- **CMR:** Use paragraph-level records (CMR-N-P) for precise retrieval

---

## Data Governance

| Component | Source | Format | Status | Last Updated |
|-----------|--------|--------|--------|--------------|
| Company Data | Manual + Seed | SQLite | ✅ Production | 2026-08-28 |
| FAQ | Manual | JSONL | ✅ Production | 2026-08-28 |
| Incoterms | Parsed from MD | JSONL | ✅ Production | 2026-08-28 |
| CMR Articles | Parsed from TXT | JSONL | ✅ Production | 2026-08-28 |

---

## Key Metrics

- **Database:** 14 tables, 44 employees, 18 clients, 88 jobs, 9 issues
- **FAQ:** 50 entries across 11 categories
- **Incoterms:** 11 rules, 32 sub-records (11 main + 21 subsections/items)
- **CMR:** 31 articles, 135 total records (31 main + 104 sub-records)
- **Total Embeddings Ready:** 50 + 43 + 135 = **228 discrete records**

