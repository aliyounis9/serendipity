import type { NewPlan } from "@/types/plan";

// Same limits as backend/app/schemas.py.
export const LIMITS = {
  title: 120,
  location: 200,
  description: 1000,
  minParticipants: 2,
  maxParticipants: 5,
};

// All plans are in San Francisco, so times are entered and shown in SF time,
// wherever the user is. Same rule as backend/app/schemas.py.
export const PLAN_TIME_ZONE = "America/Los_Angeles";
export const EARLIEST_START = "09:00";
export const LATEST_START = "19:00";

export type PlanForm = {
  title: string;
  description: string;
  location: string;
  date: string; // "YYYY-MM-DD", San Francisco time
  time: string; // "HH:MM", 24-hour, San Francisco time
  maxParticipants: number | null;
};

export type PlanFormField = keyof PlanForm;
export type PlanFormErrors = Partial<Record<PlanFormField, string>>;

export type ValidationResult =
  | { ok: true; plan: NewPlan }
  | { ok: false; errors: PlanFormErrors };

function isDigits(text: string): boolean {
  return text !== "" && [...text].every((char) => char >= "0" && char <= "9");
}

// Checks the shape only, not whether the date exists.
function isDateFormat(date: string): boolean {
  const parts = date.trim().split("-");
  return (
    parts.length === 3 &&
    parts.every(isDigits) &&
    parts[0].length === 4 &&
    parts[1].length === 2 &&
    parts[2].length === 2
  );
}

// "15:00" or "9:05" -> true.
function isTimeFormat(time: string): boolean {
  const parts = time.trim().split(":");
  return parts.length === 2 && parts.every(isDigits) && parts[0].length <= 2 && parts[1].length === 2;
}

// "15:00" -> 900 (minutes after midnight), to compare times as numbers.
function minutesAfterMidnight(time: string): number {
  const [hours, minutes] = time.trim().split(":").map(Number);
  return hours * 60 + minutes;
}

type ClockTime = { year: number; month: number; day: number; hours: number; minutes: number };

const sanFranciscoClock = new Intl.DateTimeFormat("en-US", {
  timeZone: PLAN_TIME_ZONE,
  hourCycle: "h23",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
});

// What a clock in San Francisco shows at a given moment.
function sanFranciscoClockAt(moment: Date): ClockTime {
  const parts = sanFranciscoClock.formatToParts(moment);
  const part = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return {
    year: part("year"),
    month: part("month"),
    day: part("day"),
    hours: part("hour"),
    minutes: part("minute"),
  };
}

// The same clock time, as a number we can do arithmetic with.
function asNumber(clock: ClockTime): number {
  return Date.UTC(clock.year, clock.month - 1, clock.day, clock.hours, clock.minutes);
}

// Turns San Francisco date and time text into the exact moment it happens,
// or null if SF clocks never show it (bad format, Feb 30, or a time skipped
// when clocks jump forward for daylight saving).
export function parsePlanDateTime(date: string, time: string): Date | null {
  if (!isDateFormat(date) || !isTimeFormat(time)) {
    return null;
  }

  const [year, month, day] = date.trim().split("-").map(Number);
  const [hours, minutes] = time.trim().split(":").map(Number);
  const wanted: ClockTime = { year, month, day, hours, minutes };

  // Start with a guess, check what SF clocks show at that moment, and shift
  // by the difference. A second round handles guesses that land on the other
  // side of a daylight saving change.
  let moment = asNumber(wanted);
  for (let round = 0; round < 2; round++) {
    moment += asNumber(wanted) - asNumber(sanFranciscoClockAt(new Date(moment)));
  }

  // If SF clocks don't show exactly the wanted time at that moment, the time
  // doesn't exist (Date.UTC rolls Feb 30 over to Mar 2, for example). The
  // parts are compared one by one, because asNumber() would roll over too.
  const result = new Date(moment);
  const shown = sanFranciscoClockAt(result);
  const exists =
    shown.year === wanted.year &&
    shown.month === wanted.month &&
    shown.day === wanted.day &&
    shown.hours === wanted.hours &&
    shown.minutes === wanted.minutes;
  return exists ? result : null;
}

export function validatePlanForm(form: PlanForm, now: Date = new Date()): ValidationResult {
  const errors: PlanFormErrors = {};
  const title = form.title.trim();
  const location = form.location.trim();
  const description = form.description.trim();

  if (!title) {
    errors.title = "Add a title.";
  } else if (title.length > LIMITS.title) {
    errors.title = `Keep the title under ${LIMITS.title} characters.`;
  }

  if (!location) {
    errors.location = "Add a location.";
  } else if (location.length > LIMITS.location) {
    errors.location = `Keep the location under ${LIMITS.location} characters.`;
  }

  if (description.length > LIMITS.description) {
    errors.description = `Keep the description under ${LIMITS.description} characters.`;
  }

  const startsAt = parsePlanDateTime(form.date, form.time);
  if (!form.date.trim()) {
    errors.date = "Choose a date.";
  } else if (!isDateFormat(form.date)) {
    errors.date = "Use the format YYYY-MM-DD, e.g. 2026-11-21.";
  } else if (!form.time.trim()) {
    errors.time = "Choose a time.";
  } else if (!isTimeFormat(form.time)) {
    errors.time = "Use 24-hour time, e.g. 15:00.";
  } else if (!startsAt) {
    errors.date = "That date or time doesn't exist.";
  } else if (
    minutesAfterMidnight(form.time) < minutesAfterMidnight(EARLIEST_START) ||
    minutesAfterMidnight(form.time) > minutesAfterMidnight(LATEST_START)
  ) {
    errors.time = `Plans can start between ${EARLIEST_START} and ${LATEST_START}.`;
  } else if (startsAt <= now) {
    errors.time = "Pick a time in the future.";
  }

  const participants = form.maxParticipants;
  if (
    participants === null ||
    !Number.isInteger(participants) ||
    participants < LIMITS.minParticipants ||
    participants > LIMITS.maxParticipants
  ) {
    errors.maxParticipants = "Choose a group size from 2 to 5.";
  }

  if (Object.keys(errors).length > 0 || !startsAt || participants === null) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    plan: {
      title,
      description: description || null,
      location,
      starts_at: startsAt.toISOString(),
      max_participants: participants,
    },
  };
}

// The backend reports errors by API field name; map them to form fields.
export function apiFieldToFormField(field: string): PlanFormField | undefined {
  const fields: Record<string, PlanFormField> = {
    title: "title",
    description: "description",
    location: "location",
    starts_at: "time",
    max_participants: "maxParticipants",
  };
  return fields[field];
}

// "Sat, Nov 21, 3:00 PM PST": San Francisco time for everyone, so a plan
// shows the same time wherever the viewer is.
export function formatDateTime(value: Date | string): string {
  return new Date(value).toLocaleString(undefined, {
    timeZone: PLAN_TIME_ZONE,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

// Today's date in San Francisco as "YYYY-MM-DD", used to prefill the form.
export function todayInSanFrancisco(now: Date = new Date()): string {
  const { year, month, day } = sanFranciscoClockAt(now);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${year}-${pad(month)}-${pad(day)}`;
}
