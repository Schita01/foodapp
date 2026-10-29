import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, ViewStyle } from "react-native";
import { colors, radii, spacing } from "@/theme";

export function Skeleton({
  width,
  height = 16,
  radius = radii.sm,
  style,
}: {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: ViewStyle;
}) {
  const opacity = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        { width: width ?? "100%", height, borderRadius: radius, backgroundColor: colors.disabledBg, opacity },
        style,
      ]}
    />
  );
}

export function ListingCardSkeleton() {
  return (
    <View style={styles.card}>
      <Skeleton height={120} radius={radii.lg} />
      <View style={styles.body}>
        <Skeleton width="70%" height={16} />
        <Skeleton width="45%" height={12} />
        <Skeleton width="60%" height={12} />
      </View>
    </View>
  );
}

export function ListRowSkeleton() {
  return (
    <View style={styles.row}>
      <Skeleton width={84} height={84} radius={radii.lg} />
      <View style={styles.rowBody}>
        <Skeleton width="70%" height={16} />
        <Skeleton width="50%" height={12} />
        <Skeleton width="40%" height={12} />
      </View>
    </View>
  );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <View style={{ gap: spacing.md, padding: spacing.lg }}>
      {Array.from({ length: count }).map((_, i) => (
        <ListRowSkeleton key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 230,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  body: { padding: spacing.md, gap: spacing.sm },
  row: {
    flexDirection: "row",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  rowBody: { flex: 1, justifyContent: "center", gap: spacing.sm },
});
