import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import type { NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, radii, shadow, spacing } from "@/theme";
import { BottomSheet, Text, PrimaryButton, SecondaryButton, SettingsToggle, Divider } from "./ui";
import type { Filters, SortOption, PickupDay } from "@/store/filterStore";
import { defaultFilters } from "@/store/filterStore";
import type { ListingCategory } from "@/types";

type Highlight = "endingSoon" | "highRatedOnly" | "onlyFavourites";

const HIGHLIGHTS: { key: Highlight; label: string; icon: keyof typeof Feather.glyphMap }[] = [
  { key: "endingSoon", label: "Ending soon", icon: "clock" },
  { key: "highRatedOnly", label: "Top rated", icon: "star" },
  { key: "onlyFavourites", label: "Favourites", icon: "heart" },
];

const CATEGORIES: { label: string; value: ListingCategory; emoji: string }[] = [
  { label: "Cooked meals", value: "meals", emoji: "🍽️" },
  { label: "Baked goods", value: "bakery", emoji: "🥐" },
  { label: "Groceries", value: "groceries", emoji: "🛒" },
  { label: "Drinks", value: "drinks", emoji: "🥤" },
  { label: "Other", value: "other", emoji: "📦" },
];

const PICKUP_DAYS: { label: string; value: PickupDay }[] = [
  { label: "Now", value: "now" },
  { label: "Today", value: "today" },
  { label: "Tomorrow", value: "tomorrow" },
];

const DIETS: { label: string; value: "vegetarian" | "vegan" }[] = [
  { label: "Vegetarian", value: "vegetarian" },
  { label: "Vegan", value: "vegan" },
];

const SORTS: { label: string; value: SortOption }[] = [
  { label: "Relevance", value: "recommended" },
  { label: "Distance", value: "distance" },
  { label: "Price", value: "price" },
  { label: "Rating", value: "rating" },
];

const fmtHour = (h: number) => `${String(h).padStart(2, "0")}:00`;

export function FilterBottomSheet({
  visible,
  onClose,
  filters,
  onApply,
  resultCount,
}: {
  visible: boolean;
  onClose: () => void;
  filters: Filters;
  onApply: (f: Filters) => void;
  resultCount: (f: Filters) => number;
}) {
  const [draft, setDraft] = useState<Filters>(filters);
  useEffect(() => {
    if (visible) setDraft(filters);
  }, [visible, filters]);

  const toggleCategory = (c: ListingCategory) =>
    setDraft((d) => ({
      ...d,
      categories: d.categories.includes(c)
        ? d.categories.filter((x) => x !== c)
        : [...d.categories, c],
    }));

  const toggleDiet = (v: "vegetarian" | "vegan") =>
    setDraft((d) => ({
      ...d,
      diet: d.diet.includes(v) ? d.diet.filter((x) => x !== v) : [...d.diet, v],
    }));

  const setPickup = (value: PickupDay) =>
    setDraft((d) => ({ ...d, pickupDay: d.pickupDay === value ? "any" : value }));

  const count = resultCount(draft);

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Filters"
      footer={
        <View style={styles.footer}>
          <View style={styles.footerBtn}>
            <SecondaryButton label="Reset" onPress={() => setDraft(defaultFilters)} />
          </View>
          <View style={styles.footerBtn}>
            <PrimaryButton
              label={`Apply${count ? ` (${count})` : ""}`}
              onPress={() => {
                onApply(draft);
                onClose();
              }}
            />
          </View>
        </View>
      }
    >
      <Section title="Highlights">
        <View style={styles.chips}>
          {HIGHLIGHTS.map((h) => (
            <Chip
              key={h.key}
              label={h.label}
              icon={h.icon}
              selected={!!draft[h.key]}
              onPress={() => setDraft((d) => ({ ...d, [h.key]: !d[h.key] }))}
            />
          ))}
        </View>
      </Section>

      <Divider />
      <Section title="Category">
        <View style={styles.grid}>
          {CATEGORIES.map((c) => (
            <CategoryCard
              key={c.value}
              label={c.label}
              emoji={c.emoji}
              selected={draft.categories.includes(c.value)}
              onPress={() => toggleCategory(c.value)}
            />
          ))}
        </View>
      </Section>

      <Divider />
      <Section title="Collection time">
        <View style={styles.chips}>
          {PICKUP_DAYS.map((d) => (
            <Chip
              key={d.value}
              label={d.label}
              selected={draft.pickupDay === d.value}
              onPress={() => setPickup(d.value)}
            />
          ))}
        </View>
        <TimeWheel
          from={draft.pickupFrom}
          to={draft.pickupTo}
          onChange={(from, to) => setDraft((d) => ({ ...d, pickupFrom: from, pickupTo: to }))}
        />
      </Section>

      <Divider />
      <Section title="Diet">
        <View style={styles.chips}>
          {DIETS.map((d) => (
            <Chip
              key={d.value}
              label={d.label}
              selected={draft.diet.includes(d.value)}
              onPress={() => toggleDiet(d.value)}
            />
          ))}
        </View>
      </Section>

      <Divider />
      <Section title="Sort">
        <View>
          {SORTS.map((s) => (
            <RadioRow
              key={s.value}
              label={s.label}
              selected={draft.sort === s.value}
              onPress={() => setDraft((prev) => ({ ...prev, sort: s.value }))}
            />
          ))}
        </View>
      </Section>

      <Divider />
      <View style={styles.toggleRow}>
        <SettingsToggle
          label="Show sold-out items"
          value={draft.showSoldOut}
          onValueChange={(v) => setDraft((d) => ({ ...d, showSoldOut: v }))}
        />
      </View>
    </BottomSheet>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="h3" style={styles.sectionTitle}>
        {title}
      </Text>
      {children}
    </View>
  );
}

