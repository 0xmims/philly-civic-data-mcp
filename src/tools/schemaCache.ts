import type {
  DatasetDefinition,
  DatasetSchemaResult,
  Provider
} from "../types.js";

export const DEFAULT_SCHEMA_CACHE_TTL_MS = 5 * 60 * 1000;

interface CacheEntry {
  value: DatasetSchemaResult;
  cachedAtMs: number;
  expiresAtMs: number;
}

export class SchemaCache {
  private readonly entries = new Map<string, CacheEntry>();

  constructor(private readonly ttlMs = DEFAULT_SCHEMA_CACHE_TTL_MS) {}

  async get(
    dataset: DatasetDefinition,
    provider: Provider,
    nowMs = Date.now()
  ): Promise<DatasetSchemaResult> {
    const entry = this.entries.get(dataset.id);

    if (entry && entry.expiresAtMs > nowMs) {
      return withCacheMetadata(entry.value, true, entry.cachedAtMs, entry.expiresAtMs);
    }

    const value = await provider.getSchema(dataset);
    const cachedAtMs = nowMs;
    const expiresAtMs = nowMs + this.ttlMs;
    const valueWithCapabilities = {
      ...value,
      capabilities: dataset.capabilities
    };
    this.entries.set(dataset.id, {
      value: valueWithCapabilities,
      cachedAtMs,
      expiresAtMs
    });

    return withCacheMetadata(valueWithCapabilities, false, cachedAtMs, expiresAtMs);
  }

  clear(): void {
    this.entries.clear();
  }
}

export const schemaCache = new SchemaCache();

function withCacheMetadata(
  value: DatasetSchemaResult,
  hit: boolean,
  cachedAtMs: number,
  expiresAtMs: number
): DatasetSchemaResult {
  return {
    ...value,
    cache: {
      hit,
      cached_at: new Date(cachedAtMs).toISOString(),
      expires_at: new Date(expiresAtMs).toISOString()
    }
  };
}
