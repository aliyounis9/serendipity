import { StyleSheet, TextInput } from "react-native";

import { colors } from "@/constants/theme";

export type DateTimeInputProps = {
  mode: "date" | "time";
  value: string; // "YYYY-MM-DD" for dates, "HH:MM" (24-hour) for times
  onChange: (value: string) => void;
  // Earliest and latest selectable value, in the same format as value.
  min?: string;
  max?: string;
  // For times: offer every N minutes (e.g. 15 → 9:00, 9:15, 9:30).
  stepMinutes?: number;
};

// Phones: plain text fields for now. Plans can't be created on phones yet
// (the API is local-only), so a native picker is planned for Sprint 2.
// The web version (date-time-input.web.tsx) uses the browser's pickers.
export function DateTimeInput({ mode, value, onChange }: DateTimeInputProps) {
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={mode === "date" ? "2026-11-21" : "15:00 (24h)"}
      placeholderTextColor={colors.textSubtle}
      autoCapitalize="none"
      style={styles.input}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 16,
  },
});
