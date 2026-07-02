import { describe, expect, it } from "vitest";
import { aggregateRecords } from "./staticFile.js";

describe("static provider aggregation", () => {
  it("aggregates records locally by group and count distinct metrics", () => {
    const rows = aggregateRecords(
      [
        { kind: "permit", zipcode: "19104", date: "2026-01-05" },
        { kind: "permit", zipcode: "19104", date: "2026-01-20" },
        { kind: "violation", zipcode: "19103", date: "2026-02-01" }
      ],
      {
        groupBy: ["kind"],
        metrics: [
          { op: "count", as: "row_count" },
          { op: "count_distinct", field: "zipcode", as: "zip_count" }
        ],
        limit: 10,
        orderBy: "kind asc"
      }
    );

    expect(rows).toEqual([
      { kind: "permit", row_count: 2, zip_count: 1 },
      { kind: "violation", row_count: 1, zip_count: 1 }
    ]);
  });
});
