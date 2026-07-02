# TODO

## Registry Expansion

- Add crash data once the current PennDOT or city-hosted source and field schema are confirmed.
- Add city-owned properties or parcel ownership datasets with clear caveats about owner and mailing fields.
- Add street closures or paving/street work data if a stable endpoint is available.
- Add L&I complaints and unsafe/imminently dangerous buildings as separate registry entries.
- Add vacant property land and building polygon layers alongside the point layer.

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
