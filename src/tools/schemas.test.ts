import { describe, expect, it } from "vitest";
import { clampLimit, clampRadius, MAX_LIMIT, MAX_RADIUS_METERS } from "../utils/limits.js";
import { queryDatasetSchema, queryNearbySchema } from "./schemas.js";

describe("tool validation", () => {
  it("accepts primitive and operator filters", () => {
    const parsed = queryDatasetSchema.parse({
      dataset_id: "311_service_requests",
      filters: {
        status: "Open",
        requested_datetime: { gte: "2026-01-01" },
        zipcode: ["19104", "19103"]
      }
    });

    expect(parsed.limit).toBe(25);
    expect(parsed.filters.status).toBe("Open");
  });

  it("validates latitude and longitude ranges", () => {
    expect(() =>
      queryNearbySchema.parse({
        dataset_id: "311_service_requests",
        latitude: 95,
        longitude: -75.16
      })
    ).toThrow();
  });

  it("clamps unsafe limit and radius values with warnings", () => {
    const limit = clampLimit(1000);
    const radius = clampRadius(25000);

    expect(limit.limit).toBe(MAX_LIMIT);
    expect(limit.warnings[0]).toContain("reduced");
    expect(radius.radiusMeters).toBe(MAX_RADIUS_METERS);
    expect(radius.warnings[0]).toContain("reduced");
  });
});
