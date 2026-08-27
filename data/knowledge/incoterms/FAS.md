# 11. FAS — Free Alongside Ship

```yaml
incoterm:
  code: FAS
  name: Free Alongside Ship
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
    seller_delivers_to: "Alongside the vessel at the named port of loading"
    seller_loads_onto_vessel: false

  risk:
    transfer_point: "When goods are placed alongside the vessel at the named port of loading"
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
    delivery_location: "Alongside vessel"
    vessel_loading_by_seller: false

  related_rules:
    - FOB
    - CFR
    - CIF
```

## Core concept

Under FAS, the seller delivers the goods alongside the vessel at the named port of loading.

The buyer arranges the main carriage and assumes risk after delivery alongside the vessel.

## Seller responsibilities

The seller generally:

* prepares and packages the goods;
* transports them to the named port;
* completes export formalities;
* places the goods alongside the vessel;
* provides required documentation.

## Buyer responsibilities

The buyer generally:

* arranges the main carriage;
* handles loading onto the vessel;
* assumes risk after delivery alongside the vessel;
* handles import formalities.

## Risk transfer

Risk transfers when the goods are placed alongside the vessel at the named port.

## Insurance

FAS does not require seller-arranged cargo insurance.

## Logistics interpretation

FAS is specifically designed for sea and inland-waterway transport.

The exact location alongside the vessel should be established operationally.

## Common mistake

FAS means delivery **alongside** the vessel, not delivery **on board** the vessel.

---
