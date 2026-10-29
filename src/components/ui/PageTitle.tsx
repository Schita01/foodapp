import { StyleSheet, View } from "react-native";
import { colors, spacing } from "@/theme";
import { Text } from "./Text";

/** Large page heading used at the top of tab screens (Orders, Favourites, Profile). */
export function PageTitle({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.text}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? (
          <Text variant="bodySm" tone="secondary">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  text: { flex: 1, gap: 2 },
  title: { fontSize: 28, lineHeight: 34, fontWeight: "800", color: colors.textPrimary },
  right: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
});
