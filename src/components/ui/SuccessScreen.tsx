import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radii, spacing } from "@/theme";
import { Text } from "./Text";

/**
 * Full-screen success with the RescueBite green gradient. Children render the
 * detail card / action buttons.
 */
export function SuccessScreen({
  title,
  subtitle,
  icon = "check",
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Feather.glyphMap;
  children?: React.ReactNode;
}) {
  return (
    <LinearGradient
      colors={[colors.primary, colors.primaryDark]}
      style={styles.fill}
    >
      <SafeAreaView style={styles.fill} edges={["top", "bottom"]}>
        <View style={styles.center}>
          <View style={styles.iconOuter}>
            <View style={styles.iconInner}>
              <Feather name={icon} size={42} color={colors.white} />
            </View>
          </View>
          <Text variant="title" tone="inverse" center>
            {title}
          </Text>
          {subtitle ? (
            <Text variant="body" tone="inverse" center style={styles.subtitle}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        <View style={styles.bottom}>{children}</View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xxl,
    gap: spacing.md,
  },
  iconOuter: {
    width: 120,
    height: 120,
    borderRadius: radii.pill,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  iconInner: {
    width: 84,
    height: 84,
    borderRadius: radii.pill,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  subtitle: { opacity: 0.92, maxWidth: 320 },
  bottom: { padding: spacing.xl, gap: spacing.md },
});
