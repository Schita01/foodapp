import { useEffect, useRef, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import type { NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { colors, radii, shadow, spacing } from "@/theme";
import { BottomSheet, Text, SettingsToggle, Divider } from "@/components/ui";
import type { Filters, SortOption, PickupDay } from "@/store/filterStore";
import { defaultFilters } from "@/store/filterStore";
import type { ListingCategory } from "@/types";

type HighlightKey = "localHeroes" | "specialRewards" | "hiddenGem" | "isNew";

export const HIGHLIGHTS: { key: HighlightKey; label: string }[] = [
  { key: "localHeroes", label: "Local Heroes" },
  { key: "specialRewards", label: "Special Rewards" },
  { key: "hiddenGem", label: "Hidden gem" },
  { key: "isNew", label: "New" },
];

export const CATEGORIES: { label: string; value: ListingCategory; emoji: string }[] = [
  { label: "Cooked meals", value: "meals", emoji: "🍲" },
  { label: "Baked goods", value: "bakery", emoji: "🥐" },
  { label: "Groceries", value: "groceries", emoji: "🧺" },
  { label: "Sweets & snacks", value: "other", emoji: "🍪" },
  { label: "Sandwiches & salads", value: "drinks", emoji: "🥗" },
];

export const PICKUP_DAYS: { label: string; value: PickupDay }[] = [
  { label: "Now", value: "now" },
  { label: "Today", value: "today" },
  { label: "Tomorrow", value: "tomorrow" },
];

export const DIETS: { label: string; value: "vegetarian" | "vegan" }[] = [
  { label: "Vegetarian", value: "vegetarian" },
  { label: "Vegan", value: "vegan" },
];

export const SORTS: { label: string; value: SortOption }[] = [
  { label: "Relevance", value: "recommended" },
  { label: "Distance", value: "distance" },
  { label: "Price", value: "price" },
  { label: "Rating", value: "rating" },
];

function FilterFooter({ onReset, onApply }: { onReset: () => void; onApply: () => void }) {
  return (
    <View style={styles.footer}>
      <Pressable style={styles.resetBtn} onPress={onReset} accessibilityRole="button">
        <Text variant="label" style={styles.resetLabel}>
          Reset
        </Text>
      </Pressable>
      <Pressable style={styles.applyBtn} onPress={onApply} accessibilityRole="button">
        <Text variant="label" tone="inverse">
          Apply
        </Text>
      </Pressable>
    </View>
  );
}

function OutlineChip({
  label,
  selected,
  onPress,
  emoji,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  emoji?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[styles.chip, selected && styles.chipSelected, emoji ? styles.chipEmoji : null]}
    >
      {emoji ? <Text variant="body">{emoji}</Text> : null}
      <Text variant="body" weight="semibold" style={selected ? styles.chipTextOn : undefined}>
        {label}
      </Text>
    </Pressable>
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

const WHEEL_ITEM_H = 40;
const WHEEL_VISIBLE = 5;
const WHEEL_PAD = ((WHEEL_VISIBLE - 1) / 2) * WHEEL_ITEM_H;
const fmtHour = (h: number) => `${String(h).padStart(2, "0")}:00`;

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
      <TimeColumn value={to} onChange={(v) => onChange(from, v)} />
    </View>
  );
}

function useDraft(visible: boolean, filters: Filters) {
  const [draft, setDraft] = useState(filters);
  useEffect(() => {
    if (visible) setDraft(filters);
  }, [visible, filters]);
  return [draft, setDraft] as const;
}

type SheetProps = {
  visible: boolean;
  onClose: () => void;
  filters: Filters;
  onApply: (f: Filters) => void;
};

export function CategoryFilterSheet({ visible, onClose, filters, onApply }: SheetProps) {
  const [draft, setDraft] = useDraft(visible, filters);
  const toggle = (c: ListingCategory) =>
    setDraft((d) => ({
      ...d,
      categories: d.categories.includes(c) ? d.categories.filter((x) => x !== c) : [...d.categories, c],
    }));

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Category"
      showHandle={false}
      closeInCircle
      footer={
        <FilterFooter
          onReset={() => setDraft((d) => ({ ...d, categories: [] }))}
          onApply={() => {
            onApply(draft);
            onClose();
          }}
        />
      }
    >
      <View style={styles.wrapChips}>
        {CATEGORIES.map((c) => (
          <OutlineChip
            key={c.value}
            label={c.label}
            emoji={c.emoji}
            selected={draft.categories.includes(c.value)}
            onPress={() => toggle(c.value)}
          />
        ))}
      </View>
    </BottomSheet>
  );
}

