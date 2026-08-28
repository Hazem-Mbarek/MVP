#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generate markdown documentation of all data sources, database schema, and JSONL structures.
"""
import json
import sqlite3
import os
from pathlib import Path

def get_sqlite_schema():
    """Extract SQLite database schema."""
    db_path = "data/knowledge/company/database/loghub.db"
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Get all tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    tables = cursor.fetchall()
    
    schema = {}
    for table in tables:
        table_name = table[0]
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = cursor.fetchall()
        schema[table_name] = [
            {
                "name": col[1],
                "type": col[2],
                "notnull": col[3],
                "default": col[4],
                "pk": col[5]
            }
            for col in columns
        ]
    
    conn.close()
    return schema


def get_jsonl_fields(filepath):
    """Extract field names from first record in JSONL file."""
    if not os.path.exists(filepath):
        return None
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            first_line = f.readline()
            if first_line:
                record = json.loads(first_line)
                return sorted(record.keys())
    except:
        return None


def generate_markdown():
    """Generate comprehensive data structure markdown."""
    
    md = """# Data Structure Documentation

Generated: 2026-08-28

## Overview

This document provides a comprehensive map of all data sources, database tables, and JSONL file structures in the LogHub system.

---

## Database Schema

**File:** `data/knowledge/company/database/loghub.db` (SQLite 3)

"""
    
    # Get database schema
    schema = get_sqlite_schema()
    
    # Group tables by domain
    operational_tables = [
        "company", "departments", "employees", "countries", "services", 
        "country_services", "warehouses", "warehouse_capabilities", "vehicles"
    ]
    commercial_tables = ["clients", "pricing_models", "jobs", "issues"]
    system_tables = ["sqlite_sequence"]
    
    # Operational tables
    md += "### Operational Tables (9)\n\n"
    for table_name in operational_tables:
        if table_name in schema:
            md += f"#### {table_name}\n\n"
            md += "| Column | Type | Required | PK |\n"
            md += "|--------|------|----------|----|\n"
            for col in schema[table_name]:
                pk = "✓" if col["pk"] else ""
                nn = "✓" if col["notnull"] else ""
                md += f"| {col['name']} | {col['type']} | {nn} | {pk} |\n"
            md += "\n"
    
    # Commercial tables
    md += "### Commercial Tables (4)\n\n"
    for table_name in commercial_tables:
        if table_name in schema:
            md += f"#### {table_name}\n\n"
            md += "| Column | Type | Required | PK |\n"
            md += "|--------|------|----------|----|\n"
            for col in schema[table_name]:
                pk = "✓" if col["pk"] else ""
                nn = "✓" if col["notnull"] else ""
                md += f"| {col['name']} | {col['type']} | {nn} | {pk} |\n"
            md += "\n"
    
    md += f"**Total Tables:** {len(schema)}\n\n"
    
    # JSONL Files
    md += "---\n\n## JSONL Data Files\n\n"
    
    jsonl_files = [
        {
            "name": "faq.jsonl",
            "path": "data/knowledge/faq/faq.jsonl",
            "description": "FAQ entries covering company operations, services, pricing, and policies",
            "record_type": "Q&A pair"
        },
        {
            "name": "incoterms.jsonl",
            "path": "data/knowledge/incoterms/incoterms.jsonl",
            "description": "Incoterms 2020 rules with detailed operational guidance and transport compatibility",
            "record_type": "Incoterm rule with sub-sections"
        },
        {
            "name": "cmr.jsonl",
            "path": "data/knowledge/cmr/cmr.jsonl",
            "description": "CMR Convention articles with granular paragraph-level records for RAG",
            "record_type": "Article + sub-records by paragraph"
        }
    ]
    
    for file_info in jsonl_files:
        md += f"### {file_info['name']}\n\n"
        md += f"**Path:** `{file_info['path']}`\n\n"
        md += f"**Description:** {file_info['description']}\n\n"
        md += f"**Record Type:** {file_info['record_type']}\n\n"
        
        fields = get_jsonl_fields(file_info['path'])
        if fields:
            count = sum(1 for _ in open(file_info['path'], 'r', encoding='utf-8'))
            md += f"**Total Records:** {count}\n\n"
            md += "**Fields:**\n"
            for field in fields:
                md += f"- `{field}`\n"
        md += "\n"
    
    # Data flow
    md += """---

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

"""
    
    return md


def main():
    output_path = "DATA_STRUCTURE.md"
    
    md_content = generate_markdown()
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(md_content)
    
    print(f"✓ Generated {output_path}")
    print(f"  - Database schema from SQLite")
    print(f"  - JSONL file structures")
    print(f"  - Data flow documentation")


if __name__ == "__main__":
    main()