function Chip({
  label,
  emoji,
  icon,
  selected,
  onPress,
}: {
  label: string;
  emoji?: string;
  icon?: keyof typeof Feather.glyphMap;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      {emoji ? <Text variant="bodySm">{emoji}</Text> : null}
      {icon ? (
        <Feather name={icon} size={14} color={selected ? colors.primaryDark : colors.textSecondary} />
      ) : null}
      <Text
        variant="bodySm"
        weight="semibold"
        style={{ color: selected ? colors.primaryDark : colors.textPrimary }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function CategoryCard({
  label,
  emoji,
  selected,
  onPress,
}: {
  label: string;
  emoji: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.catCard, selected && styles.catCardSelected]}
    >
      <View style={[styles.catBadge, selected && styles.catBadgeSelected]}>
        <Text variant="body">{emoji}</Text>
      </View>
      <Text
        variant="bodySm"
        weight="semibold"
        numberOfLines={1}
        style={[styles.catLabel, { color: selected ? colors.primaryDark : colors.textPrimary }]}
      >
        {label}
      </Text>
      {selected ? (
        <Feather name="check" size={16} color={colors.primary} style={styles.catCheck} />
      ) : null}
    </Pressable>
  );
}

const WHEEL_ITEM_H = 40;
const WHEEL_VISIBLE = 5;
const WHEEL_PAD = ((WHEEL_VISIBLE - 1) / 2) * WHEEL_ITEM_H;

function TimeWheel({
  from,
  to,
  onChange,
}: {
  from: number;
  to: number;
  onChange: (from: number, to: number) => void;
}) {
  return (
    <View style={styles.wheel}>
      <TimeColumn value={from} onChange={(v) => onChange(v, to)} />
      <Text variant="body" tone="secondary">
        to
      </Text>
      <TimeColumn value={to} onChange={(v) => onChange(from, v)} />
    </View>
  );
}

function TimeColumn({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const ref = useRef<ScrollView>(null);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  useEffect(() => {
    const t = setTimeout(() => {
      ref.current?.scrollTo({ y: value * WHEEL_ITEM_H, animated: false });
    }, 0);
    return () => clearTimeout(t);
  }, [value]);

  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.y / WHEEL_ITEM_H);
    const clamped = Math.max(0, Math.min(23, idx));
    if (clamped !== value) onChange(clamped);
  };

  return (
    <View style={styles.wheelColWrap}>
      <View style={styles.wheelBand} pointerEvents="none" />
      <ScrollView
        ref={ref}
        showsVerticalScrollIndicator={false}
        snapToInterval={WHEEL_ITEM_H}
        decelerationRate="fast"
        nestedScrollEnabled
        onMomentumScrollEnd={onEnd}
        contentContainerStyle={styles.wheelContent}
      >
        {hours.map((h) => (
          <View key={h} style={styles.wheelItem}>
            <Text variant={h === value ? "h3" : "body"} tone={h === value ? "primary" : "tertiary"}>
              {fmtHour(h)}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function RadioRow({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.radioRow} onPress={onPress} accessibilityRole="radio" accessibilityState={{ selected }}>
      <Text variant="body">{label}</Text>
      <View style={[styles.radioOuter, selected && styles.radioOuterOn]}>
        {selected ? <View style={styles.radioInner} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: { paddingVertical: spacing.md, gap: spacing.sm },
  sectionTitle: { marginBottom: spacing.xs },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  chipSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  catCard: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    ...shadow.soft,
  },
  catCardSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  catBadge: {
    width: 34,
    height: 34,
    borderRadius: radii.pill,
    backgroundColor: colors.disabledBg,
    alignItems: "center",
    justifyContent: "center",
  },
  catBadgeSelected: { backgroundColor: colors.surface },
  catLabel: { flex: 1 },
  catCheck: { marginLeft: "auto" },
  wheel: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
    marginTop: spacing.xs,
  },
  wheelColWrap: {
    width: 120,
    height: WHEEL_ITEM_H * WHEEL_VISIBLE,
    justifyContent: "center",
  },
  wheelBand: {
    position: "absolute",
    left: spacing.sm,
    right: spacing.sm,
    top: WHEEL_PAD,
    height: WHEEL_ITEM_H,
    borderRadius: radii.lg,
    backgroundColor: colors.disabledBg,
  },
  wheelContent: { paddingVertical: WHEEL_PAD },
  wheelItem: { height: WHEEL_ITEM_H, alignItems: "center", justifyContent: "center" },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterOn: { borderColor: colors.primary },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary },
  toggleRow: { paddingVertical: spacing.md },
  footer: { flexDirection: "row", gap: spacing.md },
  footerBtn: { flex: 1 },
});
