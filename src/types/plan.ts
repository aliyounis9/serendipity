// Mirrors the backend schemas in backend/app/schemas.py. Field names match
// the API's JSON (snake_case), so no conversion is needed.

// PlanRead: what the API returns.
export type Plan = {
  id: string;
  title: string;
  description: string | null;
  location: string;
  starts_at: string; // ISO 8601 in UTC, e.g. "2026-11-14T23:00:00Z"
  max_participants: number; // includes the organizer
  created_at: string;
};

// PlanCreate: what the API accepts.
export type NewPlan = {
  title: string;
  description: string | null;
  location: string;
  starts_at: string;
  max_participants: number;
};
