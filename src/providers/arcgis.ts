import type {
  AggregateOptions,
  AggregateResult,
  ArcGISProviderConfig,
  DatasetDefinition,
  DatasetSchemaResult,
  FieldDefinition,
  FilterCondition,
  FilterPrimitive,
  NearbyQueryOptions,
  NormalizedQueryResult,
  Provider,
  QueryWithinBoundaryOptions,
  QueryWithinBoundaryResult,
  QueryFilters,
  QueryOptions
} from "../types.js";
import { CivicDataError } from "../utils/errors.js";
import {
  haversineDistanceMeters,
  pointFromGeometry,
  toEsriPolygonGeometry
} from "../utils/geo.js";
import { fetchJson } from "../utils/http.js";

interface ArcGISField {
  name: string;
  type: string;
  alias?: string;
}

interface ArcGISLayerInfo {
  fields?: ArcGISField[];
  geometryType?: string;
  error?: ArcGISError;
}

interface ArcGISFeature {
  attributes?: Record<string, unknown>;
  geometry?: unknown;
}

interface ArcGISQueryResponse {
  fields?: ArcGISField[];
  geometryType?: string;
  features?: ArcGISFeature[];
  exceededTransferLimit?: boolean;
  error?: ArcGISError;
}

interface ArcGISError {
  code?: number;
  message?: string;
  details?: string[];
}

const IDENTIFIER_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

export class ArcGISProvider implements Provider {
  async getSchema(dataset: DatasetDefinition): Promise<DatasetSchemaResult> {
    const config = assertArcGISConfig(dataset);
    const layerInfo = await fetchJson<ArcGISLayerInfo>(
      withParams(config.layerUrl, { f: "json" })
    );
    assertNoArcGISError(layerInfo.error);

    const sample = await this.query(dataset, {
      limit: 1,
      filters: {},
      fields: ["*"]
    });

    return {
      dataset_id: dataset.id,
      source: dataset.source,
      fields: fieldsFromArcGIS(layerInfo.fields),
      geometry_type: layerInfo.geometryType,
      known_filters: dataset.knownFilters,
      sample_record: sample.records[0],
      warnings: [...(dataset.warnings ?? []), ...sample.warnings],
      retrieved_at: new Date().toISOString()
    };
  }

  async query(
    dataset: DatasetDefinition,
    options: QueryOptions
  ): Promise<NormalizedQueryResult> {
    const config = assertArcGISConfig(dataset);
    const response = await queryLayer(config, {
      where: filtersToWhere(options.filters),
      outFields: outFields(options.fields),
      resultRecordCount: String(options.limit),
      resultOffset: String(options.offset ?? 0),
      orderByFields: options.orderBy ? orderBy(options.orderBy) : undefined,
      returnGeometry: "true",
      outSR: "4326"
    });

    const normalized = normalizeFeatures(response.features ?? []);

    return {
      dataset_id: dataset.id,
      source: dataset.source,
      records: normalized.records,
      geometry: normalized.geometry,
      fields: fieldsFromArcGIS(response.fields),
      query: {
        filters: options.filters ?? {},
        fields: options.fields ?? ["*"],
        limit: options.limit,
        offset: options.offset ?? 0,
        order_by: options.orderBy
      },
      warnings: [
        ...(dataset.warnings ?? []),
        ...normalized.warnings,
        ...(response.exceededTransferLimit
          ? ["ArcGIS reports additional records beyond this limited response."]
          : [])
      ],
      retrieved_at: new Date().toISOString()
    };
  }

