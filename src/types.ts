export type ProviderKind = "arcgis" | "carto" | "static";

export type EndpointStatus = "verified" | "needs_verification";

export type BoundaryType =
  | "neighborhood"
  | "council_district"
  | "zip"
  | "police_district";

export type FilterPrimitive = string | number | boolean | null;

export type FilterOperator =
  | "eq"
  | "neq"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "in"
  | "like";

export type FilterCondition =
  | FilterPrimitive
  | FilterPrimitive[]
  | Partial<Record<FilterOperator, FilterPrimitive | FilterPrimitive[]>>;

export type QueryFilters = Record<string, FilterCondition>;

export interface DataSourceMetadata {
  name: string;
  url: string;
  attribution: string;
}

export interface BaseProviderConfig {
  kind: ProviderKind;
}

export interface CartoProviderConfig extends BaseProviderConfig {
  kind: "carto";
  baseUrl: string;
  table: string;
  geometryColumn?: string;
}

export interface ArcGISProviderConfig extends BaseProviderConfig {
  kind: "arcgis";
  layerUrl: string;
}

export interface StaticFileProviderConfig extends BaseProviderConfig {
  kind: "static";
  url: string;
  format: "geojson";
}

export type ProviderConfig =
  | ArcGISProviderConfig
  | CartoProviderConfig
  | StaticFileProviderConfig;

export interface BoundaryConfig {
  type: BoundaryType;
  nameFields: string[];
  idFields: string[];
}

export interface DatasetDefinition {
  id: string;
  title: string;
  description: string;
  categories: string[];
  tags: string[];
  provider: ProviderConfig;
  source: DataSourceMetadata;
  formats: string[];
  updateFrequency?: string;
  endpointStatus: EndpointStatus;
  knownFilters: string[];
  boundary?: BoundaryConfig;
  defaultOrderBy?: string;
  warnings?: string[];
}

export interface DatasetSearchResult {
  dataset_id: string;
  title: string;
  description: string;
  categories: string[];
  source: DataSourceMetadata;
  provider: ProviderKind;
  available_formats: string[];
  update_frequency?: string;
  endpoint_status: EndpointStatus;
  warnings: string[];
}

export interface FieldDefinition {
  name: string;
  type: string;
  alias?: string;
}

export interface DatasetSchemaResult {
  dataset_id: string;
  source: DataSourceMetadata;
  fields: FieldDefinition[];
  geometry_type?: string;
  known_filters: string[];
  sample_record?: Record<string, unknown>;
  warnings: string[];
  retrieved_at: string;
}

export interface QueryOptions {
  filters?: QueryFilters;
  fields?: string[];
  limit: number;
  offset?: number;
  orderBy?: string;
}

export interface NormalizedQueryResult {
  dataset_id: string;
  source: DataSourceMetadata;
  records: Record<string, unknown>[];
  geometry?: unknown[];
  fields: FieldDefinition[];
  query: Record<string, unknown>;
  warnings: string[];
  retrieved_at: string;
}

export interface NearbyQueryOptions {
  latitude: number;
  longitude: number;
  radiusMeters: number;
  limit: number;
  filters?: QueryFilters;
}

export interface BoundaryLookupOptions {
  boundaryType: BoundaryType;
  name?: string;
  id?: string | number;
}

export interface Provider {
  getSchema(dataset: DatasetDefinition): Promise<DatasetSchemaResult>;
  query(
    dataset: DatasetDefinition,
    options: QueryOptions
  ): Promise<NormalizedQueryResult>;
  queryNearby(
    dataset: DatasetDefinition,
    options: NearbyQueryOptions
  ): Promise<NormalizedQueryResult>;
}
