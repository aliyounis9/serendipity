import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "@/components/primary-button";
import { Screen } from "@/components/screen";
import { colors, textStyles } from "@/constants/theme";

export default function IntroScreen() {
  return (
    <Screen title="Welcome">
      <Text style={textStyles.title}>Serendipity</Text>
      <Text style={textStyles.body}>
        Imagine it&apos;s Saturday afternoon, you&apos;re near 2550 Van Ness
        Avenue in San Francisco, and you&apos;re free for the next few hours.
      </Text>
      <Text style={textStyles.body}>
        We&apos;ll show you a few nearby activities, one at a time. For each
        one, decide whether you&apos;d join.
      </Text>

      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>This is a prototype study</Text>
        <Text style={textStyles.body}>
          • The other group members you&apos;ll see are simulated. No real
          people have joined.
        </Text>
        <Text style={textStyles.body}>
          • Tapping &quot;I&apos;m in&quot; doesn&apos;t reserve or book
          anything.
        </Text>
      </View>

      <PrimaryButton title="Start" onPress={() => router.push("/interests")} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  notice: {
    marginTop: 8,
    padding: 16,
    gap: 6,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.notice,
    backgroundColor: colors.surface,
  },
  noticeTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
});
