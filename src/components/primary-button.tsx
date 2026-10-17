import { Pressable, StyleSheet, Text } from "react-native";

import { colors } from "@/constants/theme";

type PrimaryButtonProps = {
  title: string;
  disabled?: boolean;
  onPress: () => void;
};

export function PrimaryButton({ title, disabled = false, onPress }: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, disabled && styles.buttonDisabled]}
    >
      <Text style={[styles.text, disabled && styles.textDisabled]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 16,
    paddingVertical: 15,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: colors.accentDisabled,
  },
  text: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "700",
  },
  textDisabled: {
    color: colors.textSubtle,
  },
});
