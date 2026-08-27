# 4. EXW — Ex Works

```yaml
incoterm:
  code: EXW
  name: Ex Works
  version: 2020
  category: E
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
    description: "Named place of delivery, commonly the seller's premises or another agreed location."

  delivery:
    seller_delivers_to: "Buyer by making the goods available at the named place"
    seller_loads_onto_collecting_vehicle: false

  risk:
    transfer_point: "When the goods are placed at the buyer's disposal at the named place, ready for collection"
    transfer_stage: "Before main transportation"

  transportation:
    seller_arranges_main_carriage: false
    buyer_arranges_main_carriage: true

  customs:
    seller_handles_export_clearance: generally_false
    buyer_handles_export_clearance: generally_true
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
    seller_responsibility_level: low
    buyer_responsibility_level: high

  related_rules:
    - FCA
    - CPT
    - DAP
    - DDP
```

## Core concept

Under EXW, the seller has a relatively limited delivery obligation. The seller makes the goods available to the buyer at the agreed location.

The buyer generally takes responsibility for collecting the goods and arranging transportation from that point onward.

## Seller responsibilities

The seller generally:

* makes the goods available at the named place;
* provides the goods required under the sales contract;
* packages the goods appropriately;
* provides relevant information and documentation required from the seller.

## Buyer responsibilities

The buyer generally:

* arranges collection;
* arranges the main transportation;
* assumes risk from the delivery point;
* handles import formalities;
* handles transportation after the delivery point;
* bears costs allocated to the buyer.

## Risk transfer

Risk transfers when the goods are made available to the buyer at the named place, ready for collection.

The risk transfer occurs before the goods are loaded onto the collecting vehicle.

## Insurance

EXW does not require the seller to arrange cargo insurance.

The buyer should evaluate insurance because it assumes the transportation risk from an early point.

## Customs

EXW places substantial responsibility on the buyer, including export-related arrangements.

For international transactions, the parties should verify that the buyer can practically complete the required export formalities in the country of departure.

## Logistics interpretation

For a freight forwarder, EXW usually means that the buyer expects the logistics provider to arrange collection from the seller's location and subsequently manage the shipment.

The forwarder should obtain:

* exact pickup address;
* loading requirements;
* cargo dimensions;
* cargo weight;
* transport mode;
* destination;
* export-clearance requirements;
* pickup contact.

## Common mistake

EXW does not mean that the seller is responsible for delivering the shipment to the buyer's destination.

---
