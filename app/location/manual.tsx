import { useMemo, useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import Slider from "@react-native-community/slider";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { colors, radii, shadow, spacing } from "@/theme";
import { Screen, Text, PrimaryButton, SearchBar } from "@/components/ui";
import { MapPreview } from "@/components/MapPreview";
import { locationsApi, type LocationResult } from "@/services/locations";
import { useLocationStore } from "@/store/locationStore";

const DEFAULT: LocationResult = {
  id: "tbilisi",
  label: "Tbilisi",
  city: "Tbilisi",
  latitude: 41.7151,
  longitude: 44.8271,
  supported: true,
};

export default function ManualLocationScreen() {
  const router = useRouter();
  const setLocation = useLocationStore((s) => s.setLocation);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<LocationResult>(DEFAULT);
  const [radius, setRadius] = useState(5);

  const results = useQuery({
    queryKey: ["locationSearch", query],
    queryFn: () => locationsApi.search(query),
    enabled: query.length > 1,
  });

  const mapPins = useMemo(
    () => [
      {
        id: selected.id,
        latitude: selected.latitude,
        longitude: selected.longitude,
        active: true,
      },
    ],
    [selected],
  );

  const pick = (loc: LocationResult) => {
    setSelected(loc);
    setQuery("");
  };

  const continueFlow = () => {
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

  return (
    <Screen edges={["top", "bottom"]} padded={false} background={colors.surface}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} accessibilityLabel="Back">
          <Feather name="arrow-left" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text variant="h3" style={styles.flex}>
          Choose city
        </Text>
      </View>

      <View style={styles.mapWrap}>
        <MapPreview fill pins={mapPins} showRadius radiusScale={0.25 + radius / 40} />
      </View>

      <View style={styles.panel}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Search for a city"
          variant="filled"
        />

        {query.length > 1 ? (
          <View style={styles.results}>
            {(results.data ?? []).map((loc) => (
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
            ))}
          </View>
        ) : (
          <Text variant="bodySm" tone="secondary">
            Selected: {selected.city}
          </Text>
        )}

        <Text variant="label">Search radius</Text>
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
          <Text variant="body">{radius} km</Text>
        </View>

        <PrimaryButton label="Use this location" onPress={continueFlow} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  flex: { flex: 1 },
  mapWrap: { flex: 1, minHeight: 240, backgroundColor: "#DDE5DF" },
  panel: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    padding: spacing.xl,
    gap: spacing.md,
    ...shadow.sheet,
  },
  results: { gap: spacing.xs, maxHeight: 160 },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.backgroundAlt,
    borderRadius: radii.md,
  },
  sliderRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
});
