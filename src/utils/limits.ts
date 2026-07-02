export const DEFAULT_LIMIT = 25;
export const MAX_LIMIT = 100;
export const DEFAULT_NEARBY_LIMIT = 25;
export const MAX_RADIUS_METERS = 10000;
export const REQUEST_TIMEOUT_MS = 12000;
export const RETRY_ATTEMPTS = 2;

export function clampLimit(limit?: number, fallback = DEFAULT_LIMIT): {
  limit: number;
  warnings: string[];
} {
  if (limit === undefined) {
    return { limit: fallback, warnings: [] };
  }

  if (limit > MAX_LIMIT) {
    return {
      limit: MAX_LIMIT,
      warnings: [`Requested limit ${limit} was reduced to max limit ${MAX_LIMIT}.`]
    };
  }

  return { limit, warnings: [] };
}

export function clampRadius(radiusMeters: number): {
  radiusMeters: number;
  warnings: string[];
} {
  if (radiusMeters > MAX_RADIUS_METERS) {
    return {
      radiusMeters: MAX_RADIUS_METERS,
      warnings: [
        `Requested radius ${radiusMeters}m was reduced to max radius ${MAX_RADIUS_METERS}m.`
      ]
    };
  }

  return { radiusMeters, warnings: [] };
}
