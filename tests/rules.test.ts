import {
  isValidInterestSelection,
  toCompletePreferences,
  toggleInterest,
} from "@/preferences/rules";
import type { Interest } from "@/types/activity";

describe("toggleInterest", () => {
  test("adds an interest", () => {
    expect(toggleInterest(["coffee"], "art")).toEqual(["coffee", "art"]);
  });

  test("removes a selected interest", () => {
    expect(toggleInterest(["coffee", "art"], "coffee")).toEqual(["art"]);
  });

  test("doesn't add a 4th interest", () => {
    expect(toggleInterest(["coffee", "art", "music"], "books")).toEqual([
      "coffee",
      "art",
      "music",
    ]);
  });

  test("can still remove an interest when 3 are selected", () => {
    expect(toggleInterest(["coffee", "art", "music"], "art")).toEqual(["coffee", "music"]);
  });

  test("returns a new array instead of changing the old one", () => {
    const selected: Interest[] = ["coffee"];
    toggleInterest(selected, "art");
    expect(selected).toEqual(["coffee"]);
  });
});

describe("isValidInterestSelection", () => {
  test("1 to 3 interests is valid", () => {
    expect(isValidInterestSelection(["coffee"])).toBe(true);
    expect(isValidInterestSelection(["coffee", "art", "music"])).toBe(true);
  });

  test("0 or 4 interests is invalid", () => {
    expect(isValidInterestSelection([])).toBe(false);
    expect(isValidInterestSelection(["coffee", "art", "music", "books"])).toBe(false);
  });
});

describe("toCompletePreferences", () => {
  test("null if interests weren't answered", () => {
    expect(toCompletePreferences({})).toBeNull();
  });

  test("null if the selection is invalid", () => {
    expect(toCompletePreferences({ interests: [] })).toBeNull();
    expect(
      toCompletePreferences({ interests: ["coffee", "art", "music", "books"] }),
    ).toBeNull();
  });

  test("returns the interests when the selection is valid", () => {
    expect(toCompletePreferences({ interests: ["coffee", "art"] })).toEqual({
      interests: ["coffee", "art"],
    });
  });
});
