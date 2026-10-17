import type { Interest } from "@/types/activity";

export type UserPreferences = {
  interests: Interest[];
  // null means the user chose "No limit".
  maxBudgetUsd: number | null;
  maxDistanceMiles: number | null;
};

// While onboarding is in progress, a missing field means "not answered yet".
export type PreferencesDraft = Partial<UserPreferences>;
