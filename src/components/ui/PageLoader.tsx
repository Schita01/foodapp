import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, radii, spacing } from "@/theme";
import { Text } from "./Text";

export function PageLoader({
  label = "Finding surprise bags…",
}: {
  label?: string;
}) {
  return (
    <View style={styles.wrap} accessibilityRole="progressbar" accessibilityLabel={label}>
      <View style={styles.iconWrap}>
        <Feather name="shopping-bag" size={28} color={colors.primaryDark} />
      </View>
      <ActivityIndicator color={colors.primaryDark} />
      <Text variant="body" tone="secondary" center>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xxxl,
    gap: spacing.lg,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: radii.pill,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
});
