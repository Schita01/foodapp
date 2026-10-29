import { useState } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, radii, spacing } from "@/theme";
import { Text } from "./Text";
import type { UploadResponse } from "@/types";
import { uploadsApi } from "@/services/uploads";

/**
 * Mock photo upload. A real implementation would use expo-image-picker + POST /uploads.
 * Here we simulate picking from a small set of placeholder photos and validate size/type.
 */
const MOCK_PHOTOS = [
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400",
  "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400",
  "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
];

export function UploadField({
  label = "Add photos",
  ownerEntityType,
  ownerEntityId,
  max = 3,
  value,
  onChange,
}: {
  label?: string;
  ownerEntityType: string;
  ownerEntityId: string;
  max?: number;
  value: UploadResponse[];
  onChange: (uploads: UploadResponse[]) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const addPhoto = async () => {
    if (value.length >= max) return;
    setError(null);
    setUploading(true);
    try {
      const url = MOCK_PHOTOS[value.length % MOCK_PHOTOS.length];
      const res = await uploadsApi.upload({
        url,
        filename: `photo_${Date.now()}.jpg`,
        mimeType: "image/jpeg",
        size: 850_000,
        ownerEntityType,
        ownerEntityId,
      });
      onChange([...value, res]);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const remove = (id: string) => onChange(value.filter((u) => u.uploadId !== id));

  return (
    <View style={styles.wrap}>
      <Text variant="label">{label}</Text>
      <View style={styles.grid}>
        {value.map((u) => (
          <View key={u.uploadId} style={styles.thumb}>
            <Image source={{ uri: u.url }} style={styles.img} />
            <Pressable
              style={styles.removeBtn}
              onPress={() => remove(u.uploadId)}
              accessibilityLabel="Remove photo"
              hitSlop={6}
            >
              <Feather name="x" size={14} color={colors.white} />
            </Pressable>
          </View>
        ))}
        {value.length < max ? (
          <Pressable
            style={styles.addBtn}
            onPress={addPhoto}
            disabled={uploading}
            accessibilityLabel="Add photo"
          >
            <Feather name={uploading ? "loader" : "camera"} size={22} color={colors.primary} />
            <Text variant="caption" tone="brand">
              {uploading ? "Adding..." : "Add photo"}
            </Text>
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text variant="bodySm" tone="error">
          {error}
        </Text>
      ) : (
        <Text variant="bodySm" tone="tertiary">
          JPG or PNG, up to 5 MB each.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  thumb: { width: 84, height: 84, borderRadius: radii.md, overflow: "hidden" },
  img: { width: "100%", height: "100%" },
  removeBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  addBtn: {
    width: 84,
    height: 84,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    backgroundColor: colors.primarySoft,
  },
});
