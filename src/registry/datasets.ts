import type {
  BoundaryType,
  DatasetDefinition,
  ProviderCapabilities
} from "../types.js";

const CARTO_BASE_URL = "https://phl.carto.com/api/v2/sql";
const ARCGIS_ROOT =
  "https://services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services";

const CARTO_CAPABILITIES: ProviderCapabilities = {
  supportsSchema: true,
  supportsQuery: true,
  supportsNearby: true,
  supportsGeoQuery: true,
  supportsAggregation: true,
  supportsBoundaryQuery: true,
  geometryFormat: "wkb",
  maxRecommendedLimit: 100
};

const ARCGIS_CAPABILITIES: ProviderCapabilities = {
  supportsSchema: true,
  supportsQuery: true,
  supportsNearby: true,
  supportsGeoQuery: true,
  supportsAggregation: false,
  supportsBoundaryQuery: true,
  geometryFormat: "esri_json",
  maxRecommendedLimit: 100
};

const STATIC_GEOJSON_CAPABILITIES: ProviderCapabilities = {
  supportsSchema: true,
  supportsQuery: true,
  supportsNearby: true,
  supportsGeoQuery: false,
  supportsAggregation: true,
  supportsBoundaryQuery: true,
  geometryFormat: "geojson",
  maxRecommendedLimit: 100
};

