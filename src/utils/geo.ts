export interface Point {
  latitude: number;
  longitude: number;
}

export function haversineDistanceMeters(a: Point, b: Point): number {
  const earthRadiusMeters = 6371008.8;
  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);

  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const h =
    sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon;

  return 2 * earthRadiusMeters * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function pointFromGeometry(geometry: unknown): Point | undefined {
  if (!geometry || typeof geometry !== "object") {
    return undefined;
  }

  const value = geometry as Record<string, unknown>;

  if (typeof value.x === "number" && typeof value.y === "number") {
    return { latitude: value.y, longitude: value.x };
  }

  if (
    value.type === "Point" &&
    Array.isArray(value.coordinates) &&
    typeof value.coordinates[0] === "number" &&
    typeof value.coordinates[1] === "number"
  ) {
    return {
      longitude: value.coordinates[0],
      latitude: value.coordinates[1]
    };
  }

  const coordinates = collectCoordinatePairs(value.coordinates);
  if (coordinates.length === 0) {
    return undefined;
  }

  const sums = coordinates.reduce(
    (acc, [longitude, latitude]) => ({
      longitude: acc.longitude + longitude,
      latitude: acc.latitude + latitude
    }),
    { longitude: 0, latitude: 0 }
  );

  return {
    longitude: sums.longitude / coordinates.length,
    latitude: sums.latitude / coordinates.length
  };
}

export function pointFromRecord(record: Record<string, unknown>): Point | undefined {
  const latitude = firstNumber(record, ["lat", "latitude", "y"]);
  const longitude = firstNumber(record, ["lon", "lng", "longitude", "x"]);

  if (latitude === undefined || longitude === undefined) {
    return undefined;
  }

  return { latitude, longitude };
}

function firstNumber(
  record: Record<string, unknown>,
  keys: string[]
): number | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number") {
      return value;
    }
    if (typeof value === "string" && value.trim() !== "") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return undefined;
}

function collectCoordinatePairs(value: unknown): [number, number][] {
  if (!Array.isArray(value)) {
    return [];
  }

  if (
    value.length >= 2 &&
    typeof value[0] === "number" &&
    typeof value[1] === "number"
  ) {
    return [[value[0], value[1]]];
  }

  return value.flatMap((item) => collectCoordinatePairs(item));
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}
