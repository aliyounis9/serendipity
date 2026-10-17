export const INTERESTS = {
  coffee: "Coffee & Cafés",
  food: "Food & Tasting",
  nature: "Nature & Scenic Walks",
  sports: "Sports & Fitness",
  art: "Art & Creative Activities",
  music: "Music & Performances",
  games: "Games & Puzzles",
  history: "History & Architecture",
  books: "Books & Literature",
  science: "Science & Technology",
} as const;

export type Interest = keyof typeof INTERESTS;

export type ActivityType = "informal" | "venue" | "scheduled";

export type Activity = {
  id: string;
  title: string;
  description: string;
  // "scheduled" activities occur at times set by an organizer.
  // Specific dates and times should be verified before presenting
  // them as scheduled events.
  activityType: ActivityType;

  interestTags: Interest[];
  relatedInterests: Interest[];

  venue: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  };

  // Approximate per-person budget for doing the activity as described.
  // Not an official price or a guaranteed maximum.
  costUsd: number;

  sources: string[];
};
