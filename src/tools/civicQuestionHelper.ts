import { datasets } from "../registry/datasets.js";

interface DatasetSuggestion {
  dataset_id: string;
  title: string;
  reason: string;
}

export function buildCivicQuestionHelp(question: string) {
  const normalized = question.toLowerCase();
  const suggestions: DatasetSuggestion[] = [];
  const joins: string[] = [];
  const caveats: string[] = [
    "This helper suggests datasets and tool calls only; it does not answer the civic question by itself.",
    "Use query limits and filters first, then broaden only when needed."
  ];
  const calls: Record<string, unknown>[] = [
    {
      tool: "search_datasets",
      input: {
        keyword: keywordFromQuestion(normalized),
        limit: 5
      }
    }
  ];

  addIfMatches(suggestions, normalized, {
    dataset_id: "311_service_requests",
    terms: ["311", "pothole", "trash", "streetlight", "request", "complaint"],
    reason: "Useful for service and information requests by status, service type, ZIP, and location."
  });
  addIfMatches(suggestions, normalized, {
    dataset_id: "building_permits",
    terms: ["permit", "construction", "zoning", "renovation", "building"],
    reason: "Useful for construction and zoning permit activity by address, date, ZIP, or council district."
  });
  addIfMatches(suggestions, normalized, {
    dataset_id: "li_violations",
    terms: ["violation", "unsafe", "code", "l&i", "inspection"],
    reason: "Useful for code violation status, violation type, address, and council district questions."
  });
  addIfMatches(suggestions, normalized, {
    dataset_id: "building_demolitions",
    terms: ["demolition", "demo", "demolished"],
    reason: "Useful for private and city demolition activity by date, status, and address."
  });
  addIfMatches(suggestions, normalized, {
    dataset_id: "vacant_property_indicators_points",
    terms: ["vacant", "vacancy", "abandoned"],
    reason: "Useful for likely vacant property indicators near an address or inside a civic boundary."
  });
  addIfMatches(suggestions, normalized, {
    dataset_id: "property_assessments",
    terms: ["property", "assessment", "owner", "market value", "parcel", "tax"],
    reason: "Useful for parcel-level assessment attributes and property characteristics."
  });
  addIfMatches(suggestions, normalized, {
    dataset_id: "neighborhood_boundaries",
    terms: ["neighborhood", "near me", "nearby"],
    reason: "Useful for mapping a named neighborhood to a geometry before filtering other datasets."
  });
  addIfMatches(suggestions, normalized, {
    dataset_id: "council_districts_2024",
    terms: ["council", "district"],
    reason: "Useful for boundary lookup and district-based filtering or aggregation."
  });
  addIfMatches(suggestions, normalized, {
    dataset_id: "building_certifications",
    terms: ["certification", "certifications", "fire alarm", "sprinkler", "facade", "fire escape", "standpipe"],
    reason: "Useful for building safety certification filings, results, and expirations. No geometry; join by address or bin for mapping."
  });
  addIfMatches(suggestions, normalized, {
    dataset_id: "building_certification_summary",
    terms: ["certification status", "compliance status", "expired certification"],
    reason: "Useful for per-structure current certification status by system."
  });
  addIfMatches(suggestions, normalized, {
    dataset_id: "li_appeals",
    terms: ["appeal", "appeals", "zba", "variance", "zoning board", "refusal"],
    reason: "Useful for ZBA, LIRB, and BBS appeals with hearing decisions and provisos."
  });
  addIfMatches(suggestions, normalized, {
    dataset_id: "real_estate_transfers",
    terms: ["deed", "deeds", "transfer", "sale", "sold", "grantor", "grantee", "mortgage"],
    reason: "Useful for recorded property transfers and considerations. Filter document_type and dates; the table is very large."
  });
  addIfMatches(suggestions, normalized, {
    dataset_id: "registered_historic_properties",
    terms: ["historic", "preservation", "landmark"],
    reason: "Useful for local historic register status. Catalog copy last updated 2017; confirm with the Historical Commission."
  });
  addIfMatches(suggestions, normalized, {
    dataset_id: "zoning_base_districts",
    terms: ["zoning", "zoned", "rezoning", "remapping", "land use"],
    reason: "Useful for what a parcel or area is zoned, including pending remapping bills."
  });
  addIfMatches(suggestions, normalized, {
    dataset_id: "crime_incidents",
    terms: ["crime", "theft", "burglary", "robbery", "assault", "incident"],
    reason: "Useful for police incident counts and locations by offense type, district, and date. Filter aggressively; 3.5M+ rows."
  });
  addIfMatches(suggestions, normalized, {
    dataset_id: "shooting_victims",
    terms: ["shooting", "shootings", "gun violence", "shot"],
    reason: "Useful for fatal and nonfatal shooting victim locations and trends."
  });
  addIfMatches(suggestions, normalized, {
    dataset_id: "li_complaints",
    terms: ["complaint", "complaints"],
    reason: "Useful for L&I code-enforcement complaints; join to investigations or violations for outcomes."
  });
  addIfMatches(suggestions, normalized, {
    dataset_id: "unsafe_buildings",
    terms: ["unsafe", "dangerous building", "collapse"],
    reason: "Useful for buildings declared unsafe or imminently dangerous by L&I."
  });
  addIfMatches(suggestions, normalized, {
    dataset_id: "business_licenses",
    terms: ["license", "rental", "landlord", "airbnb", "business"],
    reason: "Useful for business and rental license status, categories, and unit counts."
  });
  addIfMatches(suggestions, normalized, {
    dataset_id: "commercial_corridors",
    terms: ["corridor", "retail", "storefront", "vacancy rate"],
    reason: "Useful for commercial corridor boundaries and survey-based vacancy and condition metrics."
  });

  if (suggestions.length === 0) {
    suggestions.push(
      suggestionFor("311_service_requests", "Broad civic-service starting point."),
      suggestionFor("property_assessments", "Broad property and parcel starting point.")
    );
  }

  if (mentionsReachability(normalized)) {
    calls.push(
      {
        tool: "get_isochrone",
        input: {
          latitude: "<latitude>",
          longitude: "<longitude>",
          mode: normalized.includes("driv") ? "drive" : "walk",
          minutes: 15
        }
      },
      {
        tool: "query_within_polygon",
        input: {
          dataset_id: suggestions[0]?.dataset_id ?? "property_assessments",
          polygon: "<polygon geometry from get_isochrone>",
          filters: {},
          limit: 25
        }
      }
    );
    joins.push(
      "For travel-time questions, compute an isochrone first, then pass its polygon to query_within_polygon on a spatial dataset."
    );
  }

  if (mentionsBoundary(normalized)) {
    const boundaryType = boundaryTypeFromQuestion(normalized);
    calls.push({
      tool: "get_boundary",
      input: {
        boundary_type: boundaryType,
        name: "<boundary name or id>"
      }
    });
    joins.push(
      "For boundary-scoped questions, fetch the boundary first, then use query_within_boundary for providers that support polygon filtering."
    );
  }

  if (mentionsSchemaNeed(normalized)) {
    calls.push({
      tool: "get_dataset_schema",
      input: {
        dataset_id: suggestions[0]?.dataset_id ?? "311_service_requests"
      }
    });
  }

  if (mentionsAggregate(normalized)) {
    calls.push({
      tool: "aggregate_dataset",
      input: {
        dataset_id: suggestions[0]?.dataset_id ?? "311_service_requests",
        filters: {},
        group_by: boundaryGroupByFromQuestion(normalized),
        metrics: [{ op: "count", as: "count" }],
        limit: 25
      }
    });
  }

  if (mentionsNearby(normalized) && !mentionsBoundary(normalized)) {
    const dataset = suggestions[0]?.dataset_id ?? "311_service_requests";
    calls.push({
      tool: "query_nearby",
      input: {
        dataset_id: dataset,
        latitude: "<latitude>",
        longitude: "<longitude>",
        radius_meters: 500,
        limit: 25
      }
    });
  } else if (mentionsBoundary(normalized)) {
    calls.push({
      tool: "query_within_boundary",
      input: {
        dataset_id: suggestions[0]?.dataset_id ?? "311_service_requests",
        boundary_type: boundaryTypeFromQuestion(normalized),
        boundary_name: "<boundary name or id>",
        filters: {},
        limit: 25
      }
    });
  } else {
    calls.push({
      tool: "query_dataset",
      input: {
        dataset_id: suggestions[0]?.dataset_id ?? "311_service_requests",
        filters: {},
        limit: 25
      }
    });
  }

  if (normalized.includes("compare") || normalized.includes("trend")) {
    caveats.push(
      "Trend or comparison questions need explicit date fields, date buckets, and provider support for aggregate_dataset."
    );
  }

  if (normalized.includes("owner")) {
    caveats.push(
      "Owner and mailing data can be sensitive. Request only necessary fields and verify before using operationally."
    );
  }

  return {
    question,
    suggested_datasets: uniqueSuggestions(suggestions),
    required_joins: joins,
    caveats,
    recommended_tool_calls: calls,
    retrieved_at: new Date().toISOString()
  };
}

