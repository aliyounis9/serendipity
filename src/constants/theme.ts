import { StyleSheet } from "react-native";

export const colors = {
  background: "#0A0A0A",
  surface: "#161616",
  surfaceSelected: "#24130A",
  border: "#2C2C2C",
  text: "#F5F5F5",
  textMuted: "#A3A3A3",
  textSubtle: "#8A8A8A",
  accent: "#FF6A1F",
  accentDisabled: "#3A2416",
  notice: "#E5383B",
};

export const textStyles = StyleSheet.create({
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: colors.accent,
  },
  heading: {
    fontSize: 22,
    fontWeight: "600",
    color: colors.text,
  },
  body: {
    fontSize: 16,
    lineHeight: 23,
    color: colors.textMuted,
  },
  hint: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSubtle,
  },
});
