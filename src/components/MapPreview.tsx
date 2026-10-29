import { Pressable, StyleSheet, View, ViewStyle } from "react-native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import { colors, radii, shadow, spacing } from "@/theme";
import { Text } from "./ui/Text";

/**
 * Static stylised map. Avoids native map SDK / API-key requirements so it runs
 * in Expo Go and on web. Backend-ready: swap this for react-native-maps `MapView`
 * with the same lat/long props later. Pins are positioned relative to the set's
 * bounding box.
 */
export type MapPin = {
  id: string;
  latitude: number;
  longitude: number;
  label?: string;
  price?: string;
  active?: boolean;
  logoUrl?: string;
};

export function MapPreview({
  pins = [],
  showRadius,
  radiusLabel,
  /** 0–1 relative radius for the area-picker vignette. Defaults to ~0.68. */
  radiusScale,
  onPressPin,
  height,
  fill,
  style,
  interactive = true,
  /** Cluster count markers + vignette radius (TooGoodToGo-style area picker). */
  variant = "default",
}: {
  pins?: MapPin[];
  showRadius?: boolean;
  radiusLabel?: string;
  radiusScale?: number;
  onPressPin?: (id: string) => void;
  height?: number;
  fill?: boolean;
  style?: ViewStyle;
  interactive?: boolean;
  variant?: "default" | "clusters";
}) {
  const isClusters = variant === "clusters";
  const circlePct = Math.round(Math.min(0.9, Math.max(0.28, radiusScale ?? 0.68)) * 100);
  const lats = pins.map((p) => p.latitude);
  const lngs = pins.map((p) => p.longitude);
  const minLat = Math.min(...lats, 0);
  const maxLat = Math.max(...lats, 1);
  const minLng = Math.min(...lngs, 0);
  const maxLng = Math.max(...lngs, 1);

  const pos = (p: MapPin) => ({
    left: `${10 + ((p.longitude - minLng) / (maxLng - minLng || 1)) * 80}%` as const,
    top: `${15 + (1 - (p.latitude - minLat) / (maxLat - minLat || 1)) * 65}%` as const,
  });

  return (
    <View
      style={[
        styles.map,
        isClusters && styles.mapClusters,
        fill ? styles.fill : { height: height ?? 200 },
        style,
      ]}
    >
      <View style={styles.grid}>
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={`h${i}`} style={[styles.gridLine, { top: `${(i + 1) * 14}%` }]} />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={`v${i}`} style={[styles.gridLineV, { left: `${(i + 1) * 14}%` }]} />
        ))}
        {/* Soft park / block patches for a street-map feel */}
        {isClusters ? (
          <>
            <View style={[styles.park, { top: "18%", left: "8%", width: "22%", height: "16%" }]} />
            <View style={[styles.park, { top: "58%", left: "62%", width: "28%", height: "18%" }]} />
            <View style={[styles.block, { top: "28%", left: "48%", width: "18%", height: "12%" }]} />
            <View style={[styles.block, { top: "72%", left: "12%", width: "24%", height: "10%" }]} />
          </>
        ) : null}
      </View>

      {showRadius ? (
        <View style={styles.radiusWrap} pointerEvents="none">
          {isClusters ? (
            <>
              <View style={[styles.radiusFill, { width: `${circlePct}%` }]} />
              <View style={[styles.radiusSpotlight, { width: `${circlePct}%` }]} />
            </>
          ) : (
            <View style={styles.radiusCircle} />
          )}
        </View>
      ) : null}

      {/* Current location marker */}
      {isClusters ? (
        <View style={styles.centerPin} pointerEvents="none">
          <Feather name="map-pin" size={28} color={colors.primary} />
        </View>
      ) : (
        <View style={[styles.center, styles.meDot]} pointerEvents="none">
          <View style={styles.meInner} />
        </View>
      )}

      {pins.map((p) => {
        const count = Number(p.price) || 0;
        const size = isClusters
          ? Math.min(44, Math.max(18, 14 + (count > 0 ? Math.log2(count + 1) * 8 : 0)))
          : undefined;

        if (isClusters) {
          const showCount = count > 1;
          const half = (size ?? 18) / 2;
          return (
            <Pressable
              key={p.id}
              disabled={!interactive || !onPressPin}
              onPress={() => onPressPin?.(p.id)}
              accessibilityLabel={p.label ?? `${p.price ?? ""} bags`}
              style={[
                styles.clusterPin,
                pos(p),
                {
                  width: size,
                  height: size,
                  borderRadius: half,
                  transform: [{ translateX: -half }, { translateY: -half }],
                },
              ]}
            >
              {showCount ? (
                <Text variant="caption" weight="bold" style={styles.clusterText}>
                  {p.price}
                </Text>
              ) : null}
            </Pressable>
          );
        }

        return (
          <Pressable
            key={p.id}
            disabled={!interactive || !onPressPin}
            onPress={() => onPressPin?.(p.id)}
            accessibilityLabel={p.label ?? "Map pin"}
            style={[p.logoUrl ? styles.logoPinWrap : styles.pin, pos(p)]}
          >
            {p.logoUrl ? (
              <View style={[styles.logoPin, p.active && styles.logoPinActive]}>
                <Image source={{ uri: p.logoUrl }} style={styles.logoPinImg} contentFit="cover" />
              </View>
            ) : (
              <>
                <View style={[styles.pinBubble, p.active && styles.pinActive]}>
                  <Feather name="shopping-bag" size={12} color={p.active ? colors.white : colors.primary} />
                  {p.price ? (
                    <Text
                      variant="caption"
                      style={{ color: p.active ? colors.white : colors.primaryDark }}
                    >
                      {p.price}
                    </Text>
                  ) : null}
                </View>
                <View style={[styles.pinPoint, p.active && { borderTopColor: colors.primary }]} />
              </>
            )}
          </Pressable>
        );
      })}

      {radiusLabel && !isClusters ? (
        <View style={styles.radiusBadge}>
          <Feather name="navigation" size={12} color={colors.primary} />
          <Text variant="caption" tone="brand">
            {radiusLabel}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    backgroundColor: "#E8EEE6",
    borderRadius: radii.lg,
    overflow: "hidden",
    position: "relative",
  },
  mapClusters: {
    borderRadius: 0,
    backgroundColor: "#DDE5DF",
  },
  fill: { flex: 1 },
  grid: { ...StyleSheet.absoluteFill },
  gridLine: { position: "absolute", left: 0, right: 0, height: 1, backgroundColor: "rgba(31,143,95,0.08)" },
  gridLineV: { position: "absolute", top: 0, bottom: 0, width: 1, backgroundColor: "rgba(31,143,95,0.08)" },
  park: {
    position: "absolute",
    backgroundColor: "rgba(31,143,95,0.12)",
    borderRadius: 6,
  },
  block: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.35)",
    borderRadius: 4,
  },
  radiusWrap: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  radiusCircle: {
    width: "70%",
    aspectRatio: 1,
    borderRadius: 999,
    backgroundColor: "rgba(31,143,95,0.10)",
    borderWidth: 1.5,
    borderColor: "rgba(31,143,95,0.35)",
  },
  radiusFill: {
    position: "absolute",
    aspectRatio: 1,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.38)",
  },
  radiusSpotlight: {
    aspectRatio: 1,
    borderRadius: 999,
    backgroundColor: "transparent",
    borderWidth: 480,
    borderColor: "rgba(23, 33, 27, 0.48)",
  },
  center: { position: "absolute", left: "50%", top: "50%", marginLeft: -9, marginTop: -9 },
  centerPin: {
    position: "absolute",
    left: "50%",
    top: "50%",
    marginLeft: -14,
    marginTop: -28,
    alignItems: "center",
  },
  meDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(37,99,235,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  meInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.info, borderWidth: 2, borderColor: colors.white },
  pin: { position: "absolute", alignItems: "center", transform: [{ translateX: -20 }, { translateY: -28 }] },
  logoPinWrap: { position: "absolute", transform: [{ translateX: -22 }, { translateY: -22 }] },
  clusterPin: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.9)",
  },
  clusterText: { color: colors.white, fontSize: 12, lineHeight: 14 },
  pinBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pinActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  logoPin: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: colors.surface,
    borderWidth: 3,
    borderColor: colors.white,
    ...shadow.card,
  },
  logoPinActive: { borderColor: colors.primary },
  logoPinImg: { width: "100%", height: "100%" },
  pinPoint: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 7,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: colors.surface,
  },
  radiusBadge: {
    position: "absolute",
    bottom: spacing.sm,
    left: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
});
