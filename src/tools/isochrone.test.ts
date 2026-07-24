import { describe, expect, it } from "vitest";
import {
  DEFAULT_VALHALLA_URL,
  buildOrsRequest,
  buildValhallaRequestUrl,
  extractIsochronePolygon,
  pickIsochroneProvider
} from "./isochrone.js";

const WALK_INPUT = {
  latitude: 39.9526,
  longitude: -75.1652,
  mode: "walk" as const,
  minutes: 15
};

describe("pickIsochroneProvider", () => {
  it("defaults to valhalla with no configuration", () => {
    expect(pickIsochroneProvider({})).toBe("valhalla");
  });

  it("prefers ors when an API key is present", () => {
    expect(pickIsochroneProvider({ orsApiKey: "key" })).toBe("ors");
  });

  it("honors an explicit valhalla override even with an ors key", () => {
    expect(
      pickIsochroneProvider({ provider: "valhalla", orsApiKey: "key" })
    ).toBe("valhalla");
  });

  it("rejects ors without an API key", () => {
    expect(() => pickIsochroneProvider({ provider: "ors" })).toThrowError(
      /PHILLY_MCP_ORS_API_KEY/
    );
  });

  it("rejects unknown providers", () => {
    expect(() => pickIsochroneProvider({ provider: "google" })).toThrowError(
      /Unsupported isochrone provider/
    );
  });
});

describe("buildValhallaRequestUrl", () => {
  it("encodes the origin, costing, and contour", () => {
    const url = new URL(buildValhallaRequestUrl(WALK_INPUT, DEFAULT_VALHALLA_URL));
    const request = JSON.parse(url.searchParams.get("json") ?? "{}");

    expect(url.pathname).toBe("/isochrone");
    expect(request.locations).toEqual([{ lat: 39.9526, lon: -75.1652 }]);
    expect(request.costing).toBe("pedestrian");
    expect(request.contours).toEqual([{ time: 15 }]);
    expect(request.polygons).toBe(true);
  });

  it("maps drive mode to auto costing", () => {
    const url = new URL(
      buildValhallaRequestUrl(
        { ...WALK_INPUT, mode: "drive" },
        DEFAULT_VALHALLA_URL
      )
    );
    const request = JSON.parse(url.searchParams.get("json") ?? "{}");
    expect(request.costing).toBe("auto");
  });
});

describe("buildOrsRequest", () => {
  it("builds a POST with lon/lat order and seconds", () => {
    const request = buildOrsRequest(WALK_INPUT, "test-key");
    const body = JSON.parse(request.body);

    expect(request.url).toContain("/v2/isochrones/foot-walking");
    expect(request.headers.authorization).toBe("test-key");
    expect(body.locations).toEqual([[-75.1652, 39.9526]]);
    expect(body.range).toEqual([900]);
    expect(body.range_type).toBe("time");
  });
});

describe("extractIsochronePolygon", () => {
  it("returns the polygon geometry from a feature collection", () => {
    const polygon = {
      type: "Polygon",
      coordinates: [
        [
          [-75.17, 39.95],
          [-75.16, 39.95],
          [-75.16, 39.96],
          [-75.17, 39.95]
        ]
      ]
    };
    const result = extractIsochronePolygon({
      type: "FeatureCollection",
      features: [{ type: "Feature", geometry: polygon }]
    });

    expect(result.polygon).toEqual(polygon);
    expect(result.warnings).toEqual([]);
  });

  it("warns when several contours come back and keeps the first", () => {
    const geometry = (longitude: number) => ({
      type: "Polygon",
      coordinates: [[[longitude, 39.95], [longitude + 0.01, 39.95], [longitude, 39.96], [longitude, 39.95]]]
    });
    const result = extractIsochronePolygon({
      features: [
        { type: "Feature", geometry: geometry(-75.17) },
        { type: "Feature", geometry: geometry(-75.2) }
      ]
    });

    expect(result.polygon).toEqual(geometry(-75.17));
    expect(result.warnings).toHaveLength(1);
  });

  it("rejects responses without polygons", () => {
    expect(() =>
      extractIsochronePolygon({
        features: [
          { type: "Feature", geometry: { type: "LineString", coordinates: [] } }
        ]
      })
    ).toThrowError(/no polygon/);
    expect(() => extractIsochronePolygon(null)).toThrowError(/no polygon/);
  });
});
