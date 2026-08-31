#!/usr/bin/env python3
"""
Seed test clients into LogHub database for external agent role-play demo.
Usage: python data/seed_clients.py
"""

import sqlite3
import os
from pathlib import Path

# Database path
db_path = Path(__file__).parent / "knowledge" / "company" / "database" / "loghub.db"

print(f"[SEED] Opening database at: {db_path}")

if not db_path.exists():
    print(f"[SEED] ERROR: Database not found at {db_path}")
    exit(1)

try:
    conn = sqlite3.connect(str(db_path))
    conn.execute("PRAGMA foreign_keys = ON")
    cursor = conn.cursor()

    test_clients = [
        (
            "GCD-001",
            "Groupe Chartier Distribution SAS",
            "Véronique Chartier",
            "veronique.chartier@groupe.example",
            "+33 338 9478454",
            "France",
            "Paris",
            "corporate",
            "active",
        ),
        (
            "NPT-002",
            "Nord-Pas Textiles SARL",
            "Antoine Rousseau",
            "antoine.rousseau@nordpas.example",
            "+33 716 1445199",
            "France",
            "Lille",
            "corporate",
            "active",
        ),
        (
            "RIM-003",
            "Ruhrmetall Industrieteile GmbH",
            "Bettina Arnold",
            "bettina.arnold@ruhrmetall.example",
            "+49 754 2867825",
            "Germany",
            "Dortmund",
            "corporate",
            "active",
        ),
        (
            "REH-004",
            "Rheinland Elektronik Handels AG",
            "Sabine Thiel",
            "sabine.thiel@rheinland.example",
            "+49 350 4744854",
            "Germany",
            "Cologne",
            "corporate",
            "active",
        ),
    ]

    inserted = 0
    for client in test_clients:
        try:
            cursor.execute(
                """
                INSERT INTO clients (client_code, company_name, contact_name, email, phone, country, city, client_type, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
                client,
            )
            inserted += 1
            print(f"[SEED] ✓ Inserted: {client[1]} ({client[3]})")
        except sqlite3.IntegrityError:
            print(f"[SEED] ✗ Already exists: {client[1]}")

    conn.commit()
    print(f"\n[SEED] Complete: {inserted} new clients inserted")

    # Verify
    print("\n[SEED] Verifying inserted clients:")
    cursor.execute(
        """
        SELECT client_id, client_code, company_name, contact_name, email, country, city 
        FROM clients 
        WHERE client_code IN ('GCD-001', 'NPT-002', 'RIM-003', 'REH-004')
        ORDER BY client_id
    """
    )

    for row in cursor.fetchall():
        print(f"  ID {row[0]}: {row[2]} | {row[3]} | {row[4]}")

    conn.close()

except Exception as e:
    print(f"[SEED] Error: {e}")
    exit(1)
