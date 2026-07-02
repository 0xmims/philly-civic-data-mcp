import type {
  AggregateOptions,
  AggregateResult,
  CartoProviderConfig,
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
import { isPolygonLikeGeometry } from "../utils/geo.js";
import { fetchJson } from "../utils/http.js";

interface CartoSqlResponse {
  rows?: Record<string, unknown>[];
  fields?: Record<
    string,
    {
      type?: string;
      pgtype?: string;
      wkbtype?: string;
      srid?: number;
    }
  >;
  error?: string[];
}

const IDENTIFIER_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

export class CartoProvider implements Provider {
  async getSchema(dataset: DatasetDefinition): Promise<DatasetSchemaResult> {
    const config = assertCartoConfig(dataset);
    const sql = `SELECT * FROM ${identifier(config.table)} LIMIT 1`;
    const response = await this.execute(config, sql);
    const sample = response.rows?.[0];

    return {
      dataset_id: dataset.id,
      source: dataset.source,
      fields: fieldsFromCarto(response.fields),
      geometry_type: response.fields?.[config.geometryColumn ?? "the_geom"]?.wkbtype,
      known_filters: dataset.knownFilters,
      sample_record: cleanRecord(sample),
      warnings: [...(dataset.warnings ?? [])],
      retrieved_at: new Date().toISOString()
    };
  }

  async query(
    dataset: DatasetDefinition,
    options: QueryOptions
  ): Promise<NormalizedQueryResult> {
    const config = assertCartoConfig(dataset);
    const geometryColumn = config.geometryColumn ?? "the_geom";
    const fields = projection(options.fields, geometryColumn);
    const where = filtersToSql(options.filters);
    const order = options.orderBy ?? dataset.defaultOrderBy;

    const sql = [
      `SELECT ${fields.join(", ")} FROM ${identifier(config.table)}`,
      where ? `WHERE ${where}` : "",
      order ? `ORDER BY ${orderBy(order)}` : "",
      `LIMIT ${options.limit}`,
      options.offset ? `OFFSET ${options.offset}` : ""
    ]
      .filter(Boolean)
      .join(" ");

    const response = await this.execute(config, sql);
    const normalized = normalizeRows(response.rows ?? []);

    return {
      dataset_id: dataset.id,
      source: dataset.source,
      records: normalized.records,
      geometry: normalized.geometry,
      fields: fieldsFromCarto(response.fields),
      query: {
        filters: options.filters ?? {},
        fields: options.fields ?? ["*"],
        limit: options.limit,
        offset: options.offset ?? 0,
        order_by: order
      },
      warnings: [...(dataset.warnings ?? []), ...normalized.warnings],
      retrieved_at: new Date().toISOString()
    };
  }

  async queryNearby(
    dataset: DatasetDefinition,
    options: NearbyQueryOptions
  ): Promise<NormalizedQueryResult> {
    const config = assertCartoConfig(dataset);
    const geometryColumn = config.geometryColumn ?? "the_geom";
    const point = `ST_SetSRID(ST_MakePoint(${options.longitude}, ${options.latitude}), 4326)`;
    const where = [
      `${identifier(geometryColumn)} IS NOT NULL`,
      `ST_DWithin(${identifier(geometryColumn)}::geography, ${point}::geography, ${options.radiusMeters})`,
      filtersToSql(options.filters)
    ]
      .filter(Boolean)
      .join(" AND ");

    const sql = [
      `SELECT *, ST_AsGeoJSON(${identifier(geometryColumn)}) AS geometry,`,
      `ST_Distance(${identifier(geometryColumn)}::geography, ${point}::geography) AS distance_meters`,
      `FROM ${identifier(config.table)}`,
      `WHERE ${where}`,
      "ORDER BY distance_meters ASC",
      `LIMIT ${options.limit}`
    ].join(" ");

    const response = await this.execute(config, sql);
    const normalized = normalizeRows(response.rows ?? []);

    return {
      dataset_id: dataset.id,
      source: dataset.source,
      records: normalized.records,
      geometry: normalized.geometry,
      fields: fieldsFromCarto(response.fields),
      query: {
        latitude: options.latitude,
        longitude: options.longitude,
        radius_meters: options.radiusMeters,
        limit: options.limit,
        filters: options.filters ?? {}
      },
      warnings: [...(dataset.warnings ?? []), ...normalized.warnings],
      retrieved_at: new Date().toISOString()
    };
  }

  async aggregate(
    dataset: DatasetDefinition,
    options: AggregateOptions
  ): Promise<AggregateResult> {
    const config = assertCartoConfig(dataset);
    const sql = buildCartoAggregateSql(config, options);
    const response = await this.execute(config, sql);

    return {
      dataset_id: dataset.id,
      source: dataset.source,
      rows: response.rows ?? [],
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
        "Aggregation was computed by the CARTO SQL API with validated identifiers and safe limits."
      ],
      retrieved_at: new Date().toISOString()
    };
  }

  async queryWithinBoundary(
    dataset: DatasetDefinition,
    options: QueryWithinBoundaryOptions
  ): Promise<QueryWithinBoundaryResult> {
    const config = assertCartoConfig(dataset);
    const geometryColumn = config.geometryColumn ?? "the_geom";

    if (!isPolygonLikeGeometry(options.boundary.geometry)) {
      throw new CivicDataError(
        "CARTO boundary queries require a polygon or multipolygon boundary geometry.",
        "unsupported_boundary_geometry"
      );
    }

    const fields = projection(options.fields, geometryColumn);
    const where = [
      `${identifier(geometryColumn)} IS NOT NULL`,
      `ST_Intersects(${identifier(geometryColumn)}, boundary.geom)`,
      filtersToSql(options.filters)
    ]
      .filter(Boolean)
      .join(" AND ");
    const order = options.orderBy ?? dataset.defaultOrderBy;

    const sql = [
      `WITH boundary AS (SELECT ST_SetSRID(ST_GeomFromGeoJSON(${literal(JSON.stringify(options.boundary.geometry))}), 4326) AS geom)`,
      `SELECT ${fields.join(", ")} FROM ${identifier(config.table)}, boundary`,
      `WHERE ${where}`,
      order ? `ORDER BY ${orderBy(order)}` : "",
      `LIMIT ${options.limit}`,
      options.offset ? `OFFSET ${options.offset}` : ""
    ]
      .filter(Boolean)
      .join(" ");

    const response = await this.execute(config, sql);
    const normalized = normalizeRows(response.rows ?? []);

    return {
      dataset_id: dataset.id,
      boundary: options.boundary,
      source: dataset.source,
      records: normalized.records,
      geometry: normalized.geometry,
      fields: fieldsFromCarto(response.fields),
      query: {
        filters: options.filters ?? {},
        fields: options.fields ?? ["*"],
        limit: options.limit,
        offset: options.offset ?? 0,
        order_by: order,
        boundary_type: options.boundary.boundary_type,
        boundary_dataset_id: options.boundary.dataset_id,
        boundary_matched_by: options.boundary.matched_by
      },
      warnings: [
        ...(dataset.warnings ?? []),
        ...normalized.warnings,
        "Boundary filtering was computed with CARTO/PostGIS ST_Intersects."
      ],
      retrieved_at: new Date().toISOString()
    };
  }

  private async execute(
    config: CartoProviderConfig,
    sql: string
  ): Promise<CartoSqlResponse> {
    const url = new URL(config.baseUrl);
    url.searchParams.set("q", sql);

    const response = await fetchJson<CartoSqlResponse>(url.toString());

    if (response.error?.length) {
      throw new CivicDataError("CARTO SQL API returned an error.", "carto_api_error", {
        error: response.error,
        sql
      });
    }

    return response;
  }
}

