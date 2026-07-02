# philly-civic-data-mcp

Read-only Model Context Protocol server for discovering, inspecting, querying, and planning work with Philadelphia civic datasets.

The MCP server is the product. This repository also includes a Next.js documentation and landing site under `site/`, but the site is only for developer discovery and docs. It is not a replacement for the MCP server and does not write to civic data sources.

## What It Does

`philly-civic-data-mcp` exposes Philadelphia public data to AI clients through source-attributed MCP tools and resources. It focuses on a small, curated registry backed by OpenDataPhilly, Philadelphia ArcGIS/Open Data FeatureServer layers, CARTO SQL API tables, and static GeoJSON fallback sources.

The server can:

- Search supported datasets.
- Inspect fields, geometry type, known filters, provider capabilities, and sample records.
- Query records with filters, fields, limits, offsets, and ordering.
- Query nearby spatial records.
- Fetch common civic boundaries.
- Aggregate supported datasets by count, count distinct, group fields, and date buckets.
- Query supported spatial datasets inside a known civic boundary.
- Suggest datasets, joins, caveats, and follow-up tool calls for natural-language civic questions.

Every query-style tool returns source attribution, warnings, and `retrieved_at`. The server enforces safe limits and avoids silent incomplete-data responses.

## Installation

Requirements:

- Node.js 20+
- npm

```bash
npm install
npm run build
```

Run locally over stdio:

```bash
npm start
```

Development:

```bash
npm run dev
npm test
npm run typecheck
npm run build
```

Manual live endpoint verification, not part of normal CI:

```bash
npm run verify:registry
```

The verification script prints a JSON summary to stderr.

## Website

The docs/landing website lives in `site/`. It is a Next.js app for explaining Philadelphia Data MCP, helping developers understand the available tools, and giving the project a polished public face on GitHub.

Current pages:

- `/` is the landing page with the MCP overview, dataset highlights, tool examples, and access CTA.
- `/docs` is the documentation page with the MCP explanation, dataset coverage, setup guidance, and example requests.

Run the website locally:

```bash
cd site
npm install
npm run dev
```

Then open `http://127.0.0.1:3000`.

Validate the website:

```bash
npm run typecheck
npm run build
```

Decorative Philadelphia background props are copied into `site/public/assets/philly-props/` for the running site and mirrored in `public/assets/philly-props/` at the repo root. Source code should reference them only with public-relative paths such as `/assets/philly-props/septa-key-card.png`.

The website should describe and promote the MCP server. Keep it aligned with the actual registry and tools, and keep decorative civic/transit imagery subtle so it does not imply an official endorsement.

## MCP Client Configuration

After building, point your MCP client at the compiled stdio server.

```json
{
  "mcpServers": {
    "philly-civic-data": {
      "command": "node",
      "args": ["/absolute/path/to/philly-civic-data-mcp/dist/index.js"]
    }
  }
}
```

If installed or linked as a command:

```json
{
  "mcpServers": {
    "philly-civic-data": {
      "command": "philly-civic-data-mcp"
    }
  }
}
```

## MCP Resources

- `philly://datasets`
- `philly://datasets/{dataset_id}`

## MCP Tools

### `search_datasets`

```json
{
  "keyword": "permit",
  "category": "Planning",
  "limit": 5
}
```

Returns registry metadata, source attribution, available formats, provider capabilities, update-frequency notes when known, endpoint status, and warnings.

### `get_dataset_schema`

```json
{
  "dataset_id": "building_permits"
}
```

Returns fields, types, geometry type, known filters, sample record, provider capabilities, cache metadata, source attribution, warnings, and `retrieved_at`. Schema results are cached in memory for five minutes by dataset ID. Failed schema requests are not cached.

### `query_dataset`

```json
{
  "dataset_id": "311_service_requests",
  "filters": {
    "requested_datetime": { "gte": "2026-01-01" },
    "zipcode": "19104"
  },
  "fields": ["service_request_id", "status", "service_name", "requested_datetime", "address", "zipcode"],
  "limit": 25,
  "order_by": "requested_datetime desc"
}
```

Supported filter forms:

```json
{
  "field": "value",
  "field2": ["a", "b"],
  "field3": { "gte": "2026-01-01" },
  "field4": { "like": "%trash%" }
}
```

