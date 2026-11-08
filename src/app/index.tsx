import type { Href } from "expo-router";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { API_URL } from "@/api/client";
import { Screen } from "@/components/screen";
import { colors, textStyles } from "@/constants/theme";

// Plans need the local backend, so they only appear in builds where
// EXPO_PUBLIC_API_URL is set.
const PLANS_ENABLED = API_URL !== undefined;

export default function HomeScreen() {
  return (
    <Screen title="Home">
      <Text style={textStyles.title}>Serendipity</Text>
      <Text style={textStyles.body}>
        Discover spontaneous things to do nearby and meet new people in small
        groups.
      </Text>
      <Text style={textStyles.body}>
        Got a free afternoon or a couple of hours? Serendipity suggests
        something to do and brings a few people together to do it.
      </Text>

      <View style={styles.cards}>
        <HomeCard
          title="Recommended for You"
          description="Find an activity and people to enjoy it with."
          href="/welcome"
          primary
        />
        {PLANS_ENABLED ? (
          <>
            <HomeCard
              title="Explore Plans"
              description="See what others are planning."
              href="/plans"
            />
            <HomeCard
              title="Create a Plan"
              description="Bring people together."
              href="/plans/new"
            />
          </>
        ) : null}
      </View>
    </Screen>
  );
}

type HomeCardProps = {
  title: string;
  description: string;
  href: Href;
  primary?: boolean;
};

function HomeCard({ title, description, href, primary = false }: HomeCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push(href)}
      style={[styles.card, primary && styles.cardPrimary]}
    >
      <Text style={[styles.cardTitle, primary && styles.cardTitlePrimary]}>{title}</Text>
      <Text style={textStyles.body}>{description}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cards: {
    gap: 12,
    marginTop: 12,
  },
  card: {
    gap: 4,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cardPrimary: {
    borderColor: colors.accent,
    backgroundColor: colors.surfaceSelected,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  cardTitlePrimary: {
    color: colors.accent,
  },
});
