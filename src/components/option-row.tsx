import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/constants/theme";

type OptionRowProps = {
  label: string;
  kind: "checkbox" | "radio";
  selected: boolean;
  disabled?: boolean;
  onPress: () => void;
};

export function OptionRow({ label, kind, selected, disabled = false, onPress }: OptionRowProps) {
  return (
    <Pressable
      accessibilityRole={kind}
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.row, selected && styles.rowSelected, disabled && styles.rowDisabled]}
    >
      <View
        style={[
          styles.indicator,
          kind === "radio" && styles.indicatorRadio,
          selected && styles.indicatorSelected,
        ]}
      >
        {selected && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  rowSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.surfaceSelected,
  },
  rowDisabled: {
    opacity: 0.35,
  },
  indicator: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: colors.textSubtle,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  indicatorRadio: {
    borderRadius: 11,
  },
  indicatorSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  checkmark: {
    color: colors.background,
    fontSize: 14,
    fontWeight: "800",
  },
  label: {
    fontSize: 16,
    color: colors.text,
  },
});
