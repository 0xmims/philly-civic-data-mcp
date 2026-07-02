import type {
  DatasetDefinition,
  DatasetSchemaResult,
  FieldDefinition,
  FilterCondition,
  FilterPrimitive,
  NearbyQueryOptions,
  NormalizedQueryResult,
  Provider,
  QueryFilters,
  QueryOptions,
  StaticFileProviderConfig
} from "../types.js";
import { CivicDataError } from "../utils/errors.js";
import {
  haversineDistanceMeters,
  pointFromGeometry,
  pointFromRecord
} from "../utils/geo.js";
import { fetchJson } from "../utils/http.js";

interface GeoJsonFeature {
  type: "Feature";
  properties?: Record<string, unknown>;
  geometry?: unknown;
}

interface GeoJsonFeatureCollection {
  type: "FeatureCollection";
  features: GeoJsonFeature[];
}

export class StaticFileProvider implements Provider {
  async getSchema(dataset: DatasetDefinition): Promise<DatasetSchemaResult> {
    const collection = await readGeoJson(dataset);
    const sample = collection.features[0];

    return {
      dataset_id: dataset.id,
      source: dataset.source,
      fields: fieldsFromProperties(sample?.properties),
      geometry_type: geometryType(sample?.geometry),
      known_filters: dataset.knownFilters,
      sample_record: sample?.properties,
      warnings: [...(dataset.warnings ?? [])],
      retrieved_at: new Date().toISOString()
    };
  }

  async query(
    dataset: DatasetDefinition,
    options: QueryOptions
  ): Promise<NormalizedQueryResult> {
    const collection = await readGeoJson(dataset);
    const filtered = collection.features
      .filter((feature) => matchesFilters(feature.properties ?? {}, options.filters))
      .sort((a, b) => compareByOrder(a.properties ?? {}, b.properties ?? {}, options.orderBy))
      .slice(options.offset ?? 0, (options.offset ?? 0) + options.limit);

    return {
      dataset_id: dataset.id,
      source: dataset.source,
      records: filtered.map((feature) =>
        selectFields(feature.properties ?? {}, options.fields)
      ),
      geometry: filtered.map((feature) => feature.geometry),
      fields: fieldsFromProperties(collection.features[0]?.properties),
      query: {
        filters: options.filters ?? {},
        fields: options.fields ?? ["*"],
        limit: options.limit,
        offset: options.offset ?? 0,
        order_by: options.orderBy
      },
      warnings: [...(dataset.warnings ?? [])],
      retrieved_at: new Date().toISOString()
    };
  }

  async queryNearby(
    dataset: DatasetDefinition,
    options: NearbyQueryOptions
  ): Promise<NormalizedQueryResult> {
    const collection = await readGeoJson(dataset);
    const origin = {
      latitude: options.latitude,
      longitude: options.longitude
    };
    const features = collection.features
      .filter((feature) => matchesFilters(feature.properties ?? {}, options.filters))
      .map((feature) => {
        const point =
          pointFromGeometry(feature.geometry) ??
          pointFromRecord(feature.properties ?? {});
        const distanceMeters = point
          ? haversineDistanceMeters(origin, point)
          : Number.POSITIVE_INFINITY;

        return {
          feature,
          distanceMeters
        };
      })
      .filter((item) => item.distanceMeters <= options.radiusMeters)
      .sort((a, b) => a.distanceMeters - b.distanceMeters)
      .slice(0, options.limit);

    return {
      dataset_id: dataset.id,
      source: dataset.source,
      records: features.map((item) => ({
        ...(item.feature.properties ?? {}),
        distance_meters: Math.round(item.distanceMeters)
      })),
      geometry: features.map((item) => item.feature.geometry),
      fields: fieldsFromProperties(collection.features[0]?.properties),
      query: {
        latitude: options.latitude,
        longitude: options.longitude,
        radius_meters: options.radiusMeters,
        limit: options.limit,
        filters: options.filters ?? {}
      },
      warnings: [
        ...(dataset.warnings ?? []),
        "Nearby search for static GeoJSON uses centroid distance for polygons."
      ],
      retrieved_at: new Date().toISOString()
    };
  }
}

export function matchesFilters(
  record: Record<string, unknown>,
  filters?: QueryFilters
): boolean {
  if (!filters || Object.keys(filters).length === 0) {
    return true;
  }

  return Object.entries(filters).every(([field, condition]) =>
    matchesCondition(record[field], condition)
  );
}

