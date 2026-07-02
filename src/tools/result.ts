import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { ZodError } from "zod";
import { CivicDataError, toErrorMessage } from "../utils/errors.js";

export function jsonToolResult(data: unknown): CallToolResult {
  const structuredContent =
    data && typeof data === "object" && !Array.isArray(data)
      ? (data as Record<string, unknown>)
      : { value: data };

  return {
    structuredContent,
    content: [
      {
        type: "text",
        text: JSON.stringify(structuredContent, null, 2)
      }
    ]
  };
}

export function errorToolResult(error: unknown): CallToolResult {
  const payload = errorPayload(error);
  return {
    isError: true,
    structuredContent: payload,
    content: [
      {
        type: "text",
        text: JSON.stringify(payload, null, 2)
      }
    ]
  };
}

function errorPayload(error: unknown): Record<string, unknown> {
  if (error instanceof ZodError) {
    return {
      error: {
        code: "validation_error",
        message: "Tool input failed validation.",
        issues: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message
        }))
      }
    };
  }

  if (error instanceof CivicDataError) {
    return {
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      }
    };
  }

  return {
    error: {
      code: "unexpected_error",
      message: toErrorMessage(error)
    }
  };
}