export const datasets: DatasetDefinition[] = [
  {
    id: "311_service_requests",
    title: "311 Service and Information Requests",
    description:
      "Service and information requests submitted to Philly311 since December 8, 2014.",
    categories: ["Environment", "Health / Human Services", "Transportation"],
    tags: ["311", "service requests", "maintenance", "repairs"],
    provider: {
      kind: "carto",
      baseUrl: CARTO_BASE_URL,
      table: "public_cases_fc",
      geometryColumn: "the_geom"
    },
    source: {
      name: "OpenDataPhilly",
      url: "https://opendataphilly.org/datasets/311-service-and-information-requests/",
      attribution: "City of Philadelphia, Philly311"
    },
    capabilities: CARTO_CAPABILITIES,
    formats: ["CSV", "SHP", "CARTO SQL API"],
    updateFrequency: "Daily, per OpenDataPhilly catalog",
    endpointStatus: "verified",
    knownFilters: [
      "service_request_id",
      "status",
      "service_name",
      "service_code",
      "agency_responsible",
      "requested_datetime",
      "updated_datetime",
      "zipcode",
      "address"
    ],
    defaultOrderBy: "requested_datetime desc",
    warnings: [
      "Very large dataset. Use date, status, service name, or ZIP filters for focused results."
    ]
  },
  {
    id: "property_assessments",
    title: "OPA Property Assessments",
    description:
      "Property characteristics and assessment records from the Office of Property Assessment.",
    categories: ["Real Estate / Land Records"],
    tags: ["property", "assessment", "OPA", "parcels"],
    provider: {
      kind: "carto",
      baseUrl: CARTO_BASE_URL,
      table: "opa_properties_public",
      geometryColumn: "the_geom"
    },
    source: {
      name: "OpenDataPhilly",
      url: "https://opendataphilly.org/datasets/philadelphia-properties-and-assessment-history/",
      attribution: "City of Philadelphia, Office of Property Assessment"
    },
    capabilities: CARTO_CAPABILITIES,
    formats: ["CSV", "GeoJSON", "File Geodatabase", "CARTO SQL API"],
    updateFrequency: "Nightly, per OpenDataPhilly catalog",
    endpointStatus: "verified",
    knownFilters: [
      "parcel_number",
      "location",
      "owner_1",
      "zip_code",
      "category_code_description",
      "assessment_date",
      "sale_date"
    ],
    defaultOrderBy: "assessment_date desc",
    warnings: [
      "Assessment data can contain owner names and mailing addresses. Return only fields needed for the civic question."
    ]
  },
  {
    id: "building_permits",
    title: "L&I Building and Zoning Permits",
    description:
      "Building and zoning permits reviewed by Philadelphia Licenses and Inspections.",
    categories: ["Planning / Zoning", "Real Estate / Land Records"],
    tags: ["permits", "building", "zoning", "L&I"],
    provider: {
      kind: "carto",
      baseUrl: CARTO_BASE_URL,
      table: "permits",
      geometryColumn: "the_geom"
    },
    source: {
      name: "OpenDataPhilly",
      url: "https://opendataphilly.org/datasets/licenses-and-inspections-building-and-zoning-permits/",
      attribution: "City of Philadelphia, Department of Licenses and Inspections"
    },
    capabilities: CARTO_CAPABILITIES,
    formats: ["CSV", "SHP", "GeoJSON", "CARTO SQL API"],
    updateFrequency: "Daily, per OpenDataPhilly catalog",
    endpointStatus: "verified",
    knownFilters: [
      "permitnumber",
      "permittype",
      "permitdescription",
      "typeofwork",
      "permitissuedate",
      "status",
      "zip",
      "address",
      "council_district"
    ],
    defaultOrderBy: "permitissuedate desc",
    warnings: [
      "Very large dataset. Permit tables may include records from multiple source systems."
    ]
  },
  {
    id: "li_violations",
    title: "L&I Code Violations",
    description:
      "Violations issued by Licenses and Inspections under Philadelphia building and occupancy codes.",
    categories: ["Public Safety", "Real Estate / Land Records"],
    tags: ["violations", "unsafe buildings", "L&I"],
    provider: {
      kind: "carto",
      baseUrl: CARTO_BASE_URL,
      table: "violations",
      geometryColumn: "the_geom"
    },
    source: {
      name: "OpenDataPhilly",
      url: "https://opendataphilly.org/datasets/licenses-and-inspections-code-violations/",
      attribution: "City of Philadelphia, Department of Licenses and Inspections"
    },
    capabilities: CARTO_CAPABILITIES,
    formats: ["CSV", "SHP", "CARTO SQL API"],
    updateFrequency: "Daily, per OpenDataPhilly catalog",
    endpointStatus: "verified",
    knownFilters: [
      "casenumber",
      "casestatus",
      "casetype",
      "violationnumber",
      "violationdate",
      "violationstatus",
      "violationcode",
      "address",
      "zip",
      "council_district"
    ],
    defaultOrderBy: "violationdate desc",
    warnings: [
      "The catalog splits downloads by year ranges, but this MCP queries the CARTO table directly with safe limits."
    ]
  },
  {
    id: "building_demolitions",
    title: "Building Demolitions",
    description:
      "Inventory of private and city-related building demolitions in Philadelphia.",
    categories: [
      "Economy",
      "Planning / Zoning",
      "Public Safety",
      "Real Estate / Land Records"
    ],
    tags: ["demolitions", "L&I", "dangerous buildings"],
    provider: {
      kind: "carto",
      baseUrl: CARTO_BASE_URL,
      table: "demolitions",
      geometryColumn: "the_geom"
    },
    source: {
      name: "OpenDataPhilly",
      url: "https://opendataphilly.org/datasets/building-demolitions/",
      attribution: "City of Philadelphia, Department of Licenses and Inspections"
    },
    capabilities: CARTO_CAPABILITIES,
    formats: ["CSV", "SHP", "GeoJSON", "CARTO SQL API"],
    updateFrequency: "Daily, per OpenDataPhilly catalog",
    endpointStatus: "verified",
    knownFilters: [
      "caseorpermitnumber",
      "record_type",
      "typeofwork",
      "city_demo",
      "start_date",
      "completed_date",
      "status",
      "address",
      "zip"
    ],
    defaultOrderBy: "start_date desc"
  },
  {
    id: "vacant_property_indicators_points",
    title: "Vacant Property Indicators - Points",
    description:
      "Likely vacant property points produced from Philadelphia administrative datasets.",
    categories: ["Planning / Zoning", "Real Estate / Land Records"],
    tags: ["vacant property", "vacancy", "L&I"],
    provider: {
      kind: "arcgis",
      layerUrl: `${ARCGIS_ROOT}/Vacant_Indicators_Points/FeatureServer/0`
    },
    source: {
      name: "OpenDataPhilly",
      url: "https://opendataphilly.org/datasets/vacant-property-indicators/",
      attribution: "City of Philadelphia"
    },
    capabilities: ARCGIS_CAPABILITIES,
    formats: ["CSV", "SHP", "GeoJSON", "ArcGIS FeatureServer"],
    endpointStatus: "verified",
    knownFilters: [
      "address",
      "opa_id",
      "zipcode",
      "councildistrict",
      "vacant_flag",
      "vacant_rank"
    ],
    warnings: [
      "Vacancy is model-derived. Treat records as indicators, not legal determinations."
    ]
  },
  {
    id: "neighborhood_boundaries",
    title: "Philadelphia Neighborhoods",
    description:
      "Neighborhood boundaries for 150+ Philadelphia neighborhoods compiled from public maps and feedback.",
    categories: ["Planning / Zoning", "Real Estate / Land Records", "Boundaries"],
    tags: ["neighborhoods", "boundaries"],
    provider: {
      kind: "static",
      format: "geojson",
      url: "https://raw.githubusercontent.com/opendataphilly/odp-data-storage/master/philadelphia-neighborhoods/philadelphia-neighborhoods.geojson"
    },
    source: {
      name: "OpenDataPhilly",
      url: "https://opendataphilly.org/datasets/philadelphia-neighborhoods/",
      attribution: "OpenDataPhilly and Robert Cheetham"
    },
    capabilities: STATIC_GEOJSON_CAPABILITIES,
    formats: ["GeoJSON", "SHP", "GeoPackage", "GeoParquet"],
    updateFrequency: "As cataloged: 1997-2024 source period, metadata modified 2026-05-09",
    endpointStatus: "verified",
    knownFilters: ["NAME", "LISTNAME", "MAPNAME"],
    boundary: {
      type: "neighborhood",
      nameFields: ["LISTNAME", "MAPNAME", "NAME"],
      idFields: ["NAME"]
    }
  },
  {
    id: "council_districts_2024",
    title: "City Council Districts - 2024",
    description: "Philadelphia City Council district boundaries for 2024.",
    categories: ["Elections / Politics", "Boundaries"],
    tags: ["council districts", "boundaries"],
    provider: {
      kind: "arcgis",
      layerUrl: `${ARCGIS_ROOT}/Council_Districts_2024/FeatureServer/0`
    },
    source: {
      name: "OpenDataPhilly",
      url: "https://opendataphilly.org/datasets/city-council-districts/",
      attribution: "City of Philadelphia"
    },
    capabilities: ARCGIS_CAPABILITIES,
    formats: ["CSV", "SHP", "GeoJSON", "ArcGIS FeatureServer"],
    updateFrequency: "As needed, per OpenDataPhilly catalog",
    endpointStatus: "verified",
    knownFilters: ["district", "district_num"],
    boundary: {
      type: "council_district",
      nameFields: ["district"],
      idFields: ["district_num", "district", "objectid"]
    }
  },
  {
    id: "zip_code_boundaries",
    title: "ZIP Codes - Polygon",
    description:
      "Philadelphia ZIP Code polygon areas, slightly modified for logical and cartographic purposes.",
    categories: ["Boundaries"],
    tags: ["zip", "zip codes", "boundaries"],
    provider: {
      kind: "arcgis",
      layerUrl: `${ARCGIS_ROOT}/Zipcodes_Poly/FeatureServer/0`
    },
    source: {
      name: "OpenDataPhilly",
      url: "https://opendataphilly.org/datasets/zip-codes/",
      attribution: "City of Philadelphia"
    },
    capabilities: ARCGIS_CAPABILITIES,
    formats: ["CSV", "SHP", "GeoJSON", "ArcGIS FeatureServer"],
    endpointStatus: "verified",
    knownFilters: ["code", "cod"],
    boundary: {
      type: "zip",
      nameFields: ["code"],
      idFields: ["code", "cod", "objectid"]
    }
  },
  {
    id: "police_district_boundaries",
    title: "Police Districts",
    description:
      "Philadelphia Police Department district boundaries used for public safety geography.",
    categories: ["Public Safety", "Boundaries"],
    tags: ["police", "districts", "boundaries"],
    provider: {
      kind: "arcgis",
      layerUrl: `${ARCGIS_ROOT}/Boundaries_District/FeatureServer/0`
    },
    source: {
      name: "OpenDataPhilly",
      url: "https://opendataphilly.org/datasets/police-districts/",
      attribution: "City of Philadelphia, Philadelphia Police Department"
    },
    capabilities: ARCGIS_CAPABILITIES,
    formats: ["CSV", "SHP", "GeoJSON", "ArcGIS FeatureServer"],
    endpointStatus: "verified",
    knownFilters: ["dist_numc"],
    boundary: {
      type: "police_district",
      nameFields: ["dist_numc"],
      idFields: ["dist_numc", "objectid"]
    }
  }
];

