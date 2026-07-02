# philly-civic-data-mcp

Read-only Model Context Protocol server for discovering, inspecting, and querying a curated set of Philadelphia civic datasets.

This is a v1 MCP server, not a web app. It focuses on a small but useful provider pattern for OpenDataPhilly, Philadelphia CARTO SQL API tables, ArcGIS FeatureServer layers, and static GeoJSON files.

## What It Does

The server exposes MCP tools that let AI clients:

- Search supported Philadelphia civic datasets.
- Inspect field schemas, geometry type, known filters, and sample records.
- Query records with safe default and maximum limits.
- Ask for nearby spatial records by latitude, longitude, and radius.
- Fetch common civic boundaries by name or ID.
- Get guidance for natural-language civic data questions without hallucinating an answer.

The server also exposes MCP resources:

- `philly://datasets`
- `philly://datasets/{dataset_id}`

## Installation

Requirements:

- Node.js 20+
- npm

Install dependencies and build:

```bash
npm install
npm run build
```

Run locally over stdio:

```bash
npm start
```

For development:

```bash
npm run dev
```

## Development Commands

```bash
npm test
npm run typecheck
npm run build
```

## MCP Client Configuration

After building, point your MCP client at the compiled stdio server.

Example local configuration:

```json
{
  "mcpServers": {
    "philly-civic-data": {
      "command": "node",
      "args": ["/Users/darrenmims/Desktop/PhillyMCP/dist/index.js"]
    }
  }
}
```

If you install or link the package as a command, you can use:

```json
{
  "mcpServers": {
    "philly-civic-data": {
      "command": "philly-civic-data-mcp"
    }
  }
}
```

## Tools

### `search_datasets`

Input:

```json
{
  "keyword": "permit",
  "category": "Planning",
  "limit": 5
}
```

Returns matching registry metadata, source attribution, available formats, update-frequency notes when known, endpoint status, and warnings.

### `get_dataset_schema`

Input:

```json
{
  "dataset_id": "building_permits"
}
```

You can also pass a `source_url` that exactly matches a curated registry source or endpoint URL.

### `query_dataset`

Input:

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

Input:

```json
{
  "dataset_id": "vacant_property_indicators_points",
  "latitude": 39.9526,
  "longitude": -75.1652,
  "radius_meters": 500,
  "limit": 10
}
```

ArcGIS datasets use ArcGIS geometry queries first. CARTO datasets use PostGIS distance queries. Static GeoJSON datasets use local centroid distance calculations.

### `get_boundary`

Input:

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

### `civic_question_helper`

Input:

```json
{
  "question": "What permits and violations are near this property?"
}
```

Returns suggested datasets, likely joins, caveats, and recommended follow-up MCP tool calls. It does not invent answers.

## Dataset Coverage

The v1 registry includes:

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

Source pages used for the initial registry:

- [OpenDataPhilly datasets](https://opendataphilly.org/datasets/)
- [311 Service and Information Requests](https://opendataphilly.org/datasets/311-service-and-information-requests/)
- [L&I Building and Zoning Permits](https://opendataphilly.org/datasets/licenses-and-inspections-building-and-zoning-permits/)
- [L&I Code Violations](https://opendataphilly.org/datasets/licenses-and-inspections-code-violations/)
- [Philadelphia Properties and Assessment History](https://opendataphilly.org/datasets/philadelphia-properties-and-assessment-history/)
- [Philadelphia Neighborhoods](https://opendataphilly.org/datasets/philadelphia-neighborhoods/)
- [City Council Districts](https://opendataphilly.org/datasets/city-council-districts/)
- [ZIP Codes](https://opendataphilly.org/datasets/zip-codes/)
- [Police Districts](https://opendataphilly.org/datasets/police-districts/)
- [Vacant Property Indicators](https://opendataphilly.org/datasets/vacant-property-indicators/)

## Known Limitations

- The registry is hand-curated. It is not a full OpenDataPhilly crawler.
- The server does not perform cross-dataset joins yet. Use `civic_question_helper` to plan joins and call tools in sequence.
- Boundary-scoped queries are not yet polygon-intersection joins across providers.
- CARTO filters are translated to SQL with identifier validation and literal escaping, but only a small operator set is supported.
- ArcGIS date filters may require field-specific formatting for some layers.
- Large upstream datasets can be slow or rate-limited. The server returns warnings or explicit errors instead of silently hiding incomplete data.
- Dataset update frequency comes from catalog metadata when available. The MCP does not independently verify freshness of every record.

## How To Add A Dataset

1. Add a `DatasetDefinition` to `src/registry/datasets.ts`.
2. Choose a provider:
   - `carto` for `https://phl.carto.com/api/v2/sql` tables.
   - `arcgis` for FeatureServer layer URLs ending in `/FeatureServer/{layer}`.
   - `static` for GeoJSON FeatureCollections.
3. Include source attribution, formats, endpoint status, known filters, and warnings.
4. If it is a boundary dataset, add a `boundary` config with type, name fields, and ID fields.
5. Run:

```bash
npm test
npm run typecheck
npm run build
```

## Docker

Build:

```bash
docker build -t philly-civic-data-mcp .
```

Run as a stdio MCP server:

```bash
docker run --rm -i philly-civic-data-mcp
```

Most desktop MCP clients launch stdio servers directly from the host, so Docker is mainly useful for testing or controlled deployments.
