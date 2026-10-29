import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { colors, radii, shadow, spacing } from "@/theme";
import { Screen, Text, PrimaryButton, SearchBar } from "@/components/ui";
import { MapPreview } from "@/components/MapPreview";
import { locationsApi, type LocationResult } from "@/services/locations";
import { useLocationStore, type LocationSlot } from "@/store/locationStore";

const DEFAULT: LocationResult = {
  id: "tbilisi",
  label: "Tbilisi",
  city: "Tbilisi",
  latitude: 41.7151,
  longitude: 44.8271,
  supported: true,
};

export default function EditLocationScreen() {
  const router = useRouter();
  const { slot } = useLocalSearchParams<{ slot?: string }>();
  const placeSlot = (["home", "work", "other"].includes(slot ?? "") ? slot : "other") as Exclude<
    LocationSlot,
    "current"
  >;
  const saved = useLocationStore((s) => s[placeSlot]);
  const setSavedPlace = useLocationStore((s) => s.setSavedPlace);

  const [query, setQuery] = useState(saved?.city ?? "");
  const [selected, setSelected] = useState<LocationResult>(
    saved
      ? {
          id: placeSlot,
          label: saved.city,
          city: saved.city,
          latitude: saved.latitude,
          longitude: saved.longitude,
          supported: true,
        }
      : DEFAULT,
  );

  const results = useQuery({
    queryKey: ["locationSearch", query],
    queryFn: () => locationsApi.search(query),
    enabled: query.length > 1 && query !== selected.city,
  });

  const searching = query.length > 1 && query !== selected.city;
  const mapPins = useMemo(
    () => [{ id: selected.id, latitude: selected.latitude, longitude: selected.longitude, active: true }],
    [selected],
  );

  const save = () => {
    setSavedPlace(placeSlot, {
      city: selected.city,
      latitude: selected.latitude,
      longitude: selected.longitude,
    });
    router.back();
  };

  return (
    <Screen edges={["top", "bottom"]} padded={false} background={colors.surface}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} accessibilityLabel="Back">
          <Feather name="arrow-left" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text variant="h3" center style={styles.flex}>
          Edit location
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.body}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Search by street name or city"
          variant="filled"
        />

        {searching ? (
          <View style={styles.results}>
            {(results.data ?? []).map((loc) => (
              <Pressable
                key={loc.id}
                style={styles.resultRow}
                onPress={() => {
                  setSelected(loc);
                  setQuery(loc.city);
                }}
              >
                <Text variant="body">{loc.label ?? loc.city}</Text>
              </Pressable>
            ))}
            {(results.data ?? []).length === 0 && !results.isLoading ? (
              <Text variant="bodySm" tone="secondary" style={styles.empty}>
                No matching places.
              </Text>
            ) : null}
            <Pressable onPress={() => router.back()} style={styles.close}>
              <Text variant="label" tone="secondary">
                Close
              </Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.mapWrap}>
              <MapPreview fill pins={mapPins} style={styles.map} />
              <View style={styles.locateBtn} pointerEvents="none">
                <Feather name="navigation" size={18} color={colors.primary} />
              </View>
            </View>
            <Text variant="bodySm" tone="tertiary" center>
              Drag the map to reposition the pin
            </Text>
            <PrimaryButton label="Save changes" onPress={save} />
          </>
        )}
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
  },
  headerSpacer: { width: 22 },
  flex: { flex: 1 },
  body: { flex: 1, paddingHorizontal: spacing.lg, gap: spacing.md, paddingBottom: spacing.lg },
  results: { gap: spacing.xs, flex: 1 },
  resultRow: { paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  empty: { paddingVertical: spacing.md },
  mapWrap: { flex: 1, minHeight: 260, borderRadius: radii.lg, overflow: "hidden", position: "relative" },
  map: { borderRadius: radii.lg },
  locateBtn: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.card,
  },
  close: { alignItems: "center", paddingVertical: spacing.lg, marginTop: "auto" },
});
