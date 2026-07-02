import { describe, expect, it } from "vitest";
import { buildCartoAggregateSql, filtersToSql } from "./carto.js";

describe("CARTO provider SQL filters", () => {
  it("builds safe SQL for supported filter forms", () => {
    const sql = filtersToSql({
      status: "Open",
      requested_datetime: { gte: "2026-01-01" },
      zipcode: ["19104", "19103"],
      service_name: { like: "%trash%" }
    });

    expect(sql).toContain("status = 'Open'");
    expect(sql).toContain("requested_datetime >= '2026-01-01'");
    expect(sql).toContain("zipcode IN ('19104', '19103')");
    expect(sql).toContain("service_name ILIKE '%trash%'");
  });

  it("escapes single quotes in string values", () => {
    expect(filtersToSql({ address: "O'Reilly St" })).toContain(
      "address = 'O''Reilly St'"
    );
  });

  it("rejects unsafe identifiers", () => {
    expect(() => filtersToSql({ "status;drop": "Open" })).toThrow(
      /Invalid field/
    );
  });

  it("builds safe aggregate SQL", () => {
    const sql = buildCartoAggregateSql(
      {
        kind: "carto",
        baseUrl: "https://example.test/sql",
        table: "public_cases_fc",
        geometryColumn: "the_geom"
      },
      {
        filters: { requested_datetime: { gte: "2026-01-01" } },
        groupBy: ["service_name"],
        metrics: [{ op: "count", as: "case_count" }],
        dateBucket: { field: "requested_datetime", interval: "month" },
        limit: 10,
        orderBy: "case_count desc"
      }
    );

    expect(sql).toContain("date_trunc('month', requested_datetime) AS date_bucket");
    expect(sql).toContain("COUNT(*) AS case_count");
    expect(sql).toContain("GROUP BY service_name, date_trunc('month', requested_datetime)");
    expect(sql).toContain("ORDER BY case_count DESC");
  });
});
