# 10. DDP — Delivered Duty Paid

```yaml
incoterm:
  code: DDP
  name: Delivered Duty Paid
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
    goods_status_at_delivery: "On arriving means of transport, ready for unloading"

  risk:
    transfer_point: "At the named destination when goods are placed at the buyer's disposal ready for unloading"
    transfer_stage: "Destination"

  transportation:
    seller_arranges_main_carriage: true
    buyer_arranges_main_carriage: false

  customs:
    seller_handles_export_clearance: true
    buyer_handles_export_clearance: false
    seller_handles_import_clearance: true
    buyer_handles_import_clearance: false
    seller_pays_import_duties: true
    buyer_pays_import_duties: false

  insurance:
    seller_provides_insurance: false
    buyer_should_consider_insurance: "Optional"

  destination:
    seller_unloads_at_destination: false

  operational_profile:
    seller_responsibility_level: very_high
    buyer_responsibility_level: low

  key_distinction:
    seller_handles_import: true
    seller_pays_import_duties: true

  related_rules:
    - DAP
    - DPU
    - EXW
```

## Core concept

DDP places extensive responsibility on the seller.

The seller arranges transportation to the named destination and handles export and import formalities, including applicable import duties and taxes.

## Seller responsibilities

The seller generally:

* prepares and packages the goods;
* handles export clearance;
* arranges transportation;
* bears transportation risk until destination;
* handles import clearance;
* pays applicable import duties and taxes;
* delivers the goods at the named destination ready for unloading.

## Buyer responsibilities

The buyer generally:

* receives the goods;
* unloads the goods;
* provides information or assistance where required;
* bears costs allocated to the buyer.

## Risk transfer

Risk transfers at the named destination when the goods are placed at the buyer's disposal on the arriving means of transport, ready for unloading.

## Insurance

DDP does not require the seller to arrange cargo insurance.

However, the seller carries the transportation risk until delivery under the rule.

## Customs

DDP places import clearance responsibility and applicable import duties and taxes on the seller.

This can create practical challenges if the seller cannot legally or operationally perform the required customs/import role in the destination country.

## Logistics interpretation

Before accepting DDP, a logistics operator should verify:

* destination-country customs requirements;
* importer-of-record requirements;
* customs representation;
* taxes;
* duties;
* restricted goods;
* documentation requirements.

## Common mistake

DDP does not require the seller to unload the goods at destination. The goods are delivered ready for unloading.

---
