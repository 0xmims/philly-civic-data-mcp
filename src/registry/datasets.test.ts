import { describe, expect, it } from "vitest";
import { datasets, searchDatasets } from "./datasets.js";

describe("dataset registry", () => {
  it("contains a useful v1 registry with unique IDs", () => {
    expect(datasets.length).toBeGreaterThanOrEqual(5);

    const ids = datasets.map((dataset) => dataset.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("marks endpoint verification status explicitly", () => {
    expect(
      datasets.every((dataset) =>
        ["verified", "needs_verification"].includes(dataset.endpointStatus)
      )
    ).toBe(true);
  });

  it("declares provider capabilities for every dataset", () => {
    expect(
      datasets.every(
        (dataset) =>
          dataset.capabilities.supportsSchema &&
          dataset.capabilities.supportsQuery &&
          dataset.capabilities.maxRecommendedLimit > 0
      )
    ).toBe(true);
  });

  it("searches across title, tags, descriptions, and filters", () => {
    const results = searchDatasets({ keyword: "311", limit: 3 });

    expect(results[0]?.dataset_id).toBe("311_service_requests");
    expect(results[0]?.source.url).toContain("opendataphilly.org");
  });
});
