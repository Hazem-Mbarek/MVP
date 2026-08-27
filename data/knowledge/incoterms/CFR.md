# 13. CFR — Cost and Freight

```yaml
incoterm:
  code: CFR
  name: Cost and Freight
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
    seller_provides_insurance: false
    buyer_should_consider_insurance: true

  destination:
    seller_unloads_at_destination: false

  operational_profile:
    seller_responsibility_level: high
    buyer_responsibility_level: medium

  key_distinction:
    seller_pays_carriage: true
    risk_transfers_at_destination: false

  related_rules:
    - FOB
    - CIF
    - CPT
```

## Core concept

Under CFR, the seller delivers the goods on board the vessel and pays the freight to the named destination port.

As with CPT, payment of the main carriage and transfer of risk occur at different points.

## Seller responsibilities

The seller generally:

* prepares and packages the goods;
* handles export clearance;
* delivers the goods on board the vessel;
* contracts and pays for freight to the named destination port;
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

Risk does not wait until arrival at the destination port.

## Insurance

CFR does not require the seller to arrange cargo insurance.

The buyer should consider insurance because it assumes risk once the goods are on board.

## Logistics interpretation

A logistics assistant should distinguish between:

* **who pays the freight**, and
* **who carries the transportation risk**.

Under CFR, the seller pays the freight but risk transfers at the shipment port.

## Common mistake

CFR does not include a seller obligation to arrange cargo insurance.

---
