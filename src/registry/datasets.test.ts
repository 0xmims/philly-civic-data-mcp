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

  it("includes the certification, appeals, transfer, and historic datasets", () => {
    const ids = new Set(datasets.map((dataset) => dataset.id));

    for (const id of [
      "building_certifications",
      "building_certification_summary",
      "li_appeals",
      "real_estate_transfers",
      "registered_historic_properties"
    ]) {
      expect(ids.has(id)).toBe(true);
    }
  });

  it("marks non-spatial CARTO tables as unsupported for spatial queries", () => {
    for (const id of ["building_certifications", "building_certification_summary"]) {
      const dataset = datasets.find((candidate) => candidate.id === id);
      expect(dataset?.capabilities.supportsNearby).toBe(false);
      expect(dataset?.capabilities.supportsBoundaryQuery).toBe(false);
      expect(dataset?.capabilities.geometryFormat).toBe("none");
      expect(
        dataset?.warnings?.some((warning) => warning.includes("no geometry"))
      ).toBe(true);
    }
  });
});
