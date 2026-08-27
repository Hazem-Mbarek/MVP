# 5. FCA — Free Carrier

```yaml
incoterm:
  code: FCA
  name: Free Carrier
  version: 2020
  category: F
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
    description: "Named place of delivery."

  delivery:
    seller_delivers_to: "Carrier or another party nominated by the buyer at the agreed delivery point"
    seller_loads_onto_collecting_vehicle: "Depends on the named delivery point and FCA arrangement"

  risk:
    transfer_point: "When delivery is completed at the agreed FCA delivery point"
    transfer_stage: "At the agreed delivery point"

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
    buyer_responsibility_level: medium_high

  related_rules:
    - EXW
    - CPT
    - CIP
    - FOB
```

## Core concept

Under FCA, the seller delivers the goods to the carrier or another party nominated by the buyer at the agreed location.

FCA can be structured around delivery at the seller's premises or at another named location, so the precise named place is operationally important.

## Seller responsibilities

The seller generally:

* prepares and packages the goods;
* completes export formalities;
* delivers the goods according to the agreed FCA arrangement;
* provides required documentation.

## Buyer responsibilities

The buyer generally:

* nominates or arranges the carrier;
* arranges the main carriage;
* handles import formalities;
* pays applicable import duties and taxes;
* assumes risk after delivery under FCA.

## Risk transfer

Risk transfers when the seller has completed delivery at the agreed FCA delivery point.

The exact physical point depends on the named location and the agreed delivery arrangement.

## Insurance

FCA does not require the seller to arrange cargo insurance.

## Customs

The seller is responsible for export clearance.

The buyer generally handles import clearance.

## Logistics interpretation

FCA is useful when the buyer wants control over the main transportation while requiring the seller to complete export formalities and deliver the goods to the nominated carrier or agreed location.

## Common mistake

Do not assume that every FCA shipment is delivered in the same physical manner. The named place determines the operational delivery arrangement.

---
