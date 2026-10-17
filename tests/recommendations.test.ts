import {
  buildRecommendations,
  classifyActivity,
  shuffle,
} from "@/recommendation/recommendations";
import type { Activity, Interest } from "@/types/activity";
import type { Recommendation } from "@/types/recommendation";

function makeActivity(
  id: string,
  interestTags: Interest[],
  relatedInterests: Interest[] = [],
): Activity {
  return {
    id,
    title: id,
    description: "",
    activityType: "venue",
    interestTags,
    relatedInterests,
    venue: { name: "", address: "", latitude: 37.79, longitude: -122.42 },
    costUsd: 0,
    sources: [],
  };
}

// With the interest "history", these are familiar, adjacent, and novel.
const familiar = (id: string) => makeActivity(id, ["history"]);
const adjacent = (id: string) => makeActivity(id, ["games"], ["history"]);
const novel = (id: string) => makeActivity(id, ["coffee"]);

// Same sort key for every item, so the order stays as it is.
const noShuffle = () => 0;

const ids = (recommendations: Recommendation[]) =>
  recommendations.map((recommendation) => recommendation.activity.id);

describe("classifyActivity", () => {
  test("direct match is familiar", () => {
    expect(classifyActivity(makeActivity("x", ["art", "nature"]), ["nature"])).toBe("familiar");
  });

  test("related match only is adjacent", () => {
    expect(classifyActivity(adjacent("x"), ["history"])).toBe("adjacent");
  });

  test("no match is novel", () => {
    expect(classifyActivity(adjacent("x"), ["coffee"])).toBe("novel");
  });

  test("familiar wins when both match", () => {
    expect(classifyActivity(adjacent("x"), ["games", "history"])).toBe("familiar");
  });
});

describe("buildRecommendations", () => {
  test("picks 2 of each category when there are enough", () => {
    const activities = [
      familiar("f1"), familiar("f2"), familiar("f3"),
      adjacent("a1"), adjacent("a2"), adjacent("a3"),
      novel("n1"), novel("n2"), novel("n3"),
    ];
    const result = buildRecommendations(activities, ["history"], noShuffle);
    expect(ids(result)).toEqual(["f1", "f2", "a1", "a2", "n1", "n2"]);
  });

  test("gives each activity the right category", () => {
    const activities = [familiar("f1"), adjacent("a1"), novel("n1")];
    const result = buildRecommendations(activities, ["history"], noShuffle);
    expect(result.map((r) => [r.activity.id, r.alignment])).toEqual([
      ["f1", "familiar"],
      ["a1", "adjacent"],
      ["n1", "novel"],
    ]);
  });

  test("fills empty adjacent slots with other activities", () => {
    const activities = [
      familiar("f1"), familiar("f2"), familiar("f3"), familiar("f4"),
      novel("n1"), novel("n2"), novel("n3"), novel("n4"),
    ];
    const result = buildRecommendations(activities, ["history"], noShuffle);
    expect(ids(result)).toEqual(["f1", "f2", "n1", "n2", "f3", "f4"]);
  });

  test("shows everything when there are fewer than 6", () => {
    const activities = [familiar("f1"), novel("n1"), novel("n2")];
    expect(buildRecommendations(activities, ["history"])).toHaveLength(3);
  });

  test("empty dataset gives no recommendations", () => {
    expect(buildRecommendations([], ["history"])).toEqual([]);
  });

  test("never more than 6 and no repeats, over random runs", () => {
    const activities = [
      familiar("f1"), familiar("f2"), familiar("f3"), familiar("f4"),
      adjacent("a1"), adjacent("a2"), adjacent("a3"),
      novel("n1"), novel("n2"), novel("n3"), novel("n4"), novel("n5"),
    ];
    for (let run = 0; run < 50; run++) {
      const result = ids(buildRecommendations(activities, ["history"]));
      expect(result).toHaveLength(6);
      expect(new Set(result).size).toBe(6);
    }
  });

  test("doesn't modify the activities array", () => {
    const activities = [familiar("f1"), adjacent("a1"), novel("n1"), novel("n2")];
    const before = JSON.stringify(activities);
    buildRecommendations(activities, ["history"]);
    expect(JSON.stringify(activities)).toBe(before);
  });
});

describe("shuffle", () => {
  const items: Recommendation[] = ["a", "b", "c"].map((id) => ({
    activity: novel(id),
    alignment: "novel",
  }));

  test("orders items by their random keys", () => {
    const keys = [0.9, 0.1, 0.5];
    let call = 0;
    expect(ids(shuffle(items, () => keys[call++]))).toEqual(["b", "c", "a"]);
  });

  test("keeps all items", () => {
    expect(ids(shuffle(items, Math.random)).sort()).toEqual(["a", "b", "c"]);
  });

  test("doesn't modify the original array", () => {
    shuffle(items, Math.random);
    expect(ids(items)).toEqual(["a", "b", "c"]);
  });
});
