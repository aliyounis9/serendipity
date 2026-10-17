import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from "react-native";

import { colors } from "@/constants/theme";

type ButtonProps = {
  title: string;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  title,
  variant = "primary",
  disabled = false,
  onPress,
  style,
}: ButtonProps) {
  const isSecondary = variant === "secondary";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        isSecondary && styles.buttonSecondary,
        disabled && styles.buttonDisabled,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          isSecondary && styles.textSecondary,
          disabled && styles.textDisabled,
        ]}
      >
        {title}
      </Text>
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
  buttonSecondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonDisabled: {
    backgroundColor: colors.accentDisabled,
  },
  text: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "700",
  },
  textSecondary: {
    color: colors.text,
  },
  textDisabled: {
    color: colors.textSubtle,
  },
});
