import { describe, expect, it } from "vitest";
import {
  buildCensusGeocoderUrl,
  extractGeocodeMatches,
  normalizeAddress
} from "./geocode.js";

describe("normalizeAddress", () => {
  it("defaults bare street addresses to Philadelphia, PA", () => {
    expect(normalizeAddress("1400 John F Kennedy Blvd")).toBe(
      "1400 John F Kennedy Blvd, Philadelphia, PA"
    );
  });

  it("leaves addresses that already name Philadelphia alone", () => {
    expect(normalizeAddress("1400 JFK Blvd, Philadelphia, PA 19107")).toBe(
      "1400 JFK Blvd, Philadelphia, PA 19107"
    );
  });

  it("leaves addresses with an explicit PA state alone", () => {
    expect(normalizeAddress("100 Main St, Darby, PA")).toBe(
      "100 Main St, Darby, PA"
    );
  });

  it("collapses extra whitespace", () => {
    expect(normalizeAddress("  2714  S 78th   St ")).toBe(
      "2714 S 78th St, Philadelphia, PA"
    );
  });
});

describe("buildCensusGeocoderUrl", () => {
  it("targets the current public benchmark with json output", () => {
    const url = new URL(buildCensusGeocoderUrl("2714 S 78th St, Philadelphia, PA"));

    expect(url.hostname).toBe("geocoding.geo.census.gov");
    expect(url.searchParams.get("address")).toBe(
      "2714 S 78th St, Philadelphia, PA"
    );
    expect(url.searchParams.get("benchmark")).toBe("Public_AR_Current");
    expect(url.searchParams.get("format")).toBe("json");
  });
});

describe("extractGeocodeMatches", () => {
  it("maps census matches to lat/lon records", () => {
    const result = extractGeocodeMatches({
      result: {
        addressMatches: [
          {
            matchedAddress: "2714 S 78TH ST, PHILADELPHIA, PA, 19153",
            coordinates: { x: -75.2308, y: 39.9147 }
          }
        ]
      }
    });

    expect(result.matches).toEqual([
      {
        matched_address: "2714 S 78TH ST, PHILADELPHIA, PA, 19153",
        latitude: 39.9147,
        longitude: -75.2308
      }
    ]);
    expect(result.warnings).toEqual([]);
  });

  it("returns a warning instead of throwing on zero matches", () => {
    const result = extractGeocodeMatches({ result: { addressMatches: [] } });
    expect(result.matches).toEqual([]);
    expect(result.warnings[0]).toMatch(/No geocoder match/);
  });

  it("skips malformed matches and survives null payloads", () => {
    const result = extractGeocodeMatches({
      result: { addressMatches: [{ matchedAddress: "BROKEN" }] }
    });
    expect(result.matches).toEqual([]);
    expect(extractGeocodeMatches(null).matches).toEqual([]);
  });
});