Supported operators are `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `in`, and `like`.

### `query_nearby`

```json
{
  "dataset_id": "vacant_property_indicators_points",
  "latitude": 39.9526,
  "longitude": -75.1652,
  "radius_meters": 500,
  "limit": 10
}
```

ArcGIS datasets use ArcGIS geometry queries. CARTO datasets use PostGIS distance queries. Static GeoJSON datasets use local point or centroid distance calculations and include warnings.

### `get_boundary`

```json
{
  "boundary_type": "zip",
  "id": "19120"
}
```

Supported boundary types:

- `neighborhood`
- `council_district`
- `zip`
- `police_district`

### `aggregate_dataset`

```json
{
  "dataset_id": "311_service_requests",
  "filters": {
    "requested_datetime": { "gte": "2026-01-01" }
  },
  "group_by": ["service_name"],
  "metrics": [{ "op": "count", "as": "case_count" }],
  "date_bucket": {
    "field": "requested_datetime",
    "interval": "month"
  },
  "limit": 25,
  "order_by": "case_count desc"
}
```

CARTO aggregation uses validated SQL identifiers and safe literals. Static GeoJSON aggregation runs locally over loaded features. ArcGIS aggregation returns an explicit v2 unsupported warning rather than pretending to aggregate.

### `query_within_boundary`

```json
{
  "dataset_id": "building_permits",
  "boundary_type": "zip",
  "boundary_id": "19120",
  "filters": {},
  "fields": ["permitnumber", "permittype", "permitissuedate", "address", "zip"],
  "limit": 25
}
```

The tool resolves the boundary first, then uses provider-specific spatial filtering when supported. CARTO uses PostGIS `ST_Intersects`. ArcGIS uses polygon spatial queries. Static GeoJSON uses point or centroid-in-polygon fallback with a warning.

### `civic_question_helper`

```json
{
  "question": "How many 311 trash requests were opened by ZIP last month?"
}
```

Returns suggested datasets, likely joins, caveats, and recommended follow-up MCP tool calls. It does not answer the civic question itself.

## Dataset Coverage

| Dataset ID | Provider | Source |
| --- | --- | --- |
| `311_service_requests` | CARTO | OpenDataPhilly 311 service requests |
| `property_assessments` | CARTO | OPA property assessments |
| `building_permits` | CARTO | L&I building and zoning permits |
| `li_violations` | CARTO | L&I code violations |
| `building_demolitions` | CARTO | Building demolitions |
| `vacant_property_indicators_points` | ArcGIS | Vacant property indicators |
| `neighborhood_boundaries` | Static GeoJSON | Philadelphia neighborhoods |
| `council_districts_2024` | ArcGIS | City Council districts |
| `zip_code_boundaries` | ArcGIS | ZIP Code polygons |
| `police_district_boundaries` | ArcGIS | Police districts |

Source pages used for the registry:

- [OpenDataPhilly datasets](https://opendataphilly.org/datasets/)
- [311 Service and Information Requests](https://opendataphilly.org/datasets/311-service-and-information-requests/)
- [L&I Building and Zoning Permits](https://opendataphilly.org/datasets/licenses-and-inspections-building-and-zoning-permits/)
- [L&I Code Violations](https://opendataphilly.org/datasets/licenses-and-inspections-code-violations/)
- [Philadelphia Properties and Assessment History](https://opendataphilly.org/datasets/philadelphia-properties-and-assessment-history/)
- [Building Demolitions](https://opendataphilly.org/datasets/building-demolitions/)
- [Philadelphia Neighborhoods](https://opendataphilly.org/datasets/philadelphia-neighborhoods/)
- [City Council Districts](https://opendataphilly.org/datasets/city-council-districts/)
- [ZIP Codes](https://opendataphilly.org/datasets/zip-codes/)
- [Police Districts](https://opendataphilly.org/datasets/police-districts/)
- [Vacant Property Indicators](https://opendataphilly.org/datasets/vacant-property-indicators/)

## Known Limitations

- The registry is hand-curated and is not a complete OpenDataPhilly crawler.
- Dataset update frequency comes from catalog metadata when available. The MCP does not independently certify record freshness.
- Provider capabilities describe implemented MCP behavior, not guarantees about upstream completeness or uptime.
- ArcGIS aggregation is not implemented in v2. The tool returns an explicit unsupported warning for ArcGIS datasets.
- Boundary filtering is provider-specific. CARTO and ArcGIS use spatial query support; static GeoJSON uses point or centroid fallback and warns that it is not full polygon intersection.
- Cross-dataset joins are not performed automatically. Use `civic_question_helper` to plan joins and call tools in sequence.
- ArcGIS date filters may require field-specific formatting.
- CARTO filters and aggregation validate identifiers and escape literals, but only a small operator and metric set is supported.
- Very large upstream datasets may be slow or rate-limited. The server uses request timeouts, retries transient failures, and returns warnings or explicit errors.
- Schema cache is in-memory only and resets when the MCP process restarts.
- No secrets or write operations are used or required.

## V2 Roadmap

- Add ArcGIS statistics/groupBy support where the layer metadata supports it safely.
- Add stronger polygon intersection for static GeoJSON or adopt a proven geospatial library.
- Add field bundles for sensitive or high-volume datasets.
- Add pagination guidance and total count helpers.
- Expand registry coverage for crashes, street closures, city-owned properties, unsafe buildings, and vacant-property polygons.
- Add optional scheduled live endpoint verification outside normal CI.
- Add more example prompts and join recipes for property due diligence, district analysis, 311 trends, and neighborhood lookup.

## How To Add A Dataset

1. Add a `DatasetDefinition` to `src/registry/datasets.ts`.
2. Choose a provider:
   - `carto` for `https://phl.carto.com/api/v2/sql` tables.
   - `arcgis` for FeatureServer layer URLs ending in `/FeatureServer/{layer}`.
   - `static` for GeoJSON FeatureCollections.
3. Include source attribution, formats, endpoint status, known filters, provider capabilities, and warnings.
4. If it is a boundary dataset, add a `boundary` config with type, name fields, and ID fields.
5. Run:

```bash
npm test
npm run typecheck
npm run build
```

## Docker

```bash
docker build -t philly-civic-data-mcp .
docker run --rm -i philly-civic-data-mcp
```

Most desktop MCP clients launch stdio servers directly from the host, so Docker is mainly useful for testing or controlled deployments.
