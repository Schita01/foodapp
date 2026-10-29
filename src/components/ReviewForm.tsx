import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { colors, spacing } from "@/theme";
import type { UploadResponse } from "@/types";
import { Text } from "./ui/Text";
import { RatingInput, RatingStars } from "./ui/RatingStars";
import { FilterChip } from "./ui/Chip";
import { TextField } from "./ui/TextField";
import { UploadField } from "./ui/UploadField";

export type ReviewDraft = {
  rating: number;
  qualityRating: number;
  quantityRating: number;
  pickupRating: number;
  tags: string[];
  comment: string;
  photos: UploadResponse[];
};

const TAGS = [
  "Great value",
  "Good portion",
  "Friendly staff",
  "Easy pickup",
  "Fresh food",
  "Poor quantity",
  "Wrong instructions",
  "Unsafe food",
];

export function ReviewForm({
  orderId,
  value,
  onChange,
}: {
  orderId: string;
  value: ReviewDraft;
  onChange: (d: ReviewDraft) => void;
}) {
  const set = (patch: Partial<ReviewDraft>) => onChange({ ...value, ...patch });
  const toggleTag = (tag: string) =>
    set({
      tags: value.tags.includes(tag)
        ? value.tags.filter((t) => t !== tag)
        : [...value.tags, tag],
    });

  return (
    <View style={styles.wrap}>
      <View style={styles.centerBlock}>
        <Text variant="h3" center>
          Overall rating
        </Text>
        <RatingInput value={value.rating} onChange={(v) => set({ rating: v })} />
      </View>

      <CategoryRow
        label="Quality"
        value={value.qualityRating}
        onChange={(v) => set({ qualityRating: v })}
      />
      <CategoryRow
        label="Quantity"
        value={value.quantityRating}
        onChange={(v) => set({ quantityRating: v })}
      />
      <CategoryRow
        label="Pickup experience"
        value={value.pickupRating}
        onChange={(v) => set({ pickupRating: v })}
      />

      <View style={styles.block}>
        <Text variant="label">Quick tags</Text>
        <View style={styles.tags}>
          {TAGS.map((t) => (
            <FilterChip
              key={t}
              label={t}
              selected={value.tags.includes(t)}
              onPress={() => toggleTag(t)}
            />
          ))}
        </View>
      </View>

      <TextField
        label="Comment (optional)"
        placeholder="Tell others about your rescue..."
        value={value.comment}
        onChangeText={(t) => set({ comment: t })}
        multiline
      />

      <UploadField
        label="Add a photo (optional)"
        ownerEntityType="review"
        ownerEntityId={orderId}
        value={value.photos}
        onChange={(photos) => set({ photos })}
      />
    </View>
  );
}

function CategoryRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <View style={styles.catRow}>
      <Text variant="body">{label}</Text>
      <View style={styles.catStars}>
        {value > 0 ? <RatingStars rating={value} showCount={false} size={16} /> : null}
        <CompactStars value={value} onChange={onChange} />
      </View>
    </View>
  );
}

function CompactStars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return <RatingInput value={value} onChange={onChange} size={22} />;
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xl },
  centerBlock: { alignItems: "center", gap: spacing.md },
  block: { gap: spacing.sm },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  catRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  catStars: { alignItems: "flex-end", gap: 2 },
});
