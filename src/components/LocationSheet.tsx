import { Pressable, StyleSheet, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { colors, radii, spacing } from "@/theme";
import { BottomSheet, Text, Divider } from "./ui";
import { useLocationStore, type LocationSlot } from "@/store/locationStore";

export function LocationSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const router = useRouter();
  const location = useLocationStore((s) => s.location);
  const selectedSlot = useLocationStore((s) => s.selectedSlot);
  const home = useLocationStore((s) => s.home);
  const work = useLocationStore((s) => s.work);
  const other = useLocationStore((s) => s.other);
  const selectSlot = useLocationStore((s) => s.selectSlot);

  const openEdit = (slot: Exclude<LocationSlot, "current">) => {
    onClose();
    router.push(`/location/edit?slot=${slot}` as Href);
  };

  const pick = (slot: LocationSlot) => {
    if (slot !== "current") {
      const saved = slot === "home" ? home : slot === "work" ? work : other;
      if (!saved) {
        openEdit(slot);
        return;
      }
    }
    selectSlot(slot);
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Location" scroll={false} showClose={false}>
      <Pressable style={styles.search} onPress={() => openEdit("other")} accessibilityRole="search">
        <Feather name="search" size={18} color={colors.textSecondary} />
        <Text variant="body" tone="tertiary">
          Search by street name or city
        </Text>
      </Pressable>

      <Row
        icon="navigation"
        label="Current location"
        selected={selectedSlot === "current"}
        onPress={() => pick("current")}
      />
      <Divider />
      <Row
        icon="home"
        label="Home"
        description={home?.city}
        selected={selectedSlot === "home"}
        onPress={() => pick("home")}
        onEdit={() => openEdit("home")}
      />
      <Divider />
      <Row
        icon="briefcase"
        label="Work"
        description={work?.city}
        selected={selectedSlot === "work"}
        onPress={() => pick("work")}
        onEdit={() => openEdit("work")}
      />
      <Divider />
      <Row
        icon="map-pin"
        label="Other"
        description={other?.city ?? location?.city}
        selected={selectedSlot === "other"}
        onPress={() => pick("other")}
        onEdit={() => openEdit("other")}
      />

      <Pressable onPress={onClose} style={styles.close} accessibilityRole="button">
        <Text variant="label" tone="secondary">
          Close
        </Text>
      </Pressable>
    </BottomSheet>
  );
}

function Row({
  icon,
  label,
  description,
  selected,
  onPress,
  onEdit,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
  onEdit?: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress} accessibilityRole="button">
      <View style={styles.rowIcon}>
        <Feather name={icon} size={18} color={colors.primary} />
      </View>
      <View style={styles.flex}>
        <Text variant="label">{label}</Text>
        {description ? (
          <View style={styles.descRow}>
            <Text variant="bodySm" tone="secondary" numberOfLines={1} style={styles.flex}>
              {description}
            </Text>
            {onEdit ? (
              <Pressable onPress={onEdit} hitSlop={8} accessibilityRole="button">
                <Text variant="label" tone="brand">
                  Edit
                </Text>
              </Pressable>
            ) : null}
          </View>
        ) : onEdit ? (
          <Pressable onPress={onEdit} hitSlop={8}>
            <Text variant="label" tone="brand">
              Add
            </Text>
          </Pressable>
        ) : null}
      </View>
      <Radio selected={selected} />
    </Pressable>
  );
}

function Radio({ selected }: { selected: boolean }) {
  return (
    <View style={[styles.radioOuter, selected && styles.radioOuterOn]}>
      {selected ? <View style={styles.radioInner} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    height: 50,
    marginBottom: spacing.md,
  },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.md },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  flex: { flex: 1 },
  descRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: 2 },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterOn: { borderColor: colors.primaryDark },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primaryDark },
  close: { alignItems: "center", paddingVertical: spacing.lg, marginTop: spacing.sm },
});