export function DietFilterSheet({ visible, onClose, filters, onApply }: SheetProps) {
  const [draft, setDraft] = useDraft(visible, filters);
  const toggle = (v: "vegetarian" | "vegan") =>
    setDraft((d) => ({
      ...d,
      diet: d.diet.includes(v) ? d.diet.filter((x) => x !== v) : [...d.diet, v],
    }));

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Diet"
      showHandle={false}
      closeInCircle
      footer={
        <FilterFooter
          onReset={() => setDraft((d) => ({ ...d, diet: [] }))}
          onApply={() => {
            onApply(draft);
            onClose();
          }}
        />
      }
    >
      <View style={styles.wrapChips}>
        {DIETS.map((d) => (
          <OutlineChip
            key={d.value}
            label={d.label}
            selected={draft.diet.includes(d.value)}
            onPress={() => toggle(d.value)}
          />
        ))}
      </View>
    </BottomSheet>
  );
}

export function SortFilterSheet({ visible, onClose, filters, onApply }: SheetProps) {
  const [draft, setDraft] = useDraft(visible, filters);

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Sort"
      showHandle={false}
      closeInCircle
      footer={
        <FilterFooter
          onReset={() => setDraft((d) => ({ ...d, sort: "recommended" }))}
          onApply={() => {
            onApply(draft);
            onClose();
          }}
        />
      }
    >
      {SORTS.map((s) => (
        <RadioRow
          key={s.value}
          label={s.label}
          selected={draft.sort === s.value}
          onPress={() => setDraft((d) => ({ ...d, sort: s.value }))}
        />
      ))}
    </BottomSheet>
  );
}

