import { useState } from "react";
import { LayoutAnimation, Pressable, StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, spacing } from "@/theme";
import { Text } from "./Text";

export function Accordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <View>
      {items.map((item, i) => (
        <View key={i} style={styles.item}>
          <Pressable
            style={styles.head}
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setOpen(open === i ? null : i);
            }}
            accessibilityRole="button"
            accessibilityState={{ expanded: open === i }}
          >
            <Text variant="label" style={styles.flex}>
              {item.q}
            </Text>
            <Feather
              name={open === i ? "chevron-up" : "chevron-down"}
              size={20}
              color={colors.textSecondary}
            />
          </Pressable>
          {open === i ? (
            <Text variant="bodySm" tone="secondary" style={styles.body}>
              {item.a}
            </Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  item: { borderBottomWidth: 1, borderBottomColor: colors.border },
  head: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.md, gap: spacing.sm },
  flex: { flex: 1 },
  body: { paddingBottom: spacing.md },
});
