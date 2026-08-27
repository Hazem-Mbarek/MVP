# 14. CIF — Cost, Insurance and Freight

```yaml
incoterm:
  code: CIF
  name: Cost, Insurance and Freight
  version: 2020
  category: C
  transport_modes:
    - sea
    - inland_waterway
  mode_scope: sea_and_inland_waterway_only

  named_location:
    required: true
    description: "Named port of destination."

  delivery:
    seller_delivers_to: "On board the vessel"

  risk:
    transfer_point: "When goods are on board the vessel at the port of shipment"
    transfer_stage: "Port of loading"

  transportation:
    seller_arranges_main_carriage: true
    buyer_arranges_main_carriage: false

  customs:
    seller_handles_export_clearance: true
    buyer_handles_export_clearance: false
    seller_handles_import_clearance: false
    buyer_handles_import_clearance: true
    seller_pays_import_duties: false
    buyer_pays_import_duties: true

  insurance:
    seller_provides_insurance: true
    buyer_should_consider_additional_insurance: "Depending on cargo, coverage and commercial requirements"

  destination:
    seller_unloads_at_destination: false

  operational_profile:
    seller_responsibility_level: high
    buyer_responsibility_level: medium

  key_distinction:
    seller_pays_carriage: true
    seller_arranges_insurance: true
    risk_transfers_at_destination: false

  related_rules:
    - CFR
    - FOB
    - CIP
```

## Core concept

CIF combines delivery on board the vessel with seller-arranged freight and insurance to the named destination port.

The seller pays for freight and arranges insurance, but risk transfers when the goods are loaded on board at the port of shipment.

## Seller responsibilities

The seller generally:

* prepares and packages the goods;
* handles export clearance;
* delivers the goods on board;
* contracts and pays for freight to the destination port;
* arranges the insurance required under CIF;
* provides required documentation.

## Buyer responsibilities

The buyer generally:

* assumes risk once the goods are on board;
* handles import clearance;
* pays import duties and taxes where applicable;
* bears costs allocated to the buyer;
* arranges onward transportation where necessary.

## Risk transfer

Risk transfers when the goods are on board the vessel at the port of shipment.

It does not transfer when the goods arrive at the destination port.

## Insurance

Insurance is a defining feature of CIF.

The seller is required to arrange insurance according to the requirements applicable to CIF.

The buyer may need additional coverage depending on the cargo and desired protection.

## Logistics interpretation

A logistics assistant should verify the transport mode before recommending CIF.

CIF is intended for sea and inland-waterway transport.

For a road-only shipment, a rule intended for any mode of transport should normally be evaluated instead.

## Common mistake

CIF does not mean that the seller retains transportation risk until the destination port.

---

# 15. Cross-Rule Machine-Readable Comparison

