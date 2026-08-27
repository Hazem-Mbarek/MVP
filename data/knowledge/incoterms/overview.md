# Incoterms® 2020 — Operational Knowledge Base

> **Document type:** Operational logistics knowledge
> **Version:** Incoterms® 2020
> **Intended use:** AI logistics / freight-forwarding assistant demonstration
> **Status:** Independently written operational guide
>
> **Important:** This document is an operational explanation of Incoterms® 2020. It is not the ICC Incoterms® 2020 rulebook and does not reproduce the ICC publication. Incoterms® rules should be interpreted together with the applicable sales contract and relevant customs, transport and other applicable laws.

---

# 1. General Incoterms Knowledge

## What are Incoterms?

Incoterms® are standardized commercial rules used in sales contracts to establish important responsibilities between a seller and a buyer.

They help determine matters such as:

* where delivery takes place;
* when risk transfers from seller to buyer;
* which party arranges transportation;
* which party pays particular transportation costs;
* which party handles export and import formalities;
* whether the seller is required to arrange insurance;
* and, depending on the rule, whether the seller is responsible for unloading at destination.

Incoterms do **not** by themselves determine every aspect of a commercial transaction. They should not be treated as a replacement for the sales contract, applicable transport conventions, customs legislation, insurance contracts or other applicable law.

---

# 2. Incoterm Transport Classification

There are 11 Incoterms® 2020 rules.

## Rules for Any Mode(s) of Transport

These seven rules can be used for any mode or combination of transport:

* EXW — Ex Works
* FCA — Free Carrier
* CPT — Carriage Paid To
* CIP — Carriage and Insurance Paid To
* DAP — Delivered at Place
* DPU — Delivered at Place Unloaded
* DDP — Delivered Duty Paid

## Rules for Sea and Inland Waterway Transport

These four rules are intended for sea and inland-waterway transport:

* FAS — Free Alongside Ship
* FOB — Free On Board
* CFR — Cost and Freight
* CIF — Cost, Insurance and Freight

---

# 3. Machine-Readable Rule Schema

Each rule in this document contains a YAML metadata block.

The metadata is intended to support deterministic application logic in the logistics assistant.

Important boolean fields:

* `seller_arranges_main_carriage`
* `seller_provides_insurance`
* `seller_handles_import_clearance`
* `seller_pays_import_duties`
* `seller_unloads_at_destination`

These fields describe the normal allocation under the relevant Incoterms® rule. They should not be interpreted as replacing the detailed rule or the parties' contract.

---
