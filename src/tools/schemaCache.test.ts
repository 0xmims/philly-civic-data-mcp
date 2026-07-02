import { describe, expect, it, vi } from "vitest";
import { datasets } from "../registry/datasets.js";
import type { Provider } from "../types.js";
import { SchemaCache } from "./schemaCache.js";

describe("SchemaCache", () => {
  it("caches successful schema lookups by dataset id until TTL expires", async () => {
    const dataset = datasets[0];
    const provider: Provider = {
      getSchema: vi.fn(async () => ({
        dataset_id: dataset.id,
        source: dataset.source,
        fields: [],
        known_filters: [],
        warnings: [],
        retrieved_at: "2026-01-01T00:00:00.000Z"
      })),
      query: vi.fn(),
      queryNearby: vi.fn(),
      aggregate: vi.fn(),
      queryWithinBoundary: vi.fn()
    };
    const cache = new SchemaCache(1000);

    const first = await cache.get(dataset, provider, 1000);
    const second = await cache.get(dataset, provider, 1500);
    const third = await cache.get(dataset, provider, 2501);

    expect(provider.getSchema).toHaveBeenCalledTimes(2);
    expect(first.cache?.hit).toBe(false);
    expect(second.cache?.hit).toBe(true);
    expect(third.cache?.hit).toBe(false);
  });

  it("does not cache failed schema lookups", async () => {
    const dataset = datasets[0];
    const provider: Provider = {
      getSchema: vi.fn(async () => {
        throw new Error("upstream failed");
      }),
      query: vi.fn(),
      queryNearby: vi.fn(),
      aggregate: vi.fn(),
      queryWithinBoundary: vi.fn()
    };
    const cache = new SchemaCache(1000);

    await expect(cache.get(dataset, provider, 1000)).rejects.toThrow("upstream failed");
    await expect(cache.get(dataset, provider, 1100)).rejects.toThrow("upstream failed");
    expect(provider.getSchema).toHaveBeenCalledTimes(2);
  });
});
