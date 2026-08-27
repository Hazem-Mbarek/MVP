# 8. DAP — Delivered at Place

```yaml
incoterm:
  code: DAP
  name: Delivered at Place
  version: 2020
  category: D
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
    seller_delivers_to: "Buyer at the named destination"
    goods_status_at_delivery: "On the arriving means of transport, ready for unloading"

  risk:
    transfer_point: "At the named destination when the goods are placed at the buyer's disposal ready for unloading"
    transfer_stage: "Destination"

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
    buyer_should_consider_insurance: "Optional"

  destination:
    seller_unloads_at_destination: false
    goods_ready_for_unloading: true

  operational_profile:
    seller_responsibility_level: high
    buyer_responsibility_level: medium

  related_rules:
    - DPU
    - DDP
    - CPT
```

## Core concept

Under DAP, the seller arranges transportation to the named destination and bears the relevant risk until the goods are placed at the buyer's disposal there, ready for unloading.

The buyer generally handles unloading and import clearance.

## Seller responsibilities

The seller generally:

* prepares and packages the goods;
* handles export formalities;
* arranges transportation;
* pays transportation costs to the named destination;
* bears risk until delivery at destination.

## Buyer responsibilities

The buyer generally:

* receives the goods;
* unloads the goods;
* handles import clearance;
* pays import duties and taxes where applicable.

## Risk transfer

Risk transfers at the named destination when the goods are placed at the buyer's disposal on the arriving means of transport and are ready for unloading.

## Insurance

DAP does not require the seller to arrange cargo insurance.

## Logistics interpretation

DAP is useful when the seller or its logistics provider should organize transportation to a destination but the buyer will handle import clearance and unloading.

## Common mistake

DAP does not generally require the seller to unload the goods.

---
