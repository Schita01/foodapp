import { useMemo, useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import Slider from "@react-native-community/slider";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { colors, radii, shadow, spacing } from "@/theme";
import { Screen, Text, PrimaryButton, SearchBar } from "@/components/ui";
import { MapPreview, type MapPin } from "@/components/MapPreview";
import { locationsApi, type LocationResult } from "@/services/locations";
import { useLocationStore } from "@/store/locationStore";
import { mockListings } from "@/mock/data";

const PIN_COUNTS = [2, 4, 6, 11, 12, 7, 3, 2];

const TBILISI: LocationResult = {
  id: "current",
  label: "Tbilisi",
  city: "Tbilisi",
  latitude: 41.7151,
  longitude: 44.8271,
  supported: true,
};

/**
 * Browse / Area Selection step — shown after onboarding and before Discover.
 * Lets the user pick a city, set a search radius, or use their current
 * location, then continue to Discover with "Show results".
 */
export default function AreaSelectionScreen() {
  const router = useRouter();
  const existing = useLocationStore((s) => s.location);
  const setLocation = useLocationStore((s) => s.setLocation);

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<LocationResult>(
    existing
      ? {
          id: "current",
          label: existing.city,
          city: existing.city,
          latitude: existing.latitude,
          longitude: existing.longitude,
          supported: true,
        }
      : TBILISI,
  );
  const [radius, setRadius] = useState(existing?.radiusKm ?? 3);

  const results = useQuery({
    queryKey: ["locationSearch", query],
    queryFn: () => locationsApi.search(query),
    enabled: query.length > 0,
  });

  const pins: MapPin[] = useMemo(
    () =>
      mockListings
        .filter((l) => l.latitude != null && l.longitude != null)
        .slice(0, PIN_COUNTS.length)
        .map((l, i) => ({
          id: l.listingId,
          latitude: l.latitude as number,
          longitude: l.longitude as number,
          price: String(PIN_COUNTS[i]),
        })),
    [],
  );

  const pick = (loc: LocationResult) => {
    setSelected(loc);
    setQuery("");
  };

  const showResults = () => {
    if (!selected.supported) {
      router.replace("/location/unsupported");
      return;
    }
    setLocation({
      city: selected.city,
      latitude: selected.latitude,
      longitude: selected.longitude,
      radiusKm: radius,
      supported: true,
    });
    router.replace("/discover");
  };

  const useCurrent = () => {
    setSelected(TBILISI);
    setLocation({ ...TBILISI, radiusKm: radius });
    router.replace("/discover");
  };

  const searchResults = results.data ?? [];

  return (
    <Screen edges={["top", "bottom"]} padded={false} background={colors.surface}>
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text variant="h3" center weight="bold" style={styles.headerTitle}>
          Choose a location to see what's available
        </Text>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/discover"))}
          hitSlop={10}
          accessibilityLabel="Close"
          style={styles.headerSpacer}
        >
          <Feather name="x" size={22} color={colors.textTertiary} />
        </Pressable>
      </View>

      <View style={styles.mapWrap}>
        <MapPreview
          fill
          showRadius
          variant="clusters"
          radiusScale={0.28 + ((radius - 1) / 24) * 0.52}
          pins={pins}
          interactive={false}
        />
      </View>

      <View style={styles.panel}>
        <Text variant="label" center weight="bold">
          Select a distance
        </Text>

        <View style={styles.sliderRow}>
          <Slider
            style={styles.flex}
            minimumValue={1}
            maximumValue={25}
            step={1}
            value={radius}
            onValueChange={setRadius}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor="#E5E5E5"
            thumbTintColor={Platform.OS === "android" ? colors.primary : colors.white}
          />
          <Text variant="body" style={styles.radiusValue}>
            {radius} km
          </Text>
        </View>

        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Search for a city"
          variant="filled"
        />

        {query.length > 0 ? (
          <View style={styles.results}>
            {results.isLoading ? (
              <Text variant="bodySm" tone="secondary" style={styles.resultsHint}>
                Searching...
              </Text>
            ) : searchResults.length === 0 ? (
              <Text variant="bodySm" tone="secondary" style={styles.resultsHint}>
                No cities found.
              </Text>
            ) : (
              searchResults.map((loc) => (
                <Pressable key={loc.id} style={styles.resultRow} onPress={() => pick(loc)}>
                  <Feather name="map-pin" size={18} color={colors.textSecondary} />
                  <View style={styles.flex}>
                    <Text variant="body">{loc.city}</Text>
                    {!loc.supported ? (
                      <Text variant="caption" tone="error">
                        Not available yet
                      </Text>
                    ) : null}
                  </View>
                </Pressable>
              ))
            )}
          </View>
        ) : null}

        <Pressable onPress={useCurrent} style={styles.currentLink} accessibilityRole="button">
          <Feather name="navigation" size={16} color={colors.primary} />
          <Text variant="label" tone="brand">
            Use my current location
          </Text>
        </Pressable>

        <PrimaryButton label="Show results" onPress={showResults} style={styles.cta} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.surface,
    zIndex: 2,
  },
  headerSpacer: { width: 28, alignItems: "center" },
  headerTitle: { flex: 1 },
  mapWrap: {
    flex: 1,
    minHeight: 220,
    backgroundColor: "#DDE5DF",
  },
  panel: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
    gap: spacing.md,
    marginTop: -spacing.xxl,
    ...shadow.sheet,
  },
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  flex: { flex: 1 },
  radiusValue: {
    minWidth: 48,
    textAlign: "right",
    color: colors.textSecondary,
    fontWeight: "500",
  },
  results: { gap: spacing.xs },
  resultsHint: { paddingVertical: spacing.sm },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.backgroundAlt,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  currentLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  cta: { marginTop: spacing.xs },
});
