import { Pressable, StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, spacing } from "@/theme";
import { Text } from "./Text";

export function RatingStars({
  rating,
  reviewCount,
  size = 14,
  showCount = true,
}: {
  rating: number;
  reviewCount?: number;
  size?: number;
  showCount?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Feather name="star" size={size} color={colors.accent} />
      <Text variant="bodySm" weight="semibold">
        {rating.toFixed(1)}
      </Text>
      {showCount && reviewCount != null ? (
        <Text variant="bodySm" tone="secondary">
          ({reviewCount})
        </Text>
      ) : null}
    </View>
  );
}

export function RatingInput({
  value,
  onChange,
  size = 36,
}: {
  value: number;
  onChange: (v: number) => void;
  size?: number;
}) {
  return (
    <View style={styles.inputRow}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable
          key={n}
          accessibilityRole="button"
          accessibilityLabel={`${n} star${n > 1 ? "s" : ""}`}
          onPress={() => onChange(n)}
          hitSlop={6}
        >
          <Feather
            name="star"
            size={size}
            color={n <= value ? colors.accent : colors.border}
            style={n <= value ? styles.filled : undefined}
          />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 3 },
  inputRow: { flexDirection: "row", gap: spacing.sm, justifyContent: "center" },
  filled: {},
});
