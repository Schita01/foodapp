import { useState } from "react";
import { Pressable, StyleSheet, TextInput, TextInputProps, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, radii, spacing } from "@/theme";
import { Text } from "./Text";

type Props = TextInputProps & {
  label?: string;
  error?: string;
  hint?: string;
  multiline?: boolean;
  /** Leading icon inside the field. */
  icon?: keyof typeof Feather.glyphMap;
};

export function TextField({
  label,
  error,
  hint,
  multiline,
  icon,
  style,
  secureTextEntry,
  onFocus,
  onBlur,
  ...rest
}: Props) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(!!secureTextEntry);

  return (
    <View style={styles.wrap}>
      {label ? (
        <Text variant="label" style={styles.label}>
          {label}
        </Text>
      ) : null}
      <View
        style={[
          styles.field,
          multiline && styles.multilineField,
          focused && styles.fieldFocused,
          error ? styles.fieldError : null,
        ]}
      >
        {icon ? (
          <Feather
            name={icon}
            size={18}
            color={focused ? colors.primaryDark : colors.textTertiary}
            style={multiline ? styles.iconTop : undefined}
          />
        ) : null}
        <TextInput
          style={[styles.input, multiline && styles.multilineInput, style]}
          placeholderTextColor={colors.textTertiary}
          accessibilityLabel={label}
          multiline={multiline}
          secureTextEntry={hidden}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {secureTextEntry ? (
          <Pressable
            onPress={() => setHidden((v) => !v)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={hidden ? "Show password" : "Hide password"}
          >
            <Feather name={hidden ? "eye" : "eye-off"} size={18} color={colors.textSecondary} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <View style={styles.helpRow}>
          <Feather name="alert-circle" size={13} color={colors.error} />
          <Text variant="bodySm" tone="error">
            {error}
          </Text>
        </View>
      ) : hint ? (
        <Text variant="bodySm" tone="secondary" style={styles.help}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  label: { marginBottom: 2 },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    minHeight: 52,
  },
  multilineField: { alignItems: "flex-start", paddingVertical: spacing.md },
  fieldFocused: { borderColor: colors.primaryDark },
  fieldError: { borderColor: colors.error, backgroundColor: "#FFF8F8" },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    paddingVertical: spacing.md,
  },
  multilineInput: { minHeight: 96, textAlignVertical: "top", paddingVertical: 0 },
  iconTop: { marginTop: 2 },
  helpRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  help: { marginTop: 2 },
});
