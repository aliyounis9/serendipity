import type { Activity, Interest } from "@/types/activity";
import type { InterestAlignment, Recommendation } from "@/types/recommendation";

const MAX_RECOMMENDATIONS = 6;
const TARGET_PER_ALIGNMENT = 2;
const ALIGNMENTS: InterestAlignment[] = ["familiar", "adjacent", "novel"];

export function classifyActivity(activity: Activity, interests: Interest[]): InterestAlignment {
  if (activity.interestTags.some((tag) => interests.includes(tag))) {
    return "familiar";
  }
  if (activity.relatedInterests.some((tag) => interests.includes(tag))) {
    return "adjacent";
  }
  return "novel";
}

// Aims for 2 familiar, 2 adjacent, and 2 novel activities. Short categories
// are filled from the leftovers of the others. The result is in shuffled order.
export function buildRecommendations(
  activities: Activity[],
  interests: Interest[],
  random: () => number = Math.random,
): Recommendation[] {
  const classified = activities.map((activity) => ({
    activity,
    alignment: classifyActivity(activity, interests),
  }));

  const selected: Recommendation[] = [];
  const leftovers: Recommendation[] = [];

  for (const alignment of ALIGNMENTS) {
    const bucket = shuffle(
      classified.filter((recommendation) => recommendation.alignment === alignment),
      random,
    );
    selected.push(...bucket.slice(0, TARGET_PER_ALIGNMENT));
    leftovers.push(...bucket.slice(TARGET_PER_ALIGNMENT));
  }

  const openSlots = MAX_RECOMMENDATIONS - selected.length;
  selected.push(...shuffle(leftovers, random).slice(0, openSlots));

  return shuffle(selected, random);
}

// Gives each item a random sort key, then orders by it. Returns a new array
// and leaves the input unchanged.
export function shuffle(
  items: Recommendation[],
  random: () => number,
): Recommendation[] {
  return items
    .map((item) => ({ item, key: random() }))
    .sort((a, b) => a.key - b.key)
    .map(({ item }) => item);
}
