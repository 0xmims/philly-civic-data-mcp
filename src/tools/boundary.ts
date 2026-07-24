import { findBoundaryDataset } from "../registry/datasets.js";
import { providerFor } from "../providers/index.js";
import type { BoundaryType, DatasetDefinition } from "../types.js";
import { CivicDataError } from "../utils/errors.js";

export interface BoundaryResult {
  boundary_type: BoundaryType;
  dataset_id: string;
  source: DatasetDefinition["source"];
  matched_by: string;
  record: Record<string, unknown>;
  geometry: unknown;
  geometry_format: "geojson" | "esri_json" | "unknown";
  warnings: string[];
  retrieved_at: string;
}

const BOUNDARY_ALIASES: Record<string, BoundaryType> = {
  neighborhood: "neighborhood",
  neighborhoods: "neighborhood",
  council: "council_district",
  council_district: "council_district",
  council_districts: "council_district",
  zip: "zip",
  zipcode: "zip",
  zip_code: "zip",
  police: "police_district",
  police_district: "police_district",
  police_districts: "police_district",
  census_tract: "census_tract",
  census_tracts: "census_tract",
  census: "census_tract",
  tract: "census_tract"
};

export async function getBoundary(input: {
  boundary_type: string;
  name?: string;
  id?: string | number;
}): Promise<BoundaryResult> {
  const boundaryType = parseBoundaryType(input.boundary_type);
  const dataset = findBoundaryDataset(boundaryType);

  if (!dataset?.boundary) {
    throw new CivicDataError(
      `No boundary dataset is configured for "${boundaryType}".`,
      "boundary_not_found"
    );
  }

  const lookupFields =
    input.id !== undefined ? dataset.boundary.idFields : dataset.boundary.nameFields;
  const lookupValue = input.id ?? input.name;
  if (lookupValue === undefined) {
    throw new CivicDataError("Provide boundary name or id.", "validation_error");
  }
  const provider = providerFor(dataset);

  for (const field of lookupFields) {
    let response;
    try {
      response = await provider.query(dataset, {
        limit: 1,
        filters: { [field]: lookupValue },
        fields: ["*"]
      });
    } catch {
      // A candidate lookup field can be type-incompatible with the value
      // (e.g. a string against a numeric OBJECTID); try the next field.
      continue;
    }

    if (response.records.length > 0) {
      const rawGeometry = response.geometry?.[0];
      const converted = toGeoJson(rawGeometry);

      return {
        boundary_type: boundaryType,
        dataset_id: dataset.id,
        source: dataset.source,
        matched_by: field,
        record: response.records[0],
        geometry: converted.geometry,
        geometry_format: converted.format,
        warnings: [
          ...response.warnings,
          ...(converted.format === "esri_json"
            ? [
                "Boundary geometry is returned as Esri JSON because it could not be converted safely."
              ]
            : [])
        ],
        retrieved_at: new Date().toISOString()
      };
    }
  }

  throw new CivicDataError(
    `No ${boundaryType} boundary matched the provided name or id.`,
    "boundary_not_found",
    { boundary_type: boundaryType, name: input.name, id: input.id }
  );
}

function parseBoundaryType(value: string): BoundaryType {
  const normalized = value.trim().toLowerCase().replace(/[\s-]+/g, "_");
  const boundaryType = BOUNDARY_ALIASES[normalized];

  if (!boundaryType) {
    throw new CivicDataError(
      `Unsupported boundary_type "${value}". Use neighborhood, council_district, ZIP, police_district, or census_tract.`,
      "unsupported_boundary_type"
    );
  }

  return boundaryType;
}

function toGeoJson(geometry: unknown): {
  geometry: unknown;
  format: "geojson" | "esri_json" | "unknown";
} {
  if (!geometry || typeof geometry !== "object") {
    return { geometry, format: "unknown" };
  }

  const value = geometry as Record<string, unknown>;

  if (typeof value.type === "string") {
    return { geometry, format: "geojson" };
  }

  if (typeof value.x === "number" && typeof value.y === "number") {
    return {
      geometry: {
        type: "Point",
        coordinates: [value.x, value.y]
      },
      format: "geojson"
    };
  }

  if (Array.isArray(value.rings)) {
    return {
      geometry: {
        type: "Polygon",
        coordinates: value.rings
      },
      format: "geojson"
    };
  }

  if (Array.isArray(value.paths)) {
    return {
      geometry: {
        type: "MultiLineString",
        coordinates: value.paths
      },
      format: "geojson"
    };
  }

  return { geometry, format: "esri_json" };
}
