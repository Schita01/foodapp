import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, radii, shadow, spacing } from "@/theme";

export function SearchBar({
  value,
  onChangeText,
  placeholder = "Search restaurants, bags, groceries",
  onSubmit,
  onPress,
  editable = true,
  autoFocus,
  /** Filled light-grey pill (area picker). Default is outlined surface. */
  variant = "outlined",
}: {
  value?: string;
  onChangeText?: (t: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  onPress?: () => void;
  editable?: boolean;
  autoFocus?: boolean;
  variant?: "outlined" | "filled";
}) {
  const inner = (
    <View
      style={[styles.bar, variant === "filled" && styles.barFilled]}
      pointerEvents={editable ? "auto" : "none"}
    >
      <Feather name="search" size={18} color={colors.textTertiary} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        onSubmitEditing={onSubmit}
        editable={editable}
        autoFocus={autoFocus}
        returnKeyType="search"
        accessibilityLabel="Search"
      />
      {value ? (
        <Pressable onPress={() => onChangeText?.("")} hitSlop={8} accessibilityLabel="Clear search">
          <Feather name="x" size={18} color={colors.textSecondary} />
        </Pressable>
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} accessibilityRole="search" accessibilityLabel="Search">
        {inner}
      </Pressable>
    );
  }
  return inner;
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    height: 50,
    ...shadow.soft,
  },
  barFilled: {
    backgroundColor: "#F1F1F1",
    borderWidth: 0,
    borderColor: "transparent",
    shadowOpacity: 0,
    elevation: 0,
  },
  input: { flex: 1, fontSize: 15, color: colors.textPrimary, paddingVertical: 0 },
});
