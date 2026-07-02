import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { searchDatasets } from "../registry/datasets.js";
import { providerFor } from "../providers/index.js";
import { clampLimit, clampRadius } from "../utils/limits.js";
import { getBoundary } from "./boundary.js";
import { buildCivicQuestionHelp } from "./civicQuestionHelper.js";
import { errorToolResult, jsonToolResult } from "./result.js";
import { resolveDataset } from "./resolve.js";
import {
  civicQuestionHelperSchema,
  getBoundaryShape,
  getBoundarySchema,
  getDatasetSchemaShape,
  getDatasetSchemaSchema,
  queryDatasetSchema,
  queryNearbySchema,
  searchDatasetsSchema
} from "./schemas.js";

export function registerTools(server: McpServer): void {
  server.registerTool(
    "search_datasets",
    {
      title: "Search Philadelphia Datasets",
      description:
        "Search the curated Philadelphia civic dataset registry by keyword and optional category.",
      inputSchema: searchDatasetsSchema.shape,
      annotations: {
        readOnlyHint: true,
        openWorldHint: true
      }
    },
    async (args) =>
      guarded(async () => {
        const input = searchDatasetsSchema.parse(args);
        const limit = clampLimit(input.limit, 10);
        const results = searchDatasets({
          keyword: input.keyword,
          category: input.category,
          limit: limit.limit
        });

        return {
          query: {
            keyword: input.keyword,
            category: input.category,
            limit: limit.limit
          },
          results,
          warnings: limit.warnings,
          retrieved_at: new Date().toISOString()
        };
      })
  );

  server.registerTool(
    "get_dataset_schema",
    {
      title: "Get Dataset Schema",
      description:
        "Inspect fields, geometry type, known filters, and a sample record for a supported dataset.",
      inputSchema: getDatasetSchemaShape,
      annotations: {
        readOnlyHint: true,
        openWorldHint: true
      }
    },
    async (args) =>
      guarded(async () => {
        const input = getDatasetSchemaSchema.parse(args);
        const dataset = resolveDataset(input);
        return providerFor(dataset).getSchema(dataset);
      })
  );

  server.registerTool(
    "query_dataset",
    {
      title: "Query Dataset",
      description:
        "Query records from a supported Philadelphia civic dataset with safe limits, filters, fields, offset, and ordering.",
      inputSchema: queryDatasetSchema.shape,
      annotations: {
        readOnlyHint: true,
        openWorldHint: true
      }
    },
    async (args) =>
      guarded(async () => {
        const input = queryDatasetSchema.parse(args);
        const dataset = resolveDataset({ dataset_id: input.dataset_id });
        const limit = clampLimit(input.limit);
        const result = await providerFor(dataset).query(dataset, {
          filters: input.filters,
          fields: input.fields,
          limit: limit.limit,
          offset: input.offset,
          orderBy: input.order_by
        });

        return {
          ...result,
          warnings: [...limit.warnings, ...result.warnings]
        };
      })
  );

  server.registerTool(
    "query_nearby",
    {
      title: "Query Nearby",
      description:
        "Find nearby records for a spatial dataset using ArcGIS geometry queries or provider-specific distance logic.",
      inputSchema: queryNearbySchema.shape,
      annotations: {
        readOnlyHint: true,
        openWorldHint: true
      }
    },
    async (args) =>
      guarded(async () => {
        const input = queryNearbySchema.parse(args);
        const dataset = resolveDataset({ dataset_id: input.dataset_id });
        const limit = clampLimit(input.limit);
        const radius = clampRadius(input.radius_meters);
        const result = await providerFor(dataset).queryNearby(dataset, {
          latitude: input.latitude,
          longitude: input.longitude,
          radiusMeters: radius.radiusMeters,
          limit: limit.limit,
          filters: input.filters
        });

        return {
          ...result,
          warnings: [...limit.warnings, ...radius.warnings, ...result.warnings]
        };
      })
  );

  server.registerTool(
    "get_boundary",
    {
      title: "Get Civic Boundary",
      description:
        "Fetch a Philadelphia neighborhood, council district, ZIP, or police district boundary by name or id.",
      inputSchema: getBoundaryShape,
      annotations: {
        readOnlyHint: true,
        openWorldHint: true
      }
    },
    async (args) =>
      guarded(async () => {
        const input = getBoundarySchema.parse(args);
        return getBoundary(input);
      })
  );

  server.registerTool(
    "civic_question_helper",
    {
      title: "Civic Question Helper",
      description:
        "Suggest datasets, caveats, joins, and follow-up tool calls for a natural-language civic data question.",
      inputSchema: civicQuestionHelperSchema.shape,
      annotations: {
        readOnlyHint: true,
        openWorldHint: false
      }
    },
    async (args) =>
      guarded(async () => {
        const input = civicQuestionHelperSchema.parse(args);
        return buildCivicQuestionHelp(input.question);
      })
  );
}

async function guarded(
  callback: () => Promise<unknown> | unknown
) {
  try {
    return jsonToolResult(await callback());
  } catch (error) {
    return errorToolResult(error);
  }
}