  async queryNearby(
    dataset: DatasetDefinition,
    options: NearbyQueryOptions
  ): Promise<NormalizedQueryResult> {
    const config = assertArcGISConfig(dataset);
    const response = await queryLayer(config, {
      where: filtersToWhere(options.filters),
      outFields: "*",
      resultRecordCount: String(options.limit),
      returnGeometry: "true",
      outSR: "4326",
      geometry: `${options.longitude},${options.latitude}`,
      geometryType: "esriGeometryPoint",
      inSR: "4326",
      spatialRel: "esriSpatialRelIntersects",
      distance: String(options.radiusMeters),
      units: "esriSRUnit_Meter"
    });

    const origin = {
      latitude: options.latitude,
      longitude: options.longitude
    };
    const normalized = normalizeFeatures(response.features ?? []);
    const withDistances = normalized.records
      .map((record, index) => {
        const point = pointFromGeometry(normalized.geometry[index]);
        return point
          ? {
              record: {
                ...record,
                distance_meters: Math.round(haversineDistanceMeters(origin, point))
              },
              geometry: normalized.geometry[index]
            }
          : { record, geometry: normalized.geometry[index] };
      })
      .sort((a, b) => {
        const left =
          typeof a.record.distance_meters === "number"
            ? a.record.distance_meters
            : Number.POSITIVE_INFINITY;
        const right =
          typeof b.record.distance_meters === "number"
            ? b.record.distance_meters
            : Number.POSITIVE_INFINITY;
        return left - right;
      });

    return {
      dataset_id: dataset.id,
      source: dataset.source,
      records: withDistances.map((item) => item.record),
      geometry: withDistances.map((item) => item.geometry),
      fields: fieldsFromArcGIS(response.fields),
      query: {
        latitude: options.latitude,
        longitude: options.longitude,
        radius_meters: options.radiusMeters,
        limit: options.limit,
        filters: options.filters ?? {}
      },
      warnings: [
        ...(dataset.warnings ?? []),
        ...normalized.warnings,
        ...(withDistances.some(
          (item) => typeof item.record.distance_meters !== "number"
        )
          ? ["Some returned features did not include geometry usable for distance sorting."]
          : []),
        ...(response.exceededTransferLimit
          ? ["ArcGIS reports additional records beyond this limited response."]
          : [])
      ],
      retrieved_at: new Date().toISOString()
    };
  }

  async aggregate(
    dataset: DatasetDefinition,
    options: AggregateOptions
  ): Promise<AggregateResult> {
    return {
      dataset_id: dataset.id,
      source: dataset.source,
      rows: [],
      query: {
        filters: options.filters ?? {},
        group_by: options.groupBy ?? [],
        metrics: options.metrics,
        date_bucket: options.dateBucket,
        limit: options.limit,
        order_by: options.orderBy
      },
      warnings: [
        ...(dataset.warnings ?? []),
        "aggregate_dataset is not implemented for ArcGIS providers in v2. Use CARTO/static datasets or query records and aggregate client-side with explicit caveats."
      ],
      retrieved_at: new Date().toISOString()
    };
  }

  async queryWithinBoundary(
    dataset: DatasetDefinition,
    options: QueryWithinBoundaryOptions
  ): Promise<QueryWithinBoundaryResult> {
    const config = assertArcGISConfig(dataset);
    const esriGeometry = toEsriPolygonGeometry(options.boundary.geometry);

    if (!esriGeometry) {
      throw new CivicDataError(
        "ArcGIS boundary queries require a polygon or multipolygon boundary geometry.",
        "unsupported_boundary_geometry"
      );
    }

    const response = await queryLayer(config, {
      where: filtersToWhere(options.filters),
      outFields: outFields(options.fields),
      resultRecordCount: String(options.limit),
      resultOffset: String(options.offset ?? 0),
      orderByFields: options.orderBy ? orderBy(options.orderBy) : undefined,
      returnGeometry: "true",
      outSR: "4326",
      geometry: JSON.stringify(esriGeometry),
      geometryType: "esriGeometryPolygon",
      inSR: "4326",
      spatialRel: "esriSpatialRelIntersects"
    });

    const normalized = normalizeFeatures(response.features ?? []);

    return {
      dataset_id: dataset.id,
      boundary: options.boundary,
      source: dataset.source,
      records: normalized.records,
      geometry: normalized.geometry,
      fields: fieldsFromArcGIS(response.fields),
      query: {
        filters: options.filters ?? {},
        fields: options.fields ?? ["*"],
        limit: options.limit,
        offset: options.offset ?? 0,
        order_by: options.orderBy,
        boundary_type: options.boundary.boundary_type,
        boundary_dataset_id: options.boundary.dataset_id,
        boundary_matched_by: options.boundary.matched_by
      },
      warnings: [
        ...(dataset.warnings ?? []),
        ...normalized.warnings,
        "Boundary filtering was computed with an ArcGIS polygon spatial query.",
        ...(response.exceededTransferLimit
          ? ["ArcGIS reports additional records beyond this limited response."]
          : [])
      ],
      retrieved_at: new Date().toISOString()
    };
  }
}

export function filtersToWhere(filters?: QueryFilters): string {
  if (!filters || Object.keys(filters).length === 0) {
    return "1=1";
  }

  return Object.entries(filters)
    .map(([field, condition]) => conditionToWhere(field, condition))
    .join(" AND ");
}

