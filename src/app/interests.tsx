import { router } from "expo-router";
import { Text } from "react-native";

import { Button } from "@/components/button";
import { OptionRow } from "@/components/option-row";
import { Screen } from "@/components/screen";
import { textStyles } from "@/constants/theme";
import { usePreferences } from "@/preferences/preferences-context";
import {
  isValidInterestSelection,
  MAX_INTERESTS,
  toggleInterest,
} from "@/preferences/rules";
import { INTERESTS, type Interest } from "@/types/activity";

const INTEREST_IDS = Object.keys(INTERESTS) as Interest[];

export default function InterestsScreen() {
  const { preferences, updatePreferences } = usePreferences();
  const selected = preferences.interests ?? [];
  const isAtMax = selected.length >= MAX_INTERESTS;

  return (
    <Screen title="Interests">
      <Text style={textStyles.heading}>What do you enjoy?</Text>
      <Text style={textStyles.body}>
        Choose up to three interests that best represent what you typically
        enjoy doing. You don&apos;t need to include everything you like.
      </Text>
      <Text style={textStyles.hint}>
        {selected.length} of {MAX_INTERESTS} selected
      </Text>

      {INTEREST_IDS.map((interest) => {
        const isSelected = selected.includes(interest);
        return (
          <OptionRow
            key={interest}
            kind="checkbox"
            label={INTERESTS[interest]}
            selected={isSelected}
            disabled={isAtMax && !isSelected}
            onPress={() =>
              updatePreferences({ interests: toggleInterest(selected, interest) })
            }
          />
        );
      })}

      <Button
        title="Continue"
        disabled={!isValidInterestSelection(selected)}
        onPress={() => router.push("/get-ready")}
      />
    </Screen>
  );
}
