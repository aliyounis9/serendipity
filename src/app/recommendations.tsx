import { router } from "expo-router";
import { Text } from "react-native";

import { PrimaryButton } from "@/components/primary-button";
import { Screen } from "@/components/screen";
import { textStyles } from "@/constants/theme";
import { usePreferences } from "@/preferences/preferences-context";
import { toCompletePreferences } from "@/preferences/rules";
import { INTERESTS } from "@/types/activity";

// Temporary placeholder: recommendations replace the summary below.
export default function RecommendationsScreen() {
  const { preferences } = usePreferences();
  const completePreferences = toCompletePreferences(preferences);

  if (!completePreferences) {
    return (
      <Screen title="Recommendations">
        <Text style={textStyles.body}>
          Please complete the onboarding questions first.
        </Text>
        <PrimaryButton title="Start over" onPress={() => router.replace("/")} />
      </Screen>
    );
  }

  const { interests, maxBudgetUsd, maxDistanceMiles } = completePreferences;

  return (
    <Screen title="Recommendations">
      <Text style={textStyles.heading}>Your preferences</Text>
      <Text style={textStyles.body}>
        Interests: {interests.map((interest) => INTERESTS[interest]).join(", ")}
      </Text>
      <Text style={textStyles.body}>
        Budget: {maxBudgetUsd === null ? "No limit" : `Up to about $${maxBudgetUsd}`}
      </Text>
      <Text style={textStyles.body}>
        Distance:{" "}
        {maxDistanceMiles === null ? "No limit" : `Within ${maxDistanceMiles} mi`}
      </Text>
      <Text style={textStyles.hint}>Recommendations will appear here.</Text>
    </Screen>
  );
}
