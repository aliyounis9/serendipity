import {
  apiFieldToFormField,
  parsePlanDateTime,
  todayInSanFrancisco,
  validatePlanForm,
  type PlanForm,
} from "@/plans/form";

// A fixed "now" keeps the future-date checks predictable:
// Nov 7, 2026, 12:00 in San Francisco (PST, UTC-8) = 20:00 UTC.
const NOW = new Date("2026-11-07T20:00:00Z");

function form(overrides: Partial<PlanForm> = {}): PlanForm {
  return {
    title: "Coffee at Saint Frank",
    description: "",
    location: "2340 Polk St",
    date: "2026-11-21",
    time: "15:00",
    maxParticipants: 3,
    ...overrides,
  };
}

describe("parsePlanDateTime", () => {
  test("reads date and time as San Francisco time", () => {
    // November is winter time (PST, UTC-8): 15:00 in SF is 23:00 UTC.
    expect(parsePlanDateTime("2026-11-21", "15:00")?.toISOString()).toBe("2026-11-21T23:00:00.000Z");
    expect(parsePlanDateTime(" 2026-11-21 ", "9:05")?.toISOString()).toBe("2026-11-21T17:05:00.000Z");
  });

  test("handles daylight saving time", () => {
    // July is summer time (PDT, UTC-7): 15:00 in SF is 22:00 UTC.
    expect(parsePlanDateTime("2026-07-01", "15:00")?.toISOString()).toBe("2026-07-01T22:00:00.000Z");
  });

  test("rejects times that don't exist instead of rolling them over", () => {
    expect(parsePlanDateTime("2026-02-30", "15:00")).toBeNull();
    expect(parsePlanDateTime("2026-13-01", "15:00")).toBeNull();
    expect(parsePlanDateTime("2026-11-21", "24:00")).toBeNull();
    expect(parsePlanDateTime("2026-11-21", "15:60")).toBeNull();
    // SF clocks jump from 2:00 to 3:00 on Mar 8, 2026, so 2:30 never happens.
    expect(parsePlanDateTime("2026-03-08", "02:30")).toBeNull();
  });

  test("rejects the wrong format", () => {
    expect(parsePlanDateTime("11/21/2026", "15:00")).toBeNull();
    expect(parsePlanDateTime("2026-11-21", "3pm")).toBeNull();
    expect(parsePlanDateTime("", "")).toBeNull();
  });
});

describe("validatePlanForm", () => {
  test("turns a valid form into the API payload, with the time in UTC", () => {
    const result = validatePlanForm(form({ title: "  Coffee  ", description: "  " }), NOW);

    expect(result).toEqual({
      ok: true,
      plan: {
        title: "Coffee",
        description: null,
        location: "2340 Polk St",
        starts_at: "2026-11-21T23:00:00.000Z",
        max_participants: 3,
      },
    });
  });

  test.each([
    [{ title: "   " }, "title"],
    [{ title: "x".repeat(121) }, "title"],
    [{ location: "" }, "location"],
    [{ location: "x".repeat(201) }, "location"],
    [{ description: "x".repeat(1001) }, "description"],
    [{ date: "" }, "date"], // nothing picked yet
    [{ time: "" }, "time"],
    [{ date: "21-11-2026" }, "date"],
    [{ date: "2026-02-30" }, "date"],
    [{ time: "3pm" }, "time"],
    [{ time: "08:59" }, "time"], // before 9:00
    [{ time: "19:01" }, "time"], // after 19:00
    [{ date: "2026-11-07", time: "11:59" }, "time"], // earlier today
    [{ date: "2026-11-07", time: "12:00" }, "time"], // exactly now
    [{ maxParticipants: null }, "maxParticipants"],
    [{ maxParticipants: 1 }, "maxParticipants"],
    [{ maxParticipants: 6 }, "maxParticipants"],
  ] as [Partial<PlanForm>, keyof PlanForm][])("rejects %o with an error on %s", (overrides, field) => {
    const result = validatePlanForm(form(overrides), NOW);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[field]).toBeDefined();
  });

  test.each(["09:00", "19:00"])("accepts %s, the edge of the allowed hours", (time) => {
    expect(validatePlanForm(form({ time }), NOW).ok).toBe(true);
  });

  test("accepts limits exactly at the boundary", () => {
    const result = validatePlanForm(
      form({ title: "x".repeat(120), location: "x".repeat(200), maxParticipants: 5 }),
      NOW,
    );

    expect(result.ok).toBe(true);
  });
});

test("maps API field names to form fields", () => {
  expect(apiFieldToFormField("starts_at")).toBe("time");
  expect(apiFieldToFormField("max_participants")).toBe("maxParticipants");
  expect(apiFieldToFormField("unknown")).toBeUndefined();
});

describe("todayInSanFrancisco", () => {
  test("uses the San Francisco date, not the UTC one", () => {
    // 01:00 UTC on Nov 9 is still 17:00 on Nov 8 in San Francisco.
    expect(todayInSanFrancisco(new Date("2026-11-09T01:00:00Z"))).toBe("2026-11-08");
  });

  test("pads month and day", () => {
    expect(todayInSanFrancisco(new Date("2026-01-05T20:00:00Z"))).toBe("2026-01-05");
  });
});