async function queryLayer(
  config: ArcGISProviderConfig,
  params: Record<string, string | undefined>
): Promise<ArcGISQueryResponse> {
  const url = withParams(`${config.layerUrl}/query`, {
    f: "json",
    ...params
  });
  const response = await fetchJson<ArcGISQueryResponse>(url);
  assertNoArcGISError(response.error);
  return response;
}

function conditionToWhere(field: string, condition: FilterCondition): string {
  const safeField = identifier(field);

  if (Array.isArray(condition)) {
    return `${safeField} IN (${condition.map(literal).join(", ")})`;
  }

  if (isOperatorCondition(condition)) {
    return Object.entries(condition)
      .map(([operator, value]) => {
        switch (operator) {
          case "eq":
            return `${safeField} = ${literal(value as FilterPrimitive)}`;
          case "neq":
            return `${safeField} <> ${literal(value as FilterPrimitive)}`;
          case "gt":
            return `${safeField} > ${literal(value as FilterPrimitive)}`;
          case "gte":
            return `${safeField} >= ${literal(value as FilterPrimitive)}`;
          case "lt":
            return `${safeField} < ${literal(value as FilterPrimitive)}`;
          case "lte":
            return `${safeField} <= ${literal(value as FilterPrimitive)}`;
          case "in":
            if (!Array.isArray(value)) {
              throw new CivicDataError(
                `Filter operator "in" for ${field} must be an array.`,
                "invalid_filter"
              );
            }
            return `${safeField} IN (${value.map(literal).join(", ")})`;
          case "like":
            return `${safeField} LIKE ${literal(String(value))}`;
          default:
            throw new CivicDataError(
              `Unsupported filter operator "${operator}" for ${field}.`,
              "unsupported_filter"
            );
        }
      })
      .join(" AND ");
  }

  if (condition === null) {
    return `${safeField} IS NULL`;
  }

  return `${safeField} = ${literal(condition)}`;
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

function identifier(value: string): string {
  if (!IDENTIFIER_PATTERN.test(value)) {
    throw new CivicDataError(
      `Invalid field identifier "${value}".`,
      "invalid_identifier"
    );
  }

  return value;
}

function literal(value: FilterPrimitive | FilterPrimitive[]): string {
  if (Array.isArray(value)) {
    throw new CivicDataError("Nested filter arrays are not supported.", "invalid_filter");
  }

  if (value === null) {
    return "NULL";
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new CivicDataError("Numeric filter must be finite.", "invalid_filter");
    }
    return String(value);
  }

  if (typeof value === "boolean") {
    return value ? "1" : "0";
  }

  return `'${value.replace(/'/g, "''")}'`;
}

function outFields(fields: string[] | undefined): string {
  if (!fields?.length || fields.includes("*")) {
    return "*";
  }

  return fields.map(identifier).join(",");
}

function orderBy(value: string): string {
  const match = /^([A-Za-z_][A-Za-z0-9_]*)(?:\s+(asc|desc))?$/i.exec(
    value.trim()
  );
  if (!match) {
    throw new CivicDataError(
      `Invalid order_by "${value}". Use a field name with optional asc or desc.`,
      "invalid_order_by"
    );
  }

  return `${identifier(match[1])}${match[2] ? ` ${match[2].toUpperCase()}` : ""}`;
}

function normalizeFeatures(features: ArcGISFeature[]): {
  records: Record<string, unknown>[];
  geometry: unknown[];
  warnings: string[];
} {
  const geometry: unknown[] = [];
  const records = features.map((feature) => {
    geometry.push(feature.geometry);
    return feature.attributes ?? {};
  });

  return { records, geometry, warnings: [] };
}

function fieldsFromArcGIS(fields: ArcGISField[] | undefined): FieldDefinition[] {
  return (fields ?? []).map((field) => ({
    name: field.name,
    type: field.type,
    alias: field.alias
  }));
}

function withParams(
  baseUrl: string,
  params: Record<string, string | undefined>
): string {
  const url = new URL(baseUrl);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      url.searchParams.set(key, value);
    }
  }

  return url.toString();
}

function assertNoArcGISError(error: ArcGISError | undefined): void {
  if (!error) {
    return;
  }

  throw new CivicDataError("ArcGIS FeatureServer returned an error.", "arcgis_api_error", {
    code: error.code,
    message: error.message,
    details: error.details
  });
}

function assertArcGISConfig(dataset: DatasetDefinition): ArcGISProviderConfig {
  if (dataset.provider.kind !== "arcgis") {
    throw new CivicDataError(
      `Dataset ${dataset.id} is not configured for ArcGIS.`,
      "provider_mismatch"
    );
  }

  return dataset.provider;
}
