import { fetch } from "undici";
import { CivicDataError } from "./errors.js";
import { REQUEST_TIMEOUT_MS, RETRY_ATTEMPTS } from "./limits.js";

export interface JsonFetchOptions {
  timeoutMs?: number;
  attempts?: number;
  method?: "GET" | "POST";
  headers?: Record<string, string>;
  body?: string;
}

export async function fetchJson<T>(
  url: string,
  options: JsonFetchOptions = {}
): Promise<T> {
  const attempts = options.attempts ?? RETRY_ATTEMPTS;
  let lastError: unknown;

  for (let attempt = 0; attempt <= attempts; attempt += 1) {
    const controller = new AbortController();
    const timeoutMs = options.timeoutMs ?? REQUEST_TIMEOUT_MS;
    const timeout = setTimeout(
      () => controller.abort(),
      timeoutMs
    );

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        method: options.method ?? "GET",
        body: options.body,
        headers: {
          accept: "application/json",
          "user-agent": "philly-civic-data-mcp/0.1",
          ...options.headers
        }
      });

      if (
        response.status === 429 ||
        response.status === 502 ||
        response.status === 503 ||
        response.status === 504
      ) {
        throw new Error(`Transient HTTP ${response.status} from ${url}`);
      }

      if (!response.ok) {
        const body = await response.text();
        throw new Error(
          `HTTP ${response.status} from ${url}: ${body.slice(0, 300)}`
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      lastError = isAbortError(error)
        ? new CivicDataError(
            `Request timed out after ${timeoutMs}ms.`,
            "request_timeout",
            { url, timeout_ms: timeoutMs }
          )
        : error;
      if (attempt === attempts) {
        break;
      }
      await sleep(150 * (attempt + 1));
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isAbortError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === "AbortError" || error.message.toLowerCase().includes("aborted"))
  );
}