export function CollectionTimeSheet({ visible, onClose, filters, onApply }: SheetProps) {
  const [draft, setDraft] = useDraft(visible, filters);
  const setPickup = (value: PickupDay) =>
    setDraft((d) => ({ ...d, pickupDay: d.pickupDay === value ? "any" : value }));

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Collection time"
      showHandle={false}
      closeInCircle
      footer={
        <FilterFooter
          onReset={() => setDraft((d) => ({ ...d, pickupDay: "any", pickupFrom: 0, pickupTo: 0 }))}
          onApply={() => {
            onApply(draft);
            onClose();
          }}
        />
      }
    >
      <View style={styles.wrapChips}>
        {PICKUP_DAYS.map((d) => (
          <OutlineChip
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
    </BottomSheet>
  );
}

export function AllFiltersScreen({ visible, onClose, filters, onApply }: SheetProps) {
  const [draft, setDraft] = useDraft(visible, filters);

  const toggleCategory = (c: ListingCategory) =>
    setDraft((d) => ({
      ...d,
      categories: d.categories.includes(c) ? d.categories.filter((x) => x !== c) : [...d.categories, c],
    }));
  const toggleDiet = (v: "vegetarian" | "vegan") =>
    setDraft((d) => ({
      ...d,
      diet: d.diet.includes(v) ? d.diet.filter((x) => x !== v) : [...d.diet, v],
    }));
  const setPickup = (value: PickupDay) =>
    setDraft((d) => ({ ...d, pickupDay: d.pickupDay === value ? "any" : value }));

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView edges={["top", "bottom"]} style={styles.full}>
        <View style={styles.fullHeader}>
          <Pressable onPress={onClose} style={styles.backCircle} accessibilityLabel="Back">
            <Feather name="arrow-left" size={20} color={colors.textPrimary} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.fullContent} showsVerticalScrollIndicator={false}>
          <Text variant="title" style={styles.filtersTitle}>
            Filters
          </Text>

          <Text variant="h3" style={styles.sectionTitle}>
            From RescueBite
          </Text>
          <View style={styles.wrapChips}>
            {HIGHLIGHTS.map((h) => (
              <OutlineChip
                key={h.key}
                label={h.label}
                selected={!!draft[h.key]}
                onPress={() => setDraft((d) => ({ ...d, [h.key]: !d[h.key] }))}
              />
            ))}
          </View>

          <Text variant="h3" style={styles.sectionTitle}>
            Category
          </Text>
          <View style={styles.wrapChips}>
            {CATEGORIES.map((c) => (
              <OutlineChip
                key={c.value}
                label={c.label}
                emoji={c.emoji}
                selected={draft.categories.includes(c.value)}
                onPress={() => toggleCategory(c.value)}
              />
            ))}
          </View>

          <Text variant="h3" style={styles.sectionTitle}>
            Collection time
          </Text>
          <View style={styles.wrapChips}>
            {PICKUP_DAYS.map((d) => (
              <OutlineChip
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

          <Text variant="h3" style={styles.sectionTitle}>
            Diet
          </Text>
          <View style={styles.wrapChips}>
            {DIETS.map((d) => (
              <OutlineChip
                key={d.value}
                label={d.label}
                selected={draft.diet.includes(d.value)}
                onPress={() => toggleDiet(d.value)}
              />
            ))}
          </View>

          <Text variant="h3" style={styles.sectionTitle}>
            Sort
          </Text>
          {SORTS.map((s) => (
            <RadioRow
              key={s.value}
              label={s.label}
              selected={draft.sort === s.value}
              onPress={() => setDraft((d) => ({ ...d, sort: s.value }))}
            />
          ))}

          <Divider />
          <SettingsToggle
            label="Show sold-out items"
            value={draft.showSoldOut}
            onValueChange={(v) => setDraft((d) => ({ ...d, showSoldOut: v }))}
          />
        </ScrollView>
        <View style={styles.fullFooter}>
          <FilterFooter
            onReset={() => setDraft({ ...defaultFilters, query: draft.query })}
            onApply={() => {
              onApply(draft);
              onClose();
            }}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrapChips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, paddingBottom: spacing.md },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: "#D8D8D8",
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    backgroundColor: colors.surface,
  },
  chipEmoji: { paddingLeft: spacing.sm, paddingVertical: 8 },
  chipSelected: { borderColor: colors.primaryDark, backgroundColor: colors.primarySoft },
  chipTextOn: { color: colors.primaryDark },
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
  radioOuterOn: { borderColor: colors.primaryDark },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primaryDark },
  footer: { flexDirection: "row", gap: spacing.md },
  resetBtn: {
    flex: 1,
    minHeight: 52,
    borderRadius: radii.lg,
    backgroundColor: "#E8E8E8",
    alignItems: "center",
    justifyContent: "center",
  },
  resetLabel: { color: "#6B6B6B" },
  applyBtn: {
    flex: 1,
    minHeight: 52,
    borderRadius: radii.lg,
    backgroundColor: colors.primaryDark,
    alignItems: "center",
    justifyContent: "center",
  },
  wheel: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xxl,
    marginTop: spacing.md,
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
  full: { flex: 1, backgroundColor: colors.white },
  fullHeader: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  backCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
  },
  fullContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  filtersTitle: { marginTop: spacing.md, marginBottom: spacing.lg },
  sectionTitle: { marginTop: spacing.xl, marginBottom: spacing.md },
  fullFooter: { paddingHorizontal: spacing.xl, paddingBottom: spacing.md, ...shadow.soft },
});
