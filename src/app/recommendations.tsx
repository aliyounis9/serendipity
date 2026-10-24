import { router } from "expo-router";
import { useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/button";
import { Screen } from "@/components/screen";
import { STUDY } from "@/constants/study";
import { colors, textStyles } from "@/constants/theme";
import { ACTIVITIES } from "@/data/activities";
import { usePreferences } from "@/preferences/preferences-context";
import { toCompletePreferences } from "@/preferences/rules";
import { buildRecommendations } from "@/recommendation/recommendations";
import { INTERESTS, type Activity, type Interest } from "@/types/activity";
import type { Decision, DecisionRecord, Recommendation } from "@/types/recommendation";
import { googleMapsUrl } from "@/utils/maps";

export default function RecommendationsScreen() {
  const { preferences } = usePreferences();
  const completePreferences = toCompletePreferences(preferences);
  // Computed once when the screen opens, so the selection and order stay
  // fixed for the whole session.
  const [recommendations] = useState(() =>
    completePreferences
      ? buildRecommendations(ACTIVITIES, completePreferences.interests)
      : [],
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  // In memory only: cleared if the page is reloaded.
  const [decisions, setDecisions] = useState<DecisionRecord[]>([]);
  const [isSummaryVisible, setIsSummaryVisible] = useState(false);

  if (!completePreferences) {
    return (
      <Screen title="Recommendations">
        <Text style={textStyles.body}>
          Please complete the onboarding questions first.
        </Text>
        <Button title="Start over" onPress={() => router.replace("/")} />
      </Screen>
    );
  }

  if (currentIndex >= recommendations.length) {
    return (
      <Screen title="Recommendations" hideBackButton>
        <Text style={textStyles.heading}>That&apos;s all for now</Text>
        <Text style={textStyles.body}>Thanks for taking a look.</Text>
        {isSummaryVisible ? (
          <ResearcherSummary
            interests={completePreferences.interests}
            decisions={decisions}
            recommendations={recommendations}
          />
        ) : (
          <Button
            title="Researcher summary"
            variant="secondary"
            onPress={() => setIsSummaryVisible(true)}
          />
        )}
      </Screen>
    );
  }

  function decide(decision: Decision) {
    const { activity, alignment } = recommendations[currentIndex];
    setDecisions((current) => [
      ...current,
      { position: currentIndex + 1, activityId: activity.id, alignment, decision },
    ]);
    setCurrentIndex((index) => index + 1);
  }

  return (
    <Screen title="Recommendations" hideBackButton>
      <Text style={textStyles.hint}>
        Activity {currentIndex + 1} of {recommendations.length}
      </Text>
      <ActivityCard activity={recommendations[currentIndex].activity} />
      <View style={styles.actions}>
        <Button
          title="Not today"
          variant="secondary"
          onPress={() => decide("not_today")}
          style={styles.action}
        />
        <Button title="I'm in" onPress={() => decide("in")} style={styles.action} />
      </View>
    </Screen>
  );
}

function ActivityCard({ activity }: { activity: Activity }) {
  return (
    <View style={styles.card}>
      <Text style={styles.time}>Hypothetical invitation · {STUDY.timeLabel}</Text>
      <Text style={textStyles.heading}>{activity.title}</Text>
      <Text style={textStyles.body}>{activity.description}</Text>

      <View style={styles.details}>
        <View>
          <Detail label="Where" value={activity.venue.name} note={activity.venue.address} />
          {/* With one argument, openURL opens a new tab on web, so the
              in-memory session in this tab is kept. */}
          <Pressable
            accessibilityRole="link"
            onPress={() => Linking.openURL(googleMapsUrl(activity.venue))}
            style={styles.mapsLink}
          >
            <Text style={styles.mapsLinkText}>Open in Google Maps ↗</Text>
          </Pressable>
        </View>
        <Detail label="Cost" value={formatCost(activity.costUsd)} note="Estimate per person" />
        <Detail label="Group" value={`You + ${STUDY.simulatedOthers} others (simulated)`} />
      </View>

      <Text style={textStyles.hint}>
        This is a hypothetical invitation. The other group members are
        simulated, and tapping &quot;I&apos;m in&quot; doesn&apos;t reserve
        anything.
      </Text>
    </View>
  );
}

function Detail({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <View style={styles.detail}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
      {note ? <Text style={textStyles.hint}>{note}</Text> : null}
    </View>
  );
}

function formatCost(costUsd: number): string {
  return costUsd === 0 ? "Free" : `About $${costUsd}`;
}

// Can be opened after the interview
function ResearcherSummary({
  interests,
  decisions,
  recommendations,
}: {
  interests: Interest[];
  decisions: DecisionRecord[];
  recommendations: Recommendation[];
}) {
  return (
    <View style={styles.summary}>
      <Text style={styles.detailLabel}>Researcher summary</Text>
      <Text style={textStyles.body}>
        Interests: {interests.map((interest) => INTERESTS[interest]).join(", ")}
      </Text>
      {decisions.map((record) => {
        const title = recommendations.find(
          (recommendation) => recommendation.activity.id === record.activityId,
        )?.activity.title;
        return (
          <View key={record.position} style={styles.summaryRow}>
            <Text style={styles.detailValue}>
              {record.position}. {title}
            </Text>
            <Text style={textStyles.hint}>
              {record.activityId} · {record.alignment} ·{" "}
              {record.decision === "in" ? "I'm in" : "Not today"}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    padding: 20,
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
  details: {
    gap: 12,
    paddingVertical: 4,
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
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  action: {
    flex: 1,
  },
  mapsLink: {
    alignSelf: "flex-start",
    paddingVertical: 6,
  },
  mapsLinkText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.accent,
  },
  summary: {
    gap: 10,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryRow: {
    gap: 2,
  },
});
