import { StyleSheet, View } from "react-native";
import type { Currency } from "@/types";
import { formatPrice } from "@/utils/format";
import { spacing } from "@/theme";
import { Text } from "./Text";

export function PriceTag({
  price,
  originalValue,
  currency = "GEL",
  size = "md",
}: {
  price: number;
  originalValue?: number;
  currency?: Currency;
  size?: "md" | "lg";
}) {
  return (
    <View style={styles.row}>
      <Text
        variant={size === "lg" ? "h2" : "h3"}
        tone="brand"
        weight="bold"
      >
        {formatPrice(price, currency)}
      </Text>
      {originalValue != null && originalValue > price ? (
        <Text variant="bodySm" tone="tertiary" style={styles.strike}>
          {formatPrice(originalValue, currency)}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "baseline", gap: spacing.sm },
  strike: { textDecorationLine: "line-through" },
});
