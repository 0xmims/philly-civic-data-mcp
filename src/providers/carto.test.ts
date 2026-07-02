import { describe, expect, it } from "vitest";
import { filtersToSql } from "./carto.js";

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
});
