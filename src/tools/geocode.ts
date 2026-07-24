import { isWithinPhiladelphiaBbox } from "../utils/geo.js";
import { fetchJson } from "../utils/http.js";
import type { GeocodeAddressInput } from "./schemas.js";

const CENSUS_GEOCODER_URL =
  "https://geocoding.geo.census.gov/geocoder/locations/onelineaddress";
const MAX_MATCHES = 5;

export interface GeocodeMatch {
  matched_address: string;
  latitude: number;
  longitude: number;
}

export interface GeocodeResult {
  query: {
    input_address: string;
    geocoded_address: string;
  };
  matches: GeocodeMatch[];
  source: { name: string; url: string; attribution: string };
  warnings: string[];
  retrieved_at: string;
}

// The registry is Philadelphia-only, so a bare street address defaults to
// Philadelphia, PA rather than letting the national geocoder guess a city.
export function normalizeAddress(address: string): string {
  const trimmed = address.trim().replace(/\s+/g, " ");
  return /philadelphia|,\s*pa\b/i.test(trimmed)
    ? trimmed
    : `${trimmed}, Philadelphia, PA`;
}

export function buildCensusGeocoderUrl(address: string): string {
  const url = new URL(CENSUS_GEOCODER_URL);
  url.searchParams.set("address", address);
  url.searchParams.set("benchmark", "Public_AR_Current");
  url.searchParams.set("format", "json");
  return url.toString();
}

export function extractGeocodeMatches(payload: unknown): {
  matches: GeocodeMatch[];
  warnings: string[];
} {
  const raw = (payload as {
    result?: {
      addressMatches?: {
        matchedAddress?: string;
        coordinates?: { x?: number; y?: number };
      }[];
    };
  } | null)?.result?.addressMatches;

  const matches: GeocodeMatch[] = [];
  for (const candidate of raw ?? []) {
    if (
      typeof candidate?.coordinates?.x === "number" &&
      typeof candidate.coordinates.y === "number"
    ) {
      matches.push({
        matched_address: candidate.matchedAddress ?? "",
        latitude: candidate.coordinates.y,
        longitude: candidate.coordinates.x
      });
    }
  }

  const warnings: string[] = [];
  if (matches.length === 0) {
    warnings.push(
      "No geocoder match. Check spelling, add a ZIP code, or use the full street type (St, Ave, Blvd)."
    );
  }
  if (matches.length > MAX_MATCHES) {
    warnings.push(
      `The geocoder returned ${matches.length} matches; only the first ${MAX_MATCHES} were kept.`
    );
  }

  return { matches: matches.slice(0, MAX_MATCHES), warnings };
}

export async function geocodeAddress(
  input: GeocodeAddressInput
): Promise<GeocodeResult> {
  const geocodedAddress = normalizeAddress(input.address);
  const payload = await fetchJson(buildCensusGeocoderUrl(geocodedAddress));
  const extracted = extractGeocodeMatches(payload);

  const warnings = [
    "Coordinates are interpolated along street segments, so they may be a few meters off the exact building.",
    ...extracted.warnings
  ];

  if (
    extracted.matches.length > 0 &&
    !extracted.matches.some((match) => isWithinPhiladelphiaBbox(match))
  ) {
    warnings.push(
      "No match falls inside Philadelphia's bounding box. Registry datasets only cover Philadelphia."
    );
  }

  return {
    query: {
      input_address: input.address,
      geocoded_address: geocodedAddress
    },
    matches: extracted.matches,
    source: {
      name: "U.S. Census Bureau Geocoder",
      url: "https://geocoding.geo.census.gov/",
      attribution: "U.S. Census Bureau"
    },
    warnings,
    retrieved_at: new Date().toISOString()
  };
}
