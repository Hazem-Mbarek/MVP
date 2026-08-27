# 7. CIP — Carriage and Insurance Paid To

```yaml
incoterm:
  code: CIP
  name: Carriage and Insurance Paid To
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
    seller_provides_insurance: true
    buyer_should_consider_additional_insurance: "Depending on cargo, coverage and commercial requirements"

  destination:
    seller_unloads_at_destination: false

  operational_profile:
    seller_responsibility_level: medium
    buyer_responsibility_level: medium

  key_distinction:
    seller_pays_carriage: true
    seller_arranges_insurance: true
    risk_transfers_at_destination: false

  related_rules:
    - CPT
    - CIF
    - DAP
```

## Core concept

CIP is similar to CPT because the seller arranges and pays for carriage to the named destination and risk transfers when the goods are delivered to the carrier.

The additional feature is that the seller also arranges the insurance required under the rule.

## Seller responsibilities

The seller generally:

* prepares and packages the goods;
* completes export formalities;
* delivers the goods to the carrier;
* contracts and pays for carriage;
* arranges the required insurance;
* provides relevant documentation.

## Buyer responsibilities

The buyer generally:

* assumes risk after delivery to the carrier;
* handles import clearance;
* pays import duties and taxes where applicable;
* bears costs allocated to the buyer.

## Risk transfer

Risk transfers when the goods are delivered to the carrier.

The seller's obligation to arrange carriage and insurance does not mean that risk remains with the seller until destination.

## Insurance

Insurance is a defining feature of CIP.

The seller is required to arrange insurance according to the requirements applicable to CIP.

The buyer may need additional insurance depending on cargo characteristics, commercial requirements and desired coverage.

## Logistics interpretation

CIP can be useful when the seller is expected to arrange both transportation and insurance while the buyer accepts transportation risk from the carrier-delivery point.

## Common mistake

CIP should not be interpreted as "seller carries all risk until destination."

---
