import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { ApiError, fetchPlans } from "@/api/client";
import { Button } from "@/components/button";
import { Screen } from "@/components/screen";
import { colors, textStyles } from "@/constants/theme";
import { formatDateTime } from "@/plans/form";
import type { Plan } from "@/types/plan";

export default function ExplorePlansScreen() {
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadPlans = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setPlans(await fetchPlans());
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Reload every time this screen comes into view, so a plan created on the
  // Create screen shows up when coming back.
  useFocusEffect(
    useCallback(() => {
      loadPlans();
    }, [loadPlans]),
  );

  return (
    <Screen title="Explore Plans">
      <Text style={textStyles.heading}>Upcoming plans</Text>
      <Text style={textStyles.body}>Plans people have created, soonest first.</Text>

      {error ? (
        <View style={styles.message}>
          <Text style={textStyles.body}>{error}</Text>
          <Button title="Try again" variant="secondary" onPress={loadPlans} />
        </View>
      ) : plans === null ? (
        <ActivityIndicator color={colors.accent} style={styles.loading} />
      ) : plans.length === 0 ? (
        <View style={styles.message}>
          <Text style={textStyles.body}>No upcoming plans yet.</Text>
          <Button title="Create a plan" onPress={() => router.push("/plans/new")} />
        </View>
      ) : (
        <>
          {plans.map((plan) => (
            <PlanListItem key={plan.id} plan={plan} />
          ))}
          <View style={styles.actions}>
            <Button
              title={isLoading ? "Refreshing…" : "Refresh"}
              variant="secondary"
              disabled={isLoading}
              onPress={loadPlans}
              style={styles.action}
            />
            <Button
              title="Create a plan"
              onPress={() => router.push("/plans/new")}
              style={styles.action}
            />
          </View>
        </>
      )}
    </Screen>
  );
}

function PlanListItem({ plan }: { plan: Plan }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push({ pathname: "/plans/[id]", params: { id: plan.id } })}
      style={styles.card}
    >
      <Text style={styles.time}>{formatDateTime(plan.starts_at)}</Text>
      <Text style={styles.title}>{plan.title}</Text>
      <Text style={textStyles.body}>{plan.location}</Text>
      <Text style={textStyles.hint}>Up to {plan.max_participants} people</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  loading: {
    marginTop: 24,
  },
  message: {
    gap: 4,
    marginTop: 8,
  },
  card: {
    gap: 4,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  time: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: colors.accent,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  action: {
    flex: 1,
  },
});