```yaml
incoterms_comparison:

  EXW:
    category: E
    mode_scope: any_mode
    seller_arranges_main_carriage: false
    seller_provides_insurance: false
    seller_handles_import_clearance: false
    seller_pays_import_duties: false
    seller_unloads_at_destination: false
    risk_location: origin_named_place

  FCA:
    category: F
    mode_scope: any_mode
    seller_arranges_main_carriage: false
    seller_provides_insurance: false
    seller_handles_import_clearance: false
    seller_pays_import_duties: false
    seller_unloads_at_destination: false
    risk_location: named_delivery_point

  CPT:
    category: C
    mode_scope: any_mode
    seller_arranges_main_carriage: true
    seller_provides_insurance: false
    seller_handles_import_clearance: false
    seller_pays_import_duties: false
    seller_unloads_at_destination: false
    risk_location: carrier_delivery_point

  CIP:
    category: C
    mode_scope: any_mode
    seller_arranges_main_carriage: true
    seller_provides_insurance: true
    seller_handles_import_clearance: false
    seller_pays_import_duties: false
    seller_unloads_at_destination: false
    risk_location: carrier_delivery_point

  DAP:
    category: D
    mode_scope: any_mode
    seller_arranges_main_carriage: true
    seller_provides_insurance: false
    seller_handles_import_clearance: false
    seller_pays_import_duties: false
    seller_unloads_at_destination: false
    risk_location: destination_ready_for_unloading

  DPU:
    category: D
    mode_scope: any_mode
    seller_arranges_main_carriage: true
    seller_provides_insurance: false
    seller_handles_import_clearance: false
    seller_pays_import_duties: false
    seller_unloads_at_destination: true
    risk_location: destination_after_unloading

  DDP:
    category: D
    mode_scope: any_mode
    seller_arranges_main_carriage: true
    seller_provides_insurance: false
    seller_handles_import_clearance: true
    seller_pays_import_duties: true
    seller_unloads_at_destination: false
    risk_location: destination_ready_for_unloading

  FAS:
    category: F
    mode_scope: sea_and_inland_waterway_only
    seller_arranges_main_carriage: false
    seller_provides_insurance: false
    seller_handles_import_clearance: false
    seller_pays_import_duties: false
    seller_unloads_at_destination: false
    risk_location: alongside_vessel_at_port_of_loading

  FOB:
    category: F
    mode_scope: sea_and_inland_waterway_only
    seller_arranges_main_carriage: false
    seller_provides_insurance: false
    seller_handles_import_clearance: false
    seller_pays_import_duties: false
    seller_unloads_at_destination: false
    risk_location: on_board_vessel_at_port_of_loading

  CFR:
    category: C
    mode_scope: sea_and_inland_waterway_only
    seller_arranges_main_carriage: true
    seller_provides_insurance: false
    seller_handles_import_clearance: false
    seller_pays_import_duties: false
    seller_unloads_at_destination: false
    risk_location: on_board_vessel_at_port_of_loading

  CIF:
    category: C
    mode_scope: sea_and_inland_waterway_only
    seller_arranges_main_carriage: true
    seller_provides_insurance: true
    seller_handles_import_clearance: false
    seller_pays_import_duties: false
    seller_unloads_at_destination: false
    risk_location: on_board_vessel_at_port_of_loading
```

---

# 16. Transport Compatibility Matrix

```yaml
transport_compatibility:

  road:
    compatible:
      - EXW
      - FCA
      - CPT
      - CIP
      - DAP
      - DPU
      - DDP
    not_intended_for:
      - FAS
      - FOB
      - CFR
      - CIF

  rail:
    compatible:
      - EXW
      - FCA
      - CPT
      - CIP
      - DAP
      - DPU
      - DDP
    not_intended_for:
      - FAS
      - FOB
      - CFR
      - CIF

  air:
    compatible:
      - EXW
      - FCA
      - CPT
      - CIP
      - DAP
      - DPU
      - DDP
    not_intended_for:
      - FAS
      - FOB
      - CFR
      - CIF

  sea:
    compatible:
      - EXW
      - FCA
      - CPT
      - CIP
      - DAP
      - DPU
      - DDP
      - FAS
      - FOB
      - CFR
      - CIF

  inland_waterway:
    compatible:
      - EXW
      - FCA
      - CPT
      - CIP
      - DAP
      - DPU
      - DDP
      - FAS
      - FOB
      - CFR
      - CIF

  multimodal:
    compatible:
      - EXW
      - FCA
      - CPT
      - CIP
      - DAP
      - DPU
      - DDP
    note: "Sea-specific rules should not be treated as general multimodal rules."
```

---

# 17. Important Agent Rules

The logistics AI should apply the following reasoning principles.

## Rule 1 — Check transport mode first

Before recommending an Incoterm, determine the shipment's transport mode.

If:

```text
transport_mode = road
incoterm = CIF
```

the assistant should flag that CIF is a sea/inland-waterway rule and should not simply treat CIF as a normal road-shipment term.

---

## Rule 2 — Do not confuse freight payment with risk transfer

For:

* CPT
* CIP
* CFR
* CIF

the seller arranges or pays for carriage, but risk transfers before the goods reach the named destination.

The assistant should explicitly distinguish:

```text
seller_pays_carriage
```

from:

```text
risk_transfer_point
```

---

## Rule 3 — Insurance does not automatically mean risk remains with the seller

CIP and CIF require seller-arranged insurance.

However, risk still transfers according to the delivery provisions of those rules.

The assistant should not state:

> "The seller has the risk because the seller provides insurance."

---

## Rule 4 — Check unloading responsibility

The assistant should distinguish:

```text
DAP:
seller delivers ready for unloading
buyer normally unloads

DPU:
seller unloads

DDP:
seller delivers ready for unloading
buyer normally unloads
```

---

## Rule 5 — Check customs responsibility

The assistant should distinguish:

```text
DDP:
seller handles import clearance
seller pays applicable import duties/taxes

DAP / DPU:
buyer generally handles import clearance
buyer generally pays import duties/taxes
```

---

## Rule 6 — Use the named place carefully

An Incoterm should not be treated as complete without its named place.

For example:

```text
DAP Tunis
```

is materially more useful operationally than:

```text
DAP
```

The named place determines where delivery and risk transfer are intended to occur.

---

# 18. Example Agent Reasoning Scenarios

## Scenario A — Road shipment + CIF

### Input

```yaml
shipment:
  transport_mode: road
  origin: Frankfurt
  destination: Tunis
  incoterm: CIF
```

### Expected reasoning

```text
1. Identify transport mode = road.
2. Identify Incoterm = CIF.
3. Retrieve CIF metadata.
4. Check mode_scope.
5. CIF is sea_and_inland_waterway_only.
6. Flag a potential Incoterm/transport-mode mismatch.
7. Do not automatically provide a replacement without considering the commercial transaction.
8. Suggest reviewing an any-mode rule such as CPT, CIP, DAP or DDP depending on the intended allocation of responsibilities.
```

### Expected response style

> CIF is intended for sea and inland-waterway transport, while this shipment is recorded as road transport. The selected Incoterm should therefore be reviewed. An alternative such as CPT, CIP, DAP or DDP may be relevant depending on which party should arrange carriage, insurance and destination/import responsibilities.

---

# 19. Example Agent Reasoning Scenario — Damaged Shipment

### Input

```yaml
shipment:
  shipment_id: SHP-10492
  transport_mode: road
  incoterm: CPT
  status: delivered
  damage_reported: true
```

### Agent should retrieve

```text
Database:
- shipment information
- delivery date
- customer
- carrier
- transport mode
- Incoterm

Knowledge base:
- CMR Article 17
- CMR Article 23
- CMR Article 30
- company claims policy
- damaged-shipment FAQ
```

### Agent should then distinguish

```text
FACT FROM DATABASE
Shipment SHP-10492 was delivered on [date].

LEGAL SOURCE
CMR Article [relevant article] provides the applicable rule.

COMPANY POLICY
The fictional company requires [policy].

ACTION
The claim should be reviewed and the following information/documents
should be collected: [...]
```

The agent should cite the relevant CMR article and company source rather than presenting its own inference as if it were statutory text.

---

# 20. Source Hierarchy

For this demonstration knowledge base, sources should be conceptually classified as follows:

```yaml
source_hierarchy:

  legal:
    examples:
      - CMR Convention
    role: "Primary legal reference for questions within its scope"

  operational:
    examples:
      - Incoterms 2020 operational guide
    role: "Commercial/logistics guidance"

  company:
    examples:
      - Company profile
      - Company claims policy
    role: "Fictional company's own policies and capabilities"

  practical:
    examples:
      - FAQ
    role: "Plain-language operational guidance"
```

If two sources appear inconsistent, the assistant should **not silently choose one**. It should identify the conflict and explain which source is being relied upon.

---

# 21. Knowledge Base Metadata

```yaml
knowledge_base:
  domain: logistics
  subdomain:
    - freight_forwarding
    - international_trade
    - shipment_operations

  source:
    name: "Incoterms 2020 Operational Guide"
    type: operational
    version: "Incoterms 2020"

  rules:
    total: 11
    any_mode:
      - EXW
      - FCA
      - CPT
      - CIP
      - DAP
      - DPU
      - DDP
    sea_and_inland_waterway:
      - FAS
      - FOB
      - CFR
      - CIF

  intended_agent_capabilities:
    - identify_incoterm
    - explain_incoterm
    - compare_incoterms
    - check_transport_compatibility
    - identify_risk_transfer
    - identify_carriage_responsibility
    - identify_insurance_responsibility
    - identify_customs_responsibility
    - identify_unloading_responsibility
    - provide_source_grounded_guidance
```

---

# 22. Disclaimer

This document is an independently written operational guide prepared for an AI logistics demonstration.

Incoterms® is a registered trademark of the International Chamber of Commerce (ICC). This document is not the official ICC Incoterms® 2020 publication and should not be treated as a substitute for the official rules.

Where an operational question has legal, contractual, customs or financial consequences, the assistant should identify the relevant uncertainty and recommend checking the applicable authoritative source and contractual terms.