export function buildCartoAggregateSql(
  config: CartoProviderConfig,
  options: AggregateOptions
): string {
  const selected: string[] = [];
  const groupExpressions: string[] = [];

  for (const field of options.groupBy ?? []) {
    const safeField = identifier(field);
    selected.push(safeField);
    groupExpressions.push(safeField);
  }

  if (options.dateBucket) {
    const safeField = identifier(options.dateBucket.field);
    const bucketExpression = `date_trunc('${options.dateBucket.interval}', ${safeField})`;
    selected.push(`${bucketExpression} AS date_bucket`);
    groupExpressions.push(bucketExpression);
  }

  for (const metric of options.metrics) {
    selected.push(metricToSql(metric));
  }

  const where = filtersToSql(options.filters);
  const sql = [
    `SELECT ${selected.join(", ")} FROM ${identifier(config.table)}`,
    where ? `WHERE ${where}` : "",
    groupExpressions.length ? `GROUP BY ${groupExpressions.join(", ")}` : "",
    options.orderBy ? `ORDER BY ${orderBy(options.orderBy)}` : "",
    `LIMIT ${options.limit}`
  ]
    .filter(Boolean)
    .join(" ");

  return sql;
}

export function filtersToSql(filters?: QueryFilters): string {
  if (!filters || Object.keys(filters).length === 0) {
    return "";
  }

  return Object.entries(filters)
    .map(([field, condition]) => conditionToSql(field, condition))
    .join(" AND ");
}

