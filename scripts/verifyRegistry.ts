import { datasets } from "../src/registry/datasets.js";
import { providerFor } from "../src/providers/index.js";
import { toErrorMessage } from "../src/utils/errors.js";

interface DatasetVerification {
  dataset_id: string;
  provider: string;
  endpoint_status: string;
  schema_ok: boolean;
  query_ok: boolean;
  warnings: string[];
  error?: string;
}

const results: DatasetVerification[] = [];

for (const dataset of datasets) {
  const provider = providerFor(dataset);
  const result: DatasetVerification = {
    dataset_id: dataset.id,
    provider: dataset.provider.kind,
    endpoint_status: dataset.endpointStatus,
    schema_ok: false,
    query_ok: false,
    warnings: []
  };

  try {
    const schema = await provider.getSchema(dataset);
    result.schema_ok = true;
    result.warnings.push(...schema.warnings);

    const query = await provider.query(dataset, {
      filters: {},
      fields: ["*"],
      limit: 1
    });
    result.query_ok = true;
    result.warnings.push(...query.warnings);
  } catch (error) {
    result.error = toErrorMessage(error);
  }

  result.warnings = Array.from(new Set(result.warnings));
  results.push(result);
}

const summary = {
  checked_at: new Date().toISOString(),
  dataset_count: datasets.length,
  ok_count: results.filter((result) => result.schema_ok && result.query_ok).length,
  results
};

console.error(JSON.stringify(summary, null, 2));
