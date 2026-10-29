import { StyleSheet, View, ViewStyle } from "react-native";
import { SafeAreaView, Edge } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { colors, spacing } from "@/theme";
import { useDevStore } from "@/store/devStore";
import { Text } from "./Text";

export function Screen({
  children,
  edges = ["top", "bottom"],
  padded,
  style,
  background = colors.background,
}: {
  children: React.ReactNode;
  edges?: Edge[];
  padded?: boolean;
  style?: ViewStyle;
  background?: string;
}) {
  const offline = useDevStore((s) => s.offline);
  return (
    <SafeAreaView edges={edges} style={[styles.safe, { backgroundColor: background }]}>
      {offline ? (
        <View style={styles.offline}>
          <Feather name="wifi-off" size={13} color={colors.white} />
          <Text variant="caption" tone="inverse">
            You're offline
          </Text>
        </View>
      ) : null}
      <View style={[styles.inner, padded && styles.padded, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  inner: { flex: 1 },
  padded: { paddingHorizontal: spacing.lg },
  offline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    backgroundColor: colors.textSecondary,
    paddingVertical: 4,
  },
});
