import type { Interest } from "@/types/activity";

export type UserPreferences = {
  interests: Interest[];
};

// While onboarding is in progress, a missing field means "not answered yet".
export type PreferencesDraft = Partial<UserPreferences>;
