import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { ApiError, fetchPlan } from "@/api/client";
import { Button } from "@/components/button";
import { Screen } from "@/components/screen";
import { colors, textStyles } from "@/constants/theme";
import { formatDateTime } from "@/plans/form";
import type { Plan } from "@/types/plan";

export default function PlanDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    // Ignore a response that arrives after the user has left the screen.
    let isCurrent = true;
    fetchPlan(id)
      .then((loaded) => isCurrent && setPlan(loaded))
      .catch((caught) => {
        if (isCurrent) {
          setError(caught instanceof ApiError ? caught.message : "Something went wrong.");
        }
      });
    return () => {
      isCurrent = false;
    };
  }, [id, attempt]);

  if (error) {
    return (
      <Screen title="Plan">
        <Text style={textStyles.body}>{error}</Text>
        <Button
          title="Try again"
          variant="secondary"
          onPress={() => {
            setError(null);
            setAttempt((n) => n + 1);
          }}
        />
        <Button title="All plans" onPress={() => router.replace("/plans")} />
      </Screen>
    );
  }

  if (!plan) {
    return (
      <Screen title="Plan">
        <ActivityIndicator color={colors.accent} style={styles.loading} />
      </Screen>
    );
  }

  return (
    <Screen title="Plan">
      <View style={styles.card}>
        <Text style={textStyles.heading}>{plan.title}</Text>
        {plan.description ? <Text style={textStyles.body}>{plan.description}</Text> : null}
        <Detail label="When" value={formatDateTime(plan.starts_at)} />
        <Detail label="Where" value={plan.location} />
        <Detail
          label="Group size"
          value={`Up to ${plan.max_participants} people, including the organizer`}
        />
      </View>
      <Text style={textStyles.hint}>Joining plans isn&apos;t available yet.</Text>
    </Screen>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detail}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    marginTop: 24,
  },
  card: {
    gap: 12,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  detail: {
    gap: 2,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    color: colors.textSubtle,
  },
  detailValue: {
    fontSize: 16,
    color: colors.text,
  },
});
