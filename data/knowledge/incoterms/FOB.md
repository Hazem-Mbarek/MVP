# 12. FOB — Free On Board

```yaml
incoterm:
  code: FOB
  name: Free On Board
  version: 2020
  category: F
  transport_modes:
    - sea
    - inland_waterway
  mode_scope: sea_and_inland_waterway_only

  named_location:
    required: true
    description: "Named port of loading."

  delivery:
    seller_delivers_to: "On board the vessel nominated by the buyer"
    seller_loads_onto_vessel: true

  risk:
    transfer_point: "When goods are on board the vessel at the named port of loading"
    transfer_stage: "Port of loading"

  transportation:
    seller_arranges_main_carriage: false
    buyer_arranges_main_carriage: true

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
    buyer_responsibility_level: high

  key_distinction:
    delivery_location: "On board vessel"
    vessel_loading_by_seller: true

  related_rules:
    - FAS
    - CFR
    - CIF
    - FCA
```

## Core concept

Under FOB, the seller delivers the goods on board the vessel nominated by the buyer at the named port of loading.

The buyer arranges the main carriage.

## Seller responsibilities

The seller generally:

* prepares and packages the goods;
* handles export clearance;
* delivers the goods on board;
* bears costs required to complete delivery under the rule;
* provides required documentation.

## Buyer responsibilities

The buyer generally:

* nominates the vessel;
* arranges the main carriage;
* assumes risk after the goods are on board;
* handles import clearance;
* pays applicable import duties and taxes.

## Risk transfer

Risk transfers when the goods are on board the vessel at the named port of loading.

## Insurance

FOB does not require seller-arranged cargo insurance.

The buyer should consider insurance because risk transfers at the loading port.

## Logistics interpretation

FOB is intended for sea and inland-waterway transport.

For containerized cargo, the logistics team should examine whether FCA better represents the physical point at which the seller hands the goods to the carrier.

## Common mistake

FOB is not a general-purpose rule for road, air or other non-sea transport.

---
