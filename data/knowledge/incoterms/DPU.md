# 9. DPU — Delivered at Place Unloaded

```yaml
incoterm:
  code: DPU
  name: Delivered at Place Unloaded
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
    seller_delivers_to: "Buyer at named destination"
    goods_status_at_delivery: "Unloaded from the arriving means of transport"

  risk:
    transfer_point: "At the named destination after unloading"
    transfer_stage: "Destination after unloading"

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
    seller_unloads_at_destination: true

  operational_profile:
    seller_responsibility_level: very_high
    buyer_responsibility_level: medium

  key_distinction:
    seller_unloads_at_destination: true
    compared_with_DAP: "Seller unloads under DPU; buyer normally unloads under DAP"

  related_rules:
    - DAP
    - DDP
```

## Core concept

DPU requires the seller to arrange transportation to the named destination and unload the goods from the arriving means of transport.

DPU replaced the former DAT rule in Incoterms® 2020.

## Seller responsibilities

The seller generally:

* prepares and packages the goods;
* completes export formalities;
* arranges transportation;
* pays transportation costs to the destination;
* bears risk until delivery;
* unloads the goods at the named destination.

## Buyer responsibilities

The buyer generally:

* receives the unloaded goods;
* handles import clearance;
* pays import duties and taxes where applicable;
* bears costs allocated to the buyer after delivery.

## Risk transfer

Risk transfers after the goods have been unloaded at the named destination and placed at the buyer's disposal.

## Insurance

DPU does not require the seller to arrange cargo insurance.

## Logistics interpretation

DPU is particularly relevant when the seller is expected to take responsibility for unloading at destination.

A logistics company should verify:

* unloading equipment;
* site accessibility;
* unloading restrictions;
* dimensions and weight;
* appointment requirements;
* safety requirements.

## Common mistake

DPU is different from DAP because **DPU requires seller unloading at destination**.

---
