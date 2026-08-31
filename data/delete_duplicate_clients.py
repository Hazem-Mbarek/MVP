#!/usr/bin/env python3
"""
Delete duplicate test clients from LogHub database.
Keeps the oldest, deletes the newest instances of each client.
"""

import sqlite3
from pathlib import Path

db_path = Path(__file__).parent / "knowledge" / "company" / "database" / "loghub.db"

print(f"[DELETE] Opening database at: {db_path}")

if not db_path.exists():
    print(f"[DELETE] ERROR: Database not found at {db_path}")
    exit(1)

try:
    conn = sqlite3.connect(str(db_path))
    conn.execute("PRAGMA foreign_keys = ON")
    cursor = conn.cursor()

    # Find all clients with these company names
    target_companies = [
        "Groupe Chartier Distribution SAS",
        "Nord-Pas Textiles SARL",
        "Ruhrmetall Industrieteile GmbH",
        "Rheinland Elektronik Handels AG",
    ]

    print("\n[DELETE] Finding duplicate clients...")
    
    for company in target_companies:
        # Get all instances of this company, ordered by client_id (oldest first)
        cursor.execute(
            """
            SELECT client_id, company_name, contact_name, created_at 
            FROM clients 
            WHERE company_name = ? 
            ORDER BY client_id ASC
        """,
            (company,),
        )
        
        results = cursor.fetchall()
        
        if len(results) >= 2:
            # Keep the first (oldest), delete the rest
            keep_id = results[0][0]
            delete_ids = [r[0] for r in results[1:]]
            
            print(f"\n  Company: {company}")
            print(f"  Keeping ID {keep_id}: {results[0][2]}")
            print(f"  Deleting IDs: {delete_ids}")
            
            for delete_id in delete_ids:
                cursor.execute("DELETE FROM clients WHERE client_id = ?", (delete_id,))
                print(f"    ✓ Deleted ID {delete_id}")
        else:
            print(f"\n  Company: {company} - Only 1 instance (keeping)")

    conn.commit()
    print("\n[DELETE] Complete: Duplicates deleted")

    # Verify remaining clients
    print("\n[DELETE] Remaining test clients:")
    cursor.execute(
        """
        SELECT client_id, client_code, company_name, contact_name 
        FROM clients 
        WHERE company_name IN (?, ?, ?, ?)
        ORDER BY client_id
    """,
        target_companies,
    )

    for row in cursor.fetchall():
        print(f"  ID {row[0]}: {row[2]} | {row[3]}")

    conn.close()

except Exception as e:
    print(f"[DELETE] Error: {e}")
    exit(1)