function addIfMatches(
  suggestions: DatasetSuggestion[],
  question: string,
  rule: { dataset_id: string; terms: string[]; reason: string }
): void {
  if (rule.terms.some((term) => question.includes(term))) {
    suggestions.push(suggestionFor(rule.dataset_id, rule.reason));
  }
}

function suggestionFor(datasetId: string, reason: string): DatasetSuggestion {
  const dataset = datasets.find((item) => item.id === datasetId);
  return {
    dataset_id: datasetId,
    title: dataset?.title ?? datasetId,
    reason
  };
}

function uniqueSuggestions(items: DatasetSuggestion[]): DatasetSuggestion[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.dataset_id)) {
      return false;
    }
    seen.add(item.dataset_id);
    return true;
  });
}

function keywordFromQuestion(question: string): string {
  const tokens = question
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 3)
    .slice(0, 3);

  return tokens.join(" ") || question.slice(0, 40);
}

function mentionsBoundary(question: string): boolean {
  return ["neighborhood", "council", "district", "zip", "police", "tract"].some(
    (term) => question.includes(term)
  );
}

function mentionsNearby(question: string): boolean {
  return ["near", "nearby", "within", "around", "closest"].some((term) =>
    question.includes(term)
  );
}

function mentionsReachability(question: string): boolean {
  return [
    "walking distance",
    "walkable",
    "minute walk",
    "minutes walk",
    "minute drive",
    "minutes drive",
    "minute bike",
    "minutes bike",
    "travel time",
    "reachable",
    "isochrone",
    "commute"
  ].some((term) => question.includes(term));
}

function mentionsAggregate(question: string): boolean {
  return [
    "count",
    "counts",
    "how many",
    "trend",
    "trends",
    "compare",
    "group",
    "by month",
    "by year",
    "total"
  ].some((term) => question.includes(term));
}

function mentionsSchemaNeed(question: string): boolean {
  return [
    "field",
    "fields",
    "filter",
    "filters",
    "schema",
    "column",
    "columns",
    "status",
    "type"
  ].some((term) => question.includes(term));
}

function boundaryGroupByFromQuestion(question: string): string[] | undefined {
  if (question.includes("zip")) {
    return ["zipcode"];
  }
  if (question.includes("council")) {
    return ["council_district"];
  }
  return undefined;
}

function boundaryTypeFromQuestion(question: string): string {
  if (question.includes("neighborhood")) {
    return "neighborhood";
  }
  if (question.includes("council")) {
    return "council_district";
  }
  if (question.includes("police")) {
    return "police_district";
  }
  if (question.includes("tract")) {
    return "census_tract";
  }
  return "zip";
}
