import { Pressable, StyleSheet, View, ViewStyle } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { colors, spacing, HIT_TARGET } from "@/theme";
import { Text } from "./Text";
import { TextButton } from "./Button";

export function Divider({ style }: { style?: ViewStyle }) {
  return <View style={[styles.divider, style]} />;
}

/** Top bar for stacked screens: back chevron + title + optional right element. */
export function ScreenHeader({
  title,
  onBack,
  right,
  transparent,
}: {
  title?: string;
  onBack?: () => void;
  right?: React.ReactNode;
  transparent?: boolean;
}) {
  const router = useRouter();
  const back = onBack ?? (() => (router.canGoBack() ? router.back() : router.replace("/discover")));
  return (
    <View style={[styles.header, transparent && styles.headerTransparent]}>
      <Pressable
        onPress={back}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        style={styles.backBtn}
      >
        <Feather name="chevron-left" size={24} color={colors.textPrimary} />
      </Pressable>
      <View style={styles.headerTitle}>
        {title ? (
          <Text variant="h3" numberOfLines={1} center>
            {title}
          </Text>
        ) : null}
      </View>
      <View style={styles.headerRight}>{right}</View>
    </View>
  );
}

export function SectionHeader({
  title,
  subtitle,
  onSeeAll,
  style,
}: {
  title: string;
  subtitle?: string;
  onSeeAll?: () => void;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.section, style]}>
      <View style={styles.sectionText}>
        <Text variant="h3" weight="bold">
          {title}
        </Text>
        {subtitle ? (
          <Text variant="bodySm" tone="secondary">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {onSeeAll ? (
        <TextButton label="See all" onPress={onSeeAll} style={styles.seeAll} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  divider: { height: 1, backgroundColor: colors.border },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    minHeight: 52,
  },
  headerTransparent: { backgroundColor: "transparent" },
  backBtn: {
    width: HIT_TARGET,
    height: HIT_TARGET,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { flex: 1, alignItems: "center" },
  headerRight: { minWidth: HIT_TARGET, alignItems: "flex-end" },
  section: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  sectionText: { flex: 1, gap: 2 },
  seeAll: {
    minHeight: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
});
