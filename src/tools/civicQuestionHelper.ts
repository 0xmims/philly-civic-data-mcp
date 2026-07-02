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

  if (suggestions.length === 0) {
    suggestions.push(
      suggestionFor("311_service_requests", "Broad civic-service starting point."),
      suggestionFor("property_assessments", "Broad property and parcel starting point.")
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
  return ["neighborhood", "council", "district", "zip", "police"].some((term) =>
    question.includes(term)
  );
}

function mentionsNearby(question: string): boolean {
  return ["near", "nearby", "within", "around", "closest"].some((term) =>
    question.includes(term)
  );
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
  return "zip";
}
