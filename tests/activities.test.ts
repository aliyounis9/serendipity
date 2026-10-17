import { ACTIVITIES } from "@/data/activities";

const SF = { minLat: 37.7, maxLat: 37.84, minLng: -122.53, maxLng: -122.35 };

test("activity ids are unique", () => {
  const ids = ACTIVITIES.map((activity) => activity.id);
  expect(new Set(ids).size).toBe(ids.length);
});

describe.each(ACTIVITIES)("$id", (activity) => {
  test("has a direct interest", () => {
    expect(activity.interestTags.length).toBeGreaterThan(0);
  });

  test("doesn't list an interest as both direct and related", () => {
    const both = activity.relatedInterests.filter((tag) => activity.interestTags.includes(tag));
    expect(both).toEqual([]);
  });

  test("cost is 0 or more", () => {
    expect(activity.costUsd).toBeGreaterThanOrEqual(0);
  });

  test("is inside San Francisco", () => {
    const { latitude, longitude } = activity.venue;
    expect(latitude).toBeGreaterThan(SF.minLat);
    expect(latitude).toBeLessThan(SF.maxLat);
    expect(longitude).toBeGreaterThan(SF.minLng);
    expect(longitude).toBeLessThan(SF.maxLng);
  });

  test("has a source", () => {
    expect(activity.sources.length).toBeGreaterThan(0);
  });
});
