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

// CARTO tables whose the_geom column is entirely NULL: attribute queries and
// aggregation work, but nearby/boundary/polygon queries would silently match nothing.
const CARTO_NON_SPATIAL_CAPABILITIES: ProviderCapabilities = {
  supportsSchema: true,
  supportsQuery: true,
  supportsNearby: false,
  supportsGeoQuery: false,
  supportsAggregation: true,
  supportsBoundaryQuery: false,
  geometryFormat: "none",
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
    id: "building_certifications",
    title: "L&I Building Certifications",
    description:
      "Building safety certifications filed with Licenses and Inspections by licensed inspection companies: fire alarm, sprinkler, standpipe, facade, fire escape, and pier inspections.",
    categories: ["Public Safety", "Real Estate / Land Records"],
    tags: ["certifications", "fire safety", "facade", "sprinkler", "fire alarm", "L&I"],
    provider: {
      kind: "carto",
      baseUrl: CARTO_BASE_URL,
      table: "building_certs",
      geometryColumn: "the_geom"
    },
    source: {
      name: "OpenDataPhilly",
      url: "https://opendataphilly.org/datasets/licenses-and-inspections-building-certifications/",
      attribution: "City of Philadelphia, Department of Licenses and Inspections"
    },
    capabilities: CARTO_NON_SPATIAL_CAPABILITIES,
    formats: ["CSV", "CARTO SQL API"],
    endpointStatus: "verified",
    knownFilters: [
      "address",
      "zip",
      "buildingcertnumber",
      "buildingcerttype",
      "inspectionresult",
      "inspectiondate",
      "expirationdate",
      "bin",
      "council_district"
    ],
    defaultOrderBy: "expirationdate desc",
    warnings: [
      "Records have no geometry. For mapping or spatial questions, join to property_assessments or li_appeals by address, or use the bin field.",
      "Certification and expiration status should be confirmed with L&I before treating it as a legal determination."
    ]
  },
  {
    id: "building_certification_summary",
    title: "L&I Building Certifications Summary",
    description:
      "Per-structure summary of current certification status by system: fire alarm, standpipe, smoke control, pier, fire escape, private bridge, emergency standby power, and special hazards.",
    categories: ["Public Safety", "Real Estate / Land Records"],
    tags: ["certifications", "fire safety", "compliance", "L&I"],
    provider: {
      kind: "carto",
      baseUrl: CARTO_BASE_URL,
      table: "building_cert_summary",
      geometryColumn: "the_geom"
    },
    source: {
      name: "OpenDataPhilly",
      url: "https://opendataphilly.org/datasets/licenses-and-inspections-building-certifications/",
      attribution: "City of Philadelphia, Department of Licenses and Inspections"
    },
    capabilities: CARTO_NON_SPATIAL_CAPABILITIES,
    formats: ["CSV", "CARTO SQL API"],
    endpointStatus: "verified",
    knownFilters: [
      "structure_id",
      "id_type",
      "fire_alarm_status",
      "standpipe_status",
      "smoke_control_status",
      "pier_status",
      "fire_escape_status",
      "private_bridge_status",
      "emer_stdby_pwr_sys_status",
      "special_hazards_status"
    ],
    warnings: [
      "Records have no geometry. structure_id identifies the structure and id_type tells you which identifier system it uses; pick the join key accordingly.",
      "Status fields summarize the detailed building_certifications records. Query that dataset for individual filings."
    ]
  },
  {
    id: "li_appeals",
    title: "L&I Appeals (ZBA, LIRB, BBS)",
    description:
      "Appeals of code violations and permit refusals heard by the Zoning Board of Adjustment, L&I Review Board, and Board of Building Standards, including hearing decisions and provisos.",
    categories: ["Planning / Zoning", "Real Estate / Land Records"],
    tags: ["appeals", "ZBA", "zoning board", "variance", "L&I", "decisions"],
    provider: {
      kind: "carto",
      baseUrl: CARTO_BASE_URL,
      table: "appeals",
      geometryColumn: "the_geom"
    },
    source: {
      name: "OpenDataPhilly",
      url: "https://opendataphilly.org/datasets/licenses-and-inspections-appeals-of-code-violations-and-permit-refusals/",
      attribution: "City of Philadelphia, Department of Licenses and Inspections"
    },
    capabilities: CARTO_CAPABILITIES,
    formats: ["CSV", "CARTO SQL API"],
    endpointStatus: "verified",
    knownFilters: [
      "appealnumber",
      "appealtype",
      "appealstatus",
      "appellanttype",
      "primaryappellant",
      "createddate",
      "scheduleddate",
      "decision",
      "decisiondate",
      "relatedpermit",
      "address",
      "zip",
      "opa_account_num",
      "council_district"
    ],
    defaultOrderBy: "createddate desc",
    warnings: [
      "Not every appeal record is geocoded. Spatial queries return only records with geometry."
    ]
  },
  {
    id: "real_estate_transfers",
    title: "Real Estate Transfers (Recorder of Deeds)",
    description:
      "Property transfer documents recorded with the Department of Records, including deeds, mortgages, and related instruments with realty transfer tax details.",
    categories: ["Real Estate / Land Records"],
    tags: ["deeds", "transfers", "sales", "recorder of deeds", "mortgages"],
    provider: {
      kind: "carto",
      baseUrl: CARTO_BASE_URL,
      table: "rtt_summary",
      geometryColumn: "the_geom"
    },
    source: {
      name: "OpenDataPhilly",
      url: "https://opendataphilly.org/datasets/real-estate-transfers/",
      attribution: "City of Philadelphia, Department of Records"
    },
    capabilities: CARTO_CAPABILITIES,
    formats: ["CSV", "CARTO SQL API"],
    endpointStatus: "verified",
    knownFilters: [
      "document_id",
      "document_type",
      "display_date",
      "recording_date",
      "street_address",
      "zip_code",
      "ward",
      "grantors",
      "grantees",
      "total_consideration",
      "opa_account_num"
    ],
    defaultOrderBy: "display_date desc",
    warnings: [
      "Very large dataset (5M+ documents). Always filter by date range, document_type, address, or ZIP.",
      "Includes many document types beyond sales (mortgages, satisfactions). Filter document_type = 'DEED' for sales analysis, and note that nominal-consideration transfers ($1 deeds) are common."
    ]
  },
  {
    id: "registered_historic_properties",
    title: "Philadelphia Registered Historic Properties",
    description:
      "Properties and district parcels listed on the Philadelphia Register of Historic Places, maintained by the Philadelphia Historical Commission.",
    categories: ["Arts / Culture / History", "Planning / Zoning", "Real Estate / Land Records"],
    tags: ["historic", "preservation", "historical commission", "register"],
    provider: {
      kind: "carto",
      baseUrl: CARTO_BASE_URL,
      table: "historic_sites_philreg",
      geometryColumn: "the_geom"
    },
    source: {
      name: "OpenDataPhilly",
      url: "https://opendataphilly.org/datasets/philadelphia-registered-historic-properties/",
      attribution: "City of Philadelphia, Philadelphia City Planning Commission"
    },
    capabilities: CARTO_CAPABILITIES,
    formats: ["CSV", "GeoJSON", "SHP", "CARTO SQL API"],
    updateFrequency: "Catalog copy last updated July 2017",
    endpointStatus: "verified",
    knownFilters: ["loc", "district"],
    warnings: [
      "The catalog copy of this layer was last updated in 2017. Confirm current designation status with the Philadelphia Historical Commission (215-686-7660) before relying on it."
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
