import { datasets, findDataset } from "../registry/datasets.js";
import type { DatasetDefinition } from "../types.js";
import { CivicDataError } from "../utils/errors.js";

export function resolveDataset(input: {
  dataset_id?: string;
  source_url?: string;
}): DatasetDefinition {
  if (input.dataset_id) {
    const dataset = findDataset(input.dataset_id);
    if (!dataset) {
      throw new CivicDataError(
        `Unknown dataset_id "${input.dataset_id}". Use search_datasets to discover supported datasets.`,
        "dataset_not_found",
        { dataset_id: input.dataset_id }
      );
    }
    return dataset;
  }

  if (input.source_url) {
    const normalized = normalizeUrl(input.source_url);
    const dataset = datasets.find((candidate) => {
      const urls = [
        candidate.source.url,
        candidate.provider.kind === "arcgis" ? candidate.provider.layerUrl : undefined,
        candidate.provider.kind === "carto" ? candidate.provider.baseUrl : undefined,
        candidate.provider.kind === "static" ? candidate.provider.url : undefined
      ].filter(Boolean) as string[];

      return urls.some((url) => normalizeUrl(url) === normalized);
    });

    if (!dataset) {
      throw new CivicDataError(
        "source_url did not match a curated registry entry. Use search_datasets first or add the dataset to src/registry/datasets.ts.",
        "dataset_not_found",
        { source_url: input.source_url }
      );
    }

    return dataset;
  }

  throw new CivicDataError("Provide dataset_id or source_url.", "validation_error");
}

function normalizeUrl(value: string): string {
  const url = new URL(value);
  url.hash = "";
  return url.toString().replace(/\/$/, "");
}
