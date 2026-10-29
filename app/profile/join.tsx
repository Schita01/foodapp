import { ScrollView, StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, radii, spacing } from "@/theme";
import { Screen, ScreenHeader, Text } from "@/components/ui";

const POINTS = [
  { icon: "shopping-bag" as const, title: "Rescue Surprise Bags", body: "Collect surplus food from stores near you at a fraction of the price." },
  { icon: "heart" as const, title: "Support local businesses", body: "Help bakeries, grocers and restaurants cut waste and earn from leftovers." },
  { icon: "cloud" as const, title: "Lower your footprint", body: "Every bag you save keeps good food out of landfill and CO₂ out of the air." },
];

export default function JoinRescueBiteScreen() {
  return (
    <Screen edges={["top"]}>
      <ScreenHeader title="Join RescueBite" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text variant="h2">A planet with no food waste</Text>
        <Text variant="body" tone="secondary">
          RescueBite connects you with stores that have leftover food at the end of the day. You save money, they reduce waste, and together we keep good food from being thrown away.
        </Text>
        {POINTS.map((p) => (
          <View key={p.title} style={styles.card}>
            <View style={styles.icon}>
              <Feather name={p.icon} size={20} color={colors.primaryDark} />
            </View>
            <View style={styles.flex}>
              <Text variant="label">{p.title}</Text>
              <Text variant="bodySm" tone="secondary">
                {p.body}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.huge },
  card: {
    flexDirection: "row",
    gap: spacing.md,
    backgroundColor: colors.primarySoft,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  flex: { flex: 1, gap: 2 },
});
