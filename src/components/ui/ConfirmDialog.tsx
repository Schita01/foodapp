import { Modal, StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, radii, shadow, spacing } from "@/theme";
import { Text } from "./Text";
import { PrimaryButton, TextButton } from "./Button";

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive,
  loading,
  onConfirm,
  onCancel,
  icon,
}: {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  icon?: keyof typeof Feather.glyphMap;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.dialog}>
          {icon ? (
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: destructive ? colors.errorSoft : colors.primarySoft },
              ]}
            >
              <Feather
                name={icon}
                size={24}
                color={destructive ? colors.error : colors.primary}
              />
            </View>
          ) : null}
          <Text variant="h2" center>
            {title}
          </Text>
          {message ? (
            <Text variant="body" tone="secondary" center>
              {message}
            </Text>
          ) : null}
          <View style={styles.actions}>
            <PrimaryButton
              label={confirmLabel}
              onPress={onConfirm}
              loading={loading}
              tone={destructive ? "danger" : "primary"}
            />
            <TextButton label={cancelLabel} onPress={onCancel} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  dialog: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: radii.sheet,
    padding: spacing.xxl,
    alignItems: "center",
    gap: spacing.md,
    ...shadow.sheet,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  actions: { alignSelf: "stretch", marginTop: spacing.sm, gap: spacing.xs },
});