function matchesCondition(value: unknown, condition: FilterCondition): boolean {
  if (Array.isArray(condition)) {
    return condition.some((item) => valuesEqual(value, item));
  }

  if (isOperatorCondition(condition)) {
    return Object.entries(condition).every(([operator, expected]) => {
      switch (operator) {
        case "eq":
          return valuesEqual(value, expected as FilterPrimitive);
        case "neq":
          return !valuesEqual(value, expected as FilterPrimitive);
        case "gt":
          return compare(value, expected as FilterPrimitive) > 0;
        case "gte":
          return compare(value, expected as FilterPrimitive) >= 0;
        case "lt":
          return compare(value, expected as FilterPrimitive) < 0;
        case "lte":
          return compare(value, expected as FilterPrimitive) <= 0;
        case "in":
          return Array.isArray(expected)
            ? expected.some((item) => valuesEqual(value, item))
            : false;
        case "like":
          return String(value ?? "")
            .toLowerCase()
            .includes(String(expected ?? "").replace(/%/g, "").toLowerCase());
        default:
          return false;
      }
    });
  }

  return valuesEqual(value, condition);
}

function isOperatorCondition(
  value: FilterCondition
): value is Record<string, FilterPrimitive | FilterPrimitive[]> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.keys(value).some((key) =>
      ["eq", "neq", "gt", "gte", "lt", "lte", "in", "like"].includes(key)
    )
  );
}

function valuesEqual(left: unknown, right: FilterPrimitive): boolean {
  if (left === right) {
    return true;
  }

  return String(left ?? "").toLowerCase() === String(right ?? "").toLowerCase();
}

function compare(left: unknown, right: unknown): number {
  const leftNumber = Number(left);
  const rightNumber = Number(right);

  if (Number.isFinite(leftNumber) && Number.isFinite(rightNumber)) {
    return leftNumber - rightNumber;
  }

  return String(left ?? "").localeCompare(String(right ?? ""));
}

function compareByOrder(
  left: Record<string, unknown>,
  right: Record<string, unknown>,
  orderBy: string | undefined
): number {
  if (!orderBy) {
    return 0;
  }

  const match = /^([A-Za-z_][A-Za-z0-9_]*)(?:\s+(asc|desc))?$/i.exec(
    orderBy.trim()
  );
  if (!match) {
    throw new CivicDataError(
      `Invalid order_by "${orderBy}". Use a field name with optional asc or desc.`,
      "invalid_order_by"
    );
  }

  const direction = match[2]?.toLowerCase() === "desc" ? -1 : 1;
  return compare(left[match[1]], right[match[1]]) * direction;
}

function selectFields(
  properties: Record<string, unknown>,
  fields: string[] | undefined
): Record<string, unknown> {
  if (!fields?.length || fields.includes("*")) {
    return properties;
  }

  return Object.fromEntries(fields.map((field) => [field, properties[field]]));
}

function fieldsFromProperties(
  properties: Record<string, unknown> | undefined
): FieldDefinition[] {
  return Object.entries(properties ?? {}).map(([name, value]) => ({
    name,
    type: typeof value
  }));
}

function geometryType(geometry: unknown): string | undefined {
  if (!geometry || typeof geometry !== "object") {
    return undefined;
  }

  const value = geometry as Record<string, unknown>;
  return typeof value.type === "string" ? value.type : undefined;
}

async function readGeoJson(
  dataset: DatasetDefinition
): Promise<GeoJsonFeatureCollection> {
  const config = assertStaticConfig(dataset);
  const response = await fetchJson<GeoJsonFeatureCollection>(config.url);

  if (response.type !== "FeatureCollection" || !Array.isArray(response.features)) {
    throw new CivicDataError(
      `Static dataset ${dataset.id} did not return a GeoJSON FeatureCollection.`,
      "invalid_static_dataset"
    );
  }

  return response;
}

function assertStaticConfig(dataset: DatasetDefinition): StaticFileProviderConfig {
  if (dataset.provider.kind !== "static") {
    throw new CivicDataError(
      `Dataset ${dataset.id} is not configured for static files.`,
      "provider_mismatch"
    );
  }

  return dataset.provider;
}
