import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { datasets } from "./registry/datasets.js";

export function registerResources(server: McpServer): void {
  server.registerResource(
    "philly-datasets",
    "philly://datasets",
    {
      title: "Philadelphia Civic Dataset Registry",
      description: "Curated registry of datasets supported by this MCP server.",
      mimeType: "application/json"
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(
            {
              datasets: datasets.map((dataset) => ({
                dataset_id: dataset.id,
                title: dataset.title,
                description: dataset.description,
                categories: dataset.categories,
                provider: dataset.provider.kind,
                capabilities: dataset.capabilities,
                source: dataset.source,
                formats: dataset.formats,
                update_frequency: dataset.updateFrequency,
                endpoint_status: dataset.endpointStatus,
                known_filters: dataset.knownFilters,
                warnings: dataset.warnings ?? []
              }))
            },
            null,
            2
          )
        }
      ]
    })
  );

  for (const dataset of datasets) {
    server.registerResource(
      `philly-dataset-${dataset.id}`,
      `philly://datasets/${dataset.id}`,
      {
        title: dataset.title,
        description: dataset.description,
        mimeType: "application/json"
      },
      async (uri) => ({
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(dataset, null, 2)
          }
        ]
      })
    );
  }
}
