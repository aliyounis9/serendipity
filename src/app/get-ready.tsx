import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/button";
import { Screen } from "@/components/screen";
import { colors, textStyles } from "@/constants/theme";
import { usePreferences } from "@/preferences/preferences-context";
import { toCompletePreferences } from "@/preferences/rules";

// Describes the task only. It deliberately doesn't mention interests or
// unfamiliar activities, so participants aren't nudged toward any answer.
export default function GetReadyScreen() {
  const { preferences } = usePreferences();

  if (!toCompletePreferences(preferences)) {
    return (
      <Screen title="Get ready">
        <Text style={textStyles.body}>
          Please complete the onboarding questions first.
        </Text>
        <Button title="Start over" onPress={() => router.replace("/")} />
      </Screen>
    );
  }

  return (
    <Screen title="Get ready">
      <Text style={textStyles.heading}>Before you start</Text>
      <Text style={textStyles.body}>
        You&apos;ll see up to six activity invitations, one at a time.
      </Text>
      <Text style={textStyles.body}>
        Each one is a hypothetical plan for this Saturday afternoon near 2550
        Van Ness. For each, imagine a small group invited you, and choose:
      </Text>
      <View style={styles.choices}>
        <Text style={textStyles.body}>
          • <Text style={styles.choice}>I&apos;m in</Text> if you&apos;d likely
          join
        </Text>
        <Text style={textStyles.body}>
          • <Text style={styles.choice}>Not today</Text> if you probably
          wouldn&apos;t
        </Text>
      </View>
      <Text style={textStyles.body}>
        There are no right or wrong answers. Respond the way you realistically
        would.
      </Text>
      <Text style={textStyles.hint}>
        Reminder: the other group members are simulated, and nothing gets
        booked.
      </Text>

      <Button
        title="Show me the activities"
        onPress={() => router.push("/recommendations")}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  choices: {
    gap: 4,
    paddingLeft: 4,
  },
  choice: {
    fontWeight: "700",
    color: colors.text,
  },
});
