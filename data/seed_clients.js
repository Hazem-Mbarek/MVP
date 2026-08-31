#!/usr/bin/env node

/**
 * Seed test clients into the LogHub database
 * Run: node data/seed_clients.js
 */

const sqlite3 = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "knowledge", "company", "database", "loghub.db");
console.log(`[SEED] Opening database at: ${dbPath}`);

try {
  const db = new sqlite3(dbPath);
  db.pragma("foreign_keys = ON");

  const testClients = [
    {
      client_code: "GCD-001",
      company_name: "Groupe Chartier Distribution SAS",
      contact_name: "Véronique Chartier",
      email: "veronique.chartier@groupe.example",
      phone: "+33 338 9478454",
      country: "France",
      city: "Paris",
      client_type: "corporate",
      status: "active",
    },
    {
      client_code: "NPT-002",
      company_name: "Nord-Pas Textiles SARL",
      contact_name: "Antoine Rousseau",
      email: "antoine.rousseau@nordpas.example",
      phone: "+33 716 1445199",
      country: "France",
      city: "Lille",
      client_type: "corporate",
      status: "active",
    },
    {
      client_code: "RIM-003",
      company_name: "Ruhrmetall Industrieteile GmbH",
      contact_name: "Bettina Arnold",
      email: "bettina.arnold@ruhrmetall.example",
      phone: "+49 754 2867825",
      country: "Germany",
      city: "Dortmund",
      client_type: "corporate",
      status: "active",
    },
    {
      client_code: "REH-004",
      company_name: "Rheinland Elektronik Handels AG",
      contact_name: "Sabine Thiel",
      email: "sabine.thiel@rheinland.example",
      phone: "+49 350 4744854",
      country: "Germany",
      city: "Cologne",
      client_type: "corporate",
      status: "active",
    },
  ];

  const stmt = db.prepare(`
    INSERT INTO clients (client_code, company_name, contact_name, email, phone, country, city, client_type, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(client_code) DO NOTHING
  `);

  let inserted = 0;
  for (const client of testClients) {
    const result = stmt.run(
      client.client_code,
      client.company_name,
      client.contact_name,
      client.email,
      client.phone,
      client.country,
      client.city,
      client.client_type,
      client.status
    );

    if (result.changes > 0) {
      inserted++;
      console.log(`[SEED] ✓ Inserted: ${client.company_name} (${client.email})`);
    } else {
      console.log(`[SEED] ✗ Already exists: ${client.company_name}`);
    }
  }

  console.log(`\n[SEED] Complete: ${inserted} new clients inserted`);

  // Verify the data
  console.log("\n[SEED] Verifying inserted clients:");
  const verify = db.prepare(`
    SELECT client_id, client_code, company_name, contact_name, email, country, city FROM clients 
    WHERE client_code IN ('GCD-001', 'NPT-002', 'RIM-003', 'REH-004')
    ORDER BY client_id
  `);

  for (const row of verify.all()) {
    console.log(`  ID ${row.client_id}: ${row.company_name} | ${row.contact_name} | ${row.email}`);
  }

  db.close();
} catch (error) {
  console.error("[SEED] Error:", error.message);
  process.exit(1);
}
