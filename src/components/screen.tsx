import { Stack } from "expo-router";
import type { ReactNode } from "react";
import { ScrollView, StyleSheet } from "react-native";

import { colors } from "@/constants/theme";

type ScreenProps = {
  title: string;
  children: ReactNode;
};

export function Screen({ title, children }: ScreenProps) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title }} />
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    padding: 20,
    gap: 10,
  },
});
