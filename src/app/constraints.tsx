import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { OptionRow } from "@/components/option-row";
import { PrimaryButton } from "@/components/primary-button";
import { Screen } from "@/components/screen";
import { textStyles } from "@/constants/theme";
import { usePreferences } from "@/preferences/preferences-context";
import { toCompletePreferences } from "@/preferences/rules";

type LimitOption = {
  label: string;
  value: number | null;
};

const BUDGET_OPTIONS: LimitOption[] = [
  { label: "Free only", value: 0 },
  { label: "Up to about $10", value: 10 },
  { label: "Up to about $25", value: 25 },
  { label: "Up to about $50", value: 50 },
  { label: "No limit", value: null },
];

const DISTANCE_OPTIONS: LimitOption[] = [
  { label: "Within 1 mile", value: 1 },
  { label: "Within 2 miles", value: 2 },
  { label: "Within 4 miles", value: 4 },
  { label: "No distance limit", value: null },
];

export default function ConstraintsScreen() {
  const { preferences, updatePreferences } = usePreferences();
  const isComplete = toCompletePreferences(preferences) !== null;

  return (
    <Screen title="Budget & distance">
      <ChoiceGroup
        title="Budget"
        instructions="About how much would you spend per person on a plan like this?"
        hint="Activity costs are rough estimates."
        options={BUDGET_OPTIONS}
        selectedValue={preferences.maxBudgetUsd}
        onSelect={(value) => updatePreferences({ maxBudgetUsd: value })}
      />
      <ChoiceGroup
        title="Distance"
        instructions="How far from 2550 Van Ness Avenue would you go?"
        hint="Distances are approximate straight-line distances, not walking distances."
        options={DISTANCE_OPTIONS}
        selectedValue={preferences.maxDistanceMiles}
        onSelect={(value) => updatePreferences({ maxDistanceMiles: value })}
      />

      <PrimaryButton
        title="See activities"
        disabled={!isComplete}
        onPress={() => router.push("/recommendations")}
      />
    </Screen>
  );
}

type ChoiceGroupProps = {
  title: string;
  instructions: string;
  hint: string;
  options: LimitOption[];
  // undefined means the question hasn't been answered yet.
  selectedValue: number | null | undefined;
  onSelect: (value: number | null) => void;
};

function ChoiceGroup({
  title,
  instructions,
  hint,
  options,
  selectedValue,
  onSelect,
}: ChoiceGroupProps) {
  return (
    <View style={styles.group}>
      <Text style={textStyles.heading}>{title}</Text>
      <Text style={textStyles.body}>{instructions}</Text>
      <Text style={textStyles.hint}>{hint}</Text>
      {options.map((option) => (
        <OptionRow
          key={option.label}
          kind="radio"
          label={option.label}
          selected={selectedValue === option.value}
          onPress={() => onSelect(option.value)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: 10,
    marginBottom: 16,
  },
});
