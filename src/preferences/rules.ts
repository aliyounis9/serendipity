import type { Interest } from "@/types/activity";
import type { PreferencesDraft, UserPreferences } from "@/types/preferences";

export const MIN_INTERESTS = 1;
export const MAX_INTERESTS = 3;

export function toggleInterest(selected: Interest[], interest: Interest): Interest[] {
  if (selected.includes(interest)) {
    return selected.filter((item) => item !== interest);
  }
  if (selected.length >= MAX_INTERESTS) {
    return selected;
  }
  return [...selected, interest];
}

export function isValidInterestSelection(selected: Interest[]): boolean {
  return selected.length >= MIN_INTERESTS && selected.length <= MAX_INTERESTS;
}

// Returns null until every onboarding question has a valid answer.
export function toCompletePreferences(draft: PreferencesDraft): UserPreferences | null {
  const { interests, maxBudgetUsd, maxDistanceMiles } = draft;

  if (!interests || !isValidInterestSelection(interests)) {
    return null;
  }
  if (maxBudgetUsd === undefined || maxDistanceMiles === undefined) {
    return null;
  }
  return { interests, maxBudgetUsd, maxDistanceMiles };
}
