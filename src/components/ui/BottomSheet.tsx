import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { colors, radii, shadow, spacing } from "@/theme";
import { Text } from "./Text";

export function BottomSheet({
  visible,
  onClose,
  title,
  children,
  footer,
  scroll = true,
  showHandle = true,
  closeInCircle = false,
  showClose = true,
}: {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  scroll?: boolean;
  showHandle?: boolean;
  closeInCircle?: boolean;
  showClose?: boolean;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <Pressable
          style={styles.backdropTouch}
          onPress={onClose}
          accessibilityLabel="Close"
        />
        <SafeAreaView edges={["bottom"]} style={styles.sheet}>
          {showHandle ? <View style={styles.handle} /> : null}
          {title ? (
            <View style={styles.header}>
              <Text variant="h2" style={showClose ? undefined : styles.headerTitleCenter}>
                {title}
              </Text>
              {showClose ? (
                <Pressable
                  onPress={onClose}
                  hitSlop={10}
                  accessibilityLabel="Close"
                  style={closeInCircle ? styles.closeCircle : undefined}
                >
                  <Feather name="x" size={20} color={colors.textPrimary} />
                </Pressable>
              ) : (
                <View style={styles.headerSpacer} />
              )}
            </View>
          ) : null}
          {scroll ? (
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>
          ) : (
            <View style={styles.scrollContent}>{children}</View>
          )}
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay, justifyContent: "flex-end" },
  backdropTouch: { flex: 1 },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    maxHeight: "88%",
    ...shadow.sheet,
  },
  handle: {
    alignSelf: "center",
    width: 44,
    height: 5,
    borderRadius: radii.pill,
    backgroundColor: colors.borderStrong,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  headerTitleCenter: { flex: 1, textAlign: "center" },
  headerSpacer: { width: 36 },
  scroll: { flexGrow: 0 },
  scrollContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg },
  footer: {
    padding: spacing.xl,
    borderTopWidth: 0,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  closeCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EFEFEF",
    alignItems: "center",
    justifyContent: "center",
  },
});
