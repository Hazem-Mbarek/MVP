# 6. CPT — Carriage Paid To

```yaml
incoterm:
  code: CPT
  name: Carriage Paid To
  version: 2020
  category: C
  transport_modes:
    - road
    - rail
    - air
    - sea
    - inland_waterway
    - multimodal
  mode_scope: any_mode

  named_location:
    required: true
    description: "Named place of destination."

  delivery:
    seller_delivers_to: "Carrier"
    seller_loads_onto_collecting_vehicle: "Depends on the delivery arrangement"

  risk:
    transfer_point: "When the goods are delivered to the carrier"
    transfer_stage: "Before arrival at the named destination"

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
    seller_provides_insurance: false
    buyer_should_consider_insurance: true

  destination:
    seller_unloads_at_destination: false

  operational_profile:
    seller_responsibility_level: medium
    buyer_responsibility_level: medium

  key_distinction:
    seller_pays_carriage: true
    risk_transfers_at_destination: false

  related_rules:
    - CIP
    - FCA
    - DAP
```

## Core concept

Under CPT, the seller arranges and pays for carriage to the named destination.

However, the point at which the seller pays for carriage is different from the point at which risk transfers.

## Seller responsibilities

The seller generally:

* prepares and packages the goods;
* completes export formalities;
* delivers the goods to the carrier;
* contracts and pays for carriage to the named destination;
* provides required documentation.

## Buyer responsibilities

The buyer generally:

* assumes risk after delivery to the carrier;
* handles import formalities;
* pays applicable import duties and taxes;
* bears costs allocated to the buyer.

## Risk transfer

Risk transfers when the seller delivers the goods to the carrier.

Therefore, risk does not necessarily remain with the seller until the shipment reaches the named destination.

## Insurance

CPT does not require the seller to arrange cargo insurance.

The buyer should consider insurance because transportation risk transfers to the buyer before destination.

## Logistics interpretation

CPT is particularly important for logistics teams because customers can incorrectly assume:

> "The seller is paying for transport, so the seller has the risk."

Under CPT, those two concepts are separate.

## Common mistake

Do not confuse the **carriage payment point** with the **risk-transfer point**.

---
