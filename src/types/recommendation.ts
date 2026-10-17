import type { Activity } from "@/types/activity";

// Alignment with the user's selected interests.
// Internal only: participants never see these labels.
export type InterestAlignment = "familiar" | "adjacent" | "novel";

export type Recommendation = {
  activity: Activity;
  alignment: InterestAlignment;
};

export type Decision = "in" | "not_today";

export type DecisionRecord = {
  position: number; // 1 = first activity shown
  activityId: string;
  alignment: InterestAlignment;
  decision: Decision;
};
