import { ScrollView, StyleSheet, View } from "react-native";
import { colors, radii, shadow, spacing } from "@/theme";
import { Screen, ScreenHeader, Text } from "@/components/ui";

const POSTS = [
  {
    title: "How Surprise Bags actually work",
    excerpt: "What to expect when you reserve leftover food, and why contents are always a surprise.",
    date: "12 Aug 2026",
  },
  {
    title: "Five easy ways to cut food waste at home",
    excerpt: "Small kitchen habits that keep more of what you buy from ending up in the bin.",
    date: "28 Jul 2026",
  },
  {
    title: "Meet the bakeries rescuing Tbilisi’s leftover loaves",
    excerpt: "Local partners share why selling surplus at the end of the day is better for business and the planet.",
    date: "9 Jul 2026",
  },
];

export default function BlogScreen() {
  return (
    <Screen edges={["top"]}>
      <ScreenHeader title="Blog" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {POSTS.map((post) => (
          <View key={post.title} style={styles.card}>
            <Text variant="caption" tone="tertiary">
              {post.date}
            </Text>
            <Text variant="h3">{post.title}</Text>
            <Text variant="bodySm" tone="secondary">
              {post.excerpt}
            </Text>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.huge },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.xs,
    ...shadow.soft,
  },
});
