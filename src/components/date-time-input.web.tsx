import type { CSSProperties } from "react";

import { colors } from "@/constants/theme";

import type { DateTimeInputProps } from "./date-time-input";

// Web: the browser's own date and time pickers (calendar icon and popup).
// Their values are already "YYYY-MM-DD" and "HH:MM", the same format the
// form uses, so the validation logic doesn't change.
export function DateTimeInput({ mode, value, onChange, min, max, stepMinutes }: DateTimeInputProps) {
  return (
    <input
      type={mode}
      value={value}
      min={min}
      max={max}
      // The browser's step is in seconds.
      step={stepMinutes ? stepMinutes * 60 : undefined}
      onChange={(event) => onChange(event.target.value)}
      style={style}
    />
  );
}

const style: CSSProperties = {
  boxSizing: "border-box",
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: `1px solid ${colors.border}`,
  backgroundColor: colors.surface,
  color: colors.text,
  fontSize: 16,
  fontFamily: "inherit",
  // Dark calendar popup and icon, to match the app's theme.
  colorScheme: "dark",
};
