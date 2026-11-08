import type { NewPlan, PlaceSuggestion, Plan } from "@/types/plan";

// Set in .env.local for local development (see .env.example).
// When it's missing (e.g. the deployed site), plan features are turned off.
export const API_URL = process.env.EXPO_PUBLIC_API_URL || undefined;

const TIMEOUT_MS = 10_000;

export type ApiErrorKind = "not_configured" | "network" | "validation" | "not_found" | "server";

export class ApiError extends Error {
  constructor(
    readonly kind: ApiErrorKind,
    message: string,
    // For 422 responses: field name (e.g. "title") -> message.
    readonly fieldErrors: Record<string, string> = {},
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function fetchPlans(apiUrl = API_URL): Promise<Plan[]> {
  return request<Plan[]>(apiUrl, "/plans");
}

export function fetchPlan(id: string, apiUrl = API_URL): Promise<Plan> {
  return request<Plan>(apiUrl, `/plans/${encodeURIComponent(id)}`);
}

export function createPlan(plan: NewPlan, apiUrl = API_URL): Promise<Plan> {
  return request<Plan>(apiUrl, "/plans", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(plan),
  });
}

// Location suggestions. Our backend calls Google, so the API key never
// reaches the app.
export function fetchPlaceSuggestions(query: string, apiUrl = API_URL): Promise<PlaceSuggestion[]> {
  return request<PlaceSuggestion[]>(apiUrl, `/places/autocomplete?q=${encodeURIComponent(query)}`);
}

async function request<T>(apiUrl: string | undefined, path: string, init?: RequestInit): Promise<T> {
  if (!apiUrl) {
    throw new ApiError("not_configured", "Plans aren't available in this version of the app.");
  }

  // Abort the request if the server doesn't answer, instead of waiting forever.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${apiUrl}${path}`, { ...init, signal: controller.signal });
  } catch {
    // fetch only rejects when no response arrived: server down, no network,
    // CORS blocked, or our timeout.
    throw new ApiError(
      "network",
      "Couldn't reach the Serendipity server. Check that it's running and try again.",
    );
  } finally {
    clearTimeout(timeout);
  }

  if (response.ok) {
    return (await response.json()) as T;
  }
  if (response.status === 422) {
    const body = await response.json().catch(() => null);
    throw new ApiError("validation", "Some fields need attention.", toFieldErrors(body));
  }
  if (response.status === 404) {
    throw new ApiError("not_found", "This plan doesn't exist.");
  }
  throw new ApiError("server", "Something went wrong on the server. Please try again.");
}

// FastAPI's 422 body: {"detail": [{"loc": ["body", "title"], "msg": "..."}]}
function toFieldErrors(body: unknown): Record<string, string> {
  const errors: Record<string, string> = {};
  const detail = (body as { detail?: unknown } | null)?.detail;
  if (!Array.isArray(detail)) {
    return errors;
  }
  for (const item of detail) {
    const field = item?.loc?.at(-1);
    if (typeof field === "string" && typeof item.msg === "string") {
      // Pydantic prefixes custom validator messages with "Value error, ".
      errors[field] = item.msg.replace("Value error, ", "");
    }
  }
  return errors;
}