export function findDataset(datasetId: string): DatasetDefinition | undefined {
  return datasets.find((dataset) => dataset.id === datasetId);
}

export function findBoundaryDataset(
  boundaryType: BoundaryType
): DatasetDefinition | undefined {
  return datasets.find((dataset) => dataset.boundary?.type === boundaryType);
}

export function searchDatasets(options: {
  keyword: string;
  category?: string;
  limit: number;
}) {
  const keyword = options.keyword.trim().toLowerCase();
  const category = options.category?.trim().toLowerCase();

  return datasets
    .map((dataset) => {
      const haystack = [
        dataset.id,
        dataset.title,
        dataset.description,
        ...dataset.categories,
        ...dataset.tags,
        ...dataset.knownFilters
      ]
        .join(" ")
        .toLowerCase();

      const categoryMatches =
        !category ||
        dataset.categories.some((item) => item.toLowerCase().includes(category));

      if (!categoryMatches) {
        return { dataset, score: 0 };
      }

      if (!keyword) {
        return { dataset, score: 1 };
      }

      let score = 0;
      if (dataset.id.toLowerCase().includes(keyword)) {
        score += 6;
      }
      if (dataset.title.toLowerCase().includes(keyword)) {
        score += 5;
      }
      if (dataset.tags.some((tag) => tag.toLowerCase().includes(keyword))) {
        score += 3;
      }
      if (haystack.includes(keyword)) {
        score += 1;
      }

      return { dataset, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.dataset.title.localeCompare(b.dataset.title))
    .slice(0, options.limit)
    .map(({ dataset }) => ({
      dataset_id: dataset.id,
      title: dataset.title,
      description: dataset.description,
      categories: dataset.categories,
      source: dataset.source,
      provider: dataset.provider.kind,
      capabilities: dataset.capabilities,
      available_formats: dataset.formats,
      update_frequency: dataset.updateFrequency,
      endpoint_status: dataset.endpointStatus,
      warnings: dataset.warnings ?? []
    }));
}
