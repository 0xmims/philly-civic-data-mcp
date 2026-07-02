import { describe, expect, it } from "vitest";
import { buildCivicQuestionHelp } from "./civicQuestionHelper.js";

describe("civic_question_helper", () => {
  it("recommends aggregation for count and trend questions", () => {
    const help = buildCivicQuestionHelp(
      "How many 311 trash requests by month?"
    );

    expect(help.recommended_tool_calls.map((call) => call.tool)).toContain(
      "aggregate_dataset"
    );
  });

  it("recommends boundary lookup and boundary query for civic geography questions", () => {
    const help = buildCivicQuestionHelp(
      "Show building permits in ZIP 19120"
    );
    const tools = help.recommended_tool_calls.map((call) => call.tool);

    expect(tools).toContain("get_boundary");
    expect(tools).toContain("query_within_boundary");
  });
});