function conditionToSql(field: string, condition: FilterCondition): string {
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
            return `${safeField} ILIKE ${literal(String(value))}`;
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

function projection(fields: string[] | undefined, geometryColumn: string): string[] {
  const selected = fields?.length && !fields.includes("*") ? fields.map(identifier) : ["*"];

  return [
    ...selected,
    `ST_AsGeoJSON(${identifier(geometryColumn)}) AS geometry`
  ];
}

function orderBy(value: string): string {
  const trimmed = value.trim();
  const match = /^([A-Za-z_][A-Za-z0-9_]*)(?:\s+(asc|desc))?$/i.exec(trimmed);
  if (!match) {
    throw new CivicDataError(
      `Invalid order_by "${value}". Use a field name with optional asc or desc.`,
      "invalid_order_by"
    );
  }

  return `${identifier(match[1])}${match[2] ? ` ${match[2].toUpperCase()}` : ""}`;
}

function metricToSql(metric: AggregateOptions["metrics"][number]): string {
  if (metric.op === "count") {
    return `COUNT(*) AS ${identifier(metric.as ?? "count")}`;
  }

  const safeField = identifier(metric.field);
  return `COUNT(DISTINCT ${safeField}) AS ${identifier(
    metric.as ?? `count_distinct_${metric.field}`
  )}`;
}

function identifier(value: string): string {
  if (!IDENTIFIER_PATTERN.test(value)) {
    throw new CivicDataError(
      `Invalid field or table identifier "${value}".`,
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
    return value ? "TRUE" : "FALSE";
  }

  return `'${value.replace(/'/g, "''")}'`;
}

function fieldsFromCarto(
  fields: CartoSqlResponse["fields"] | undefined
): FieldDefinition[] {
  if (!fields) {
    return [];
  }

  return Object.entries(fields).map(([name, definition]) => ({
    name,
    type: definition.type ?? definition.pgtype ?? "unknown"
  }));
}

function normalizeRows(rows: Record<string, unknown>[]): {
  records: Record<string, unknown>[];
  geometry: unknown[];
  warnings: string[];
} {
  const geometry: unknown[] = [];
  const warnings: string[] = [];
  let malformedGeometry = 0;

  const records = rows.map((row) => {
    const record = { ...row };
    const rawGeometry = record.geometry;

    if (typeof rawGeometry === "string" && rawGeometry.trim()) {
      try {
        geometry.push(JSON.parse(rawGeometry));
      } catch {
        malformedGeometry += 1;
      }
    } else if (rawGeometry) {
      geometry.push(rawGeometry);
    }

    delete record.geometry;
    delete record.the_geom;
    delete record.the_geom_webmercator;
    return record;
  });

  if (malformedGeometry > 0) {
    warnings.push(
      `${malformedGeometry} record(s) included geometry that could not be parsed as GeoJSON.`
    );
  }

  return { records, geometry, warnings };
}

function cleanRecord(
  record: Record<string, unknown> | undefined
): Record<string, unknown> | undefined {
  if (!record) {
    return undefined;
  }

  const cleaned = { ...record };
  delete cleaned.the_geom;
  delete cleaned.the_geom_webmercator;
  return cleaned;
}

function assertCartoConfig(dataset: DatasetDefinition): CartoProviderConfig {
  if (dataset.provider.kind !== "carto") {
    throw new CivicDataError(
      `Dataset ${dataset.id} is not configured for CARTO.`,
      "provider_mismatch"
    );
  }

  return dataset.provider;
}
