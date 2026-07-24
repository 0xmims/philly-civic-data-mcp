# TODO

## Registry Expansion

- Add crash data once the current PennDOT or city-hosted source and field schema are confirmed.
- City-owned properties / Land Bank inventory: the OpenDataPhilly "City Owned Properties" dataset is an archived 2015 PHDC snapshot with no updates — do not add until a live source exists.
- Add street closures or paving/street work data if a stable endpoint is available.
- Add vacant property land and building polygon layers alongside the point layer.
- Parcel-level tax delinquencies: the CARTO `real_estate_tax_delinquencies` table froze in June 2022 and the current real-estate-tax-balances product only publishes ZIP/council/tract aggregates — add an aggregate layer or wait for a parcel-level source.
- L&I court appeals: both `court_appeals` and `li_court_appeals` CARTO tables froze in February 2020 — skip until refreshed.
- Add zoning overlay districts alongside `zoning_base_districts`.
- Add a geocoded join path for `building_certifications` (address/`bin` → OPA parcel) so certification questions can become spatial without manual joins.
- Add historic district polygons alongside `registered_historic_properties`, and find a fresher source than the 2017 catalog copy.

## Isochrones

- Self-host Valhalla with a Philadelphia OSM extract to drop the public-demo fair-use dependency.
- Add transit isochrones (OpenTripPlanner or r5 with SEPTA GTFS) — the most valuable mode for Philadelphia and unsupported by Valhalla/ORS public APIs.
- Support multiple contours per request (e.g. 5/10/15 minutes) once display needs emerge.

## Query Capabilities

- Improve polygon intersection support for static GeoJSON beyond centroid fallback.
- Add provider-aware date filter helpers for ArcGIS date fields.
- Add ArcGIS statistics/groupBy support where layer metadata supports it safely.
- Add field allowlists or suggested field bundles for sensitive/high-volume datasets.
- Add pagination guidance in tool responses when more records are available.

## Reliability

- Add integration tests behind an opt-in environment flag for live CARTO and ArcGIS endpoints.
- Add upstream rate-limit detection with retry-after support.
- Add scheduled registry verification as a separate, non-required GitHub Action.
- Add cache metrics or debug-only cache inspection without logging to stdout in MCP mode.

## Documentation

- Add more example prompts by use case: resident services, property due diligence, district analysis, and neighborhood lookup.
- Document each registry entry's best filters and fields.
- Add examples for common joins, such as property assessment plus permits by `opa_account_num` or parcel identifier.
- Add website deployment notes once hosting is chosen.
