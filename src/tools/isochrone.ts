import { CivicDataError } from "../utils/errors.js";
import {
  isWithinPhiladelphiaBbox
} from "../utils/geo.js";
import { fetchJson } from "../utils/http.js";
import type { GetIsochroneInput } from "./schemas.js";

export type IsochroneMode = GetIsochroneInput["mode"];
export type IsochroneProviderName = "valhalla" | "ors";

export const DEFAULT_VALHALLA_URL = "https://valhalla1.openstreetmap.de";
const ORS_BASE_URL = "https://api.openrouteservice.org";
const ORS_MAX_MINUTES = 60;

const VALHALLA_COSTING: Record<IsochroneMode, string> = {
  walk: "pedestrian",
  bike: "bicycle",
  drive: "auto"
};

const ORS_PROFILE: Record<IsochroneMode, string> = {
  walk: "foot-walking",
  bike: "cycling-regular",
  drive: "driving-car"
};

export interface IsochroneEnv {
  provider?: string;
  valhallaUrl?: string;
  orsApiKey?: string;
}

export interface IsochroneResult {
  origin: { latitude: number; longitude: number };
  mode: IsochroneMode;
  minutes: number;
  provider: IsochroneProviderName;
  source: { name: string; url: string; attribution: string };
  polygon: unknown;
  warnings: string[];
  retrieved_at: string;
}

export function envFromProcess(): IsochroneEnv {
  return {
    provider: process.env.PHILLY_MCP_ISOCHRONE_PROVIDER,
    valhallaUrl: process.env.PHILLY_MCP_VALHALLA_URL,
    orsApiKey: process.env.PHILLY_MCP_ORS_API_KEY ?? process.env.ORS_API_KEY
  };
}

export function pickIsochroneProvider(env: IsochroneEnv): IsochroneProviderName {
  const requested = env.provider?.trim().toLowerCase();

  if (requested === "ors") {
    if (!env.orsApiKey) {
      throw new CivicDataError(
        "PHILLY_MCP_ISOCHRONE_PROVIDER is set to \"ors\" but no PHILLY_MCP_ORS_API_KEY is configured.",
        "isochrone_provider_misconfigured"
      );
    }
    return "ors";
  }

  if (requested === "valhalla") {
    return "valhalla";
  }

  if (requested) {
    throw new CivicDataError(
      `Unsupported isochrone provider "${env.provider}". Use "valhalla" or "ors".`,
      "isochrone_provider_misconfigured"
    );
  }

  return env.orsApiKey ? "ors" : "valhalla";
}

export function buildValhallaRequestUrl(
  input: GetIsochroneInput,
  baseUrl: string
): string {
  const request = {
    locations: [{ lat: input.latitude, lon: input.longitude }],
    costing: VALHALLA_COSTING[input.mode],
    contours: [{ time: input.minutes }],
    polygons: true
  };

  const url = new URL("/isochrone", baseUrl);
  url.searchParams.set("json", JSON.stringify(request));
  return url.toString();
}

export function buildOrsRequest(input: GetIsochroneInput, apiKey: string): {
  url: string;
  method: "POST";
  headers: Record<string, string>;
  body: string;
} {
  return {
    url: `${ORS_BASE_URL}/v2/isochrones/${ORS_PROFILE[input.mode]}`,
    method: "POST",
    headers: {
      authorization: apiKey,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      locations: [[input.longitude, input.latitude]],
      range: [input.minutes * 60],
      range_type: "time"
    })
  };
}

export function extractIsochronePolygon(payload: unknown): {
  polygon: unknown;
  warnings: string[];
} {
  const collection = payload as {
    features?: { geometry?: { type?: string } }[];
  } | null;

  const polygons = (collection?.features ?? [])
    .map((feature) => feature?.geometry)
    .filter(
      (geometry) =>
        geometry?.type === "Polygon" || geometry?.type === "MultiPolygon"
    );

  if (polygons.length === 0) {
    throw new CivicDataError(
      "The isochrone provider returned no polygon geometry.",
      "isochrone_no_polygon"
    );
  }

  const warnings =
    polygons.length > 1
      ? [
          `The provider returned ${polygons.length} polygon contours; only the first was kept.`
        ]
      : [];

  return { polygon: polygons[0], warnings };
}

export async function getIsochrone(
  input: GetIsochroneInput,
  env: IsochroneEnv = envFromProcess()
): Promise<IsochroneResult> {
  const provider = pickIsochroneProvider(env);
  const warnings: string[] = [
    "Isochrones are estimates from OpenStreetMap road-network data, not guarantees of actual travel time."
  ];

  if (!isWithinPhiladelphiaBbox(input)) {
    warnings.push(
      "The origin point appears to be outside Philadelphia. Registry datasets only cover Philadelphia."
    );
  }

  if (input.mode === "drive") {
    warnings.push("Drive-time isochrones are not traffic-aware.");
  }

  let minutes = input.minutes;
  let payload: unknown;
  let source: IsochroneResult["source"];

  if (provider === "ors") {
    if (minutes > ORS_MAX_MINUTES) {
      minutes = ORS_MAX_MINUTES;
      warnings.push(
        `OpenRouteService caps isochrone travel time at ${ORS_MAX_MINUTES} minutes; the request was reduced from ${input.minutes}.`
      );
    }
    const request = buildOrsRequest({ ...input, minutes }, env.orsApiKey ?? "");
    payload = await fetchJson(request.url, {
      method: request.method,
      headers: request.headers,
      body: request.body
    });
    source = {
      name: "OpenRouteService",
      url: "https://openrouteservice.org/",
      attribution:
        "openrouteservice.org by HeiGIT | Map data © OpenStreetMap contributors"
    };
  } else {
    const baseUrl = env.valhallaUrl ?? DEFAULT_VALHALLA_URL;
    payload = await fetchJson(buildValhallaRequestUrl({ ...input, minutes }, baseUrl));
    source = {
      name: "Valhalla",
      url: baseUrl,
      attribution:
        "Valhalla routing engine | Map data © OpenStreetMap contributors"
    };
    if (baseUrl === DEFAULT_VALHALLA_URL) {
      warnings.push(
        "Computed by the public FOSSGIS Valhalla instance (fair-use demo capacity). Set PHILLY_MCP_VALHALLA_URL to a self-hosted Valhalla, or PHILLY_MCP_ORS_API_KEY for OpenRouteService, for heavier use."
      );
    }
  }

  const extracted = extractIsochronePolygon(payload);

  return {
    origin: { latitude: input.latitude, longitude: input.longitude },
    mode: input.mode,
    minutes,
    provider,
    source,
    polygon: extracted.polygon,
    warnings: [...warnings, ...extracted.warnings],
    retrieved_at: new Date().toISOString()
  };
}
