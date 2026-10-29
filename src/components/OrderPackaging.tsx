import { useState } from "react";
import { LayoutAnimation, Pressable, StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, radii, spacing } from "@/theme";
import { Text } from "./ui/Text";
import type { PackagingInfo } from "@/types";

/**
 * Packaging & collection details shown on the order screen so customers know
 * what the store provides (container / carrier bag) and can prepare accordingly.
 * Mirrors the shared listing contract (OUR ADDON).
 */
export function OrderPackaging({
  collectionInstructions,
  packaging,
  allergens,
  ingredientsNote,
}: {
  collectionInstructions?: string;
  packaging?: PackagingInfo;
  allergens?: string[];
  ingredientsNote?: string;
}) {
  const [open, setOpen] = useState(false);
  const hasAllergens = (allergens?.length ?? 0) > 0 || !!ingredientsNote;

  if (!collectionInstructions && !packaging && !hasAllergens) return null;

  return (
    <View style={styles.card}>
      {collectionInstructions ? (
        <View style={styles.block}>
          <Text variant="h3">Collection instructions</Text>
          <Text variant="bodySm" tone="secondary">
            {collectionInstructions}
          </Text>
        </View>
      ) : null}

      {packaging ? (
        <View style={styles.block}>
          <Text variant="label">Packaging</Text>
          <PackagingTiles packaging={packaging} />
        </View>
      ) : null}

      {hasAllergens ? (
        <View style={styles.accWrap}>
          <Pressable
            style={styles.accHead}
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setOpen((v) => !v);
            }}
            accessibilityRole="button"
            accessibilityState={{ expanded: open }}
          >
            <Text variant="label" style={styles.flex}>
              Ingredients & allergens
            </Text>
            <Feather
              name={open ? "chevron-up" : "chevron-down"}
              size={20}
              color={colors.textSecondary}
            />
          </Pressable>
          {open ? (
            <View style={styles.accBody}>
              <Text variant="bodySm" tone="secondary">
                Contents may vary. If you have allergies or dietary restrictions, confirm with the
                store staff before collecting.
              </Text>
              {allergens?.length ? (
                <View style={styles.chips}>
                  {allergens.map((a) => (
                    <View key={a} style={styles.chip}>
                      <Text variant="caption" style={styles.chipText}>
                        {a}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
              {ingredientsNote ? (
                <Text variant="caption" tone="tertiary">
                  {ingredientsNote}
                </Text>
              ) : null}
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

/** Reusable Container / Carrier bag cards. Shared by order and listing screens. */
export function PackagingTiles({ packaging }: { packaging: PackagingInfo }) {
  return (
    <View style={styles.block}>
      <View style={styles.pkgRow}>
        <PackagingTile icon="box" label="Container" provided={packaging.containerProvided} />
        <PackagingTile
          icon="shopping-bag"
          label="Carrier bag"
          provided={packaging.carrierBagProvided}
        />
      </View>
      {packaging.note ? (
        <View style={styles.noteRow}>
          <Feather name="info" size={14} color={colors.textTertiary} />
          <Text variant="caption" tone="tertiary" style={styles.flex}>
            {packaging.note}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function PackagingTile({
  icon,
  label,
  provided,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  provided: boolean;
}) {
  return (
    <View style={[styles.tile, provided ? styles.tileOn : styles.tileOff]}>
      <View style={[styles.tileIcon, provided ? styles.tileIconOn : styles.tileIconOff]}>
        <Feather name={icon} size={20} color={provided ? colors.primary : colors.textTertiary} />
      </View>
      <Text variant="label">{label}</Text>
      <View style={styles.tileStatus}>
        <Feather
          name={provided ? "check-circle" : "x-circle"}
          size={12}
          color={provided ? colors.primary : colors.textTertiary}
        />
        <Text variant="caption" tone={provided ? "brand" : "tertiary"}>
          {provided ? "Provided" : "Not included"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  block: { gap: spacing.sm },
  flex: { flex: 1 },
  pkgRow: { flexDirection: "row", gap: spacing.md },
  tile: {
    flex: 1,
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.xs,
  },
  tileOn: { borderColor: colors.primarySoft, backgroundColor: colors.primarySoft },
  tileOff: { borderColor: colors.border, backgroundColor: colors.disabledBg },
  tileIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  tileIconOn: { backgroundColor: colors.surface },
  tileIconOff: { backgroundColor: colors.surface },
  tileStatus: { flexDirection: "row", alignItems: "center", gap: 4 },
  noteRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.xs },
  accWrap: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm },
  accHead: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  accBody: { gap: spacing.sm, paddingTop: spacing.sm },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  chip: {
    backgroundColor: colors.accentSoft,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  chipText: { color: colors.warning },
});
