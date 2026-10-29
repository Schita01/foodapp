import { StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, radii, spacing } from "@/theme";
import { strings } from "@/constants/strings";
import { apiConfig } from "@/services/apiClient";
import { Text } from "./Text";
import { PrimaryButton } from "./Button";

export function ErrorState({
  title = "Something went wrong",
  message = strings.genericError,
  onRetry,
  icon = "alert-triangle",
  offline: offlineProp,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  icon?: keyof typeof Feather.glyphMap;
  offline?: boolean;
}) {
  // Fall back to the global offline flag so every error surface reflects offline mode.
  const offline = offlineProp ?? apiConfig.offline;
  return (
    <View style={styles.wrap}>
      <View style={styles.iconCircle}>
        <Feather
          name={offline ? "wifi-off" : icon}
          size={28}
          color={colors.error}
        />
      </View>
      <Text variant="h2" center>
        {offline ? "You're offline" : title}
      </Text>
      <Text variant="body" tone="secondary" center style={styles.message}>
        {offline ? "Check your connection and try again." : message}
      </Text>
      {onRetry ? (
        <PrimaryButton
          label={strings.tryAgain}
          icon="refresh-cw"
          onPress={onRetry}
          fullWidth={false}
          style={styles.btn}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xxl,
    gap: spacing.md,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: radii.pill,
    backgroundColor: colors.errorSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  message: { maxWidth: 300 },
  btn: { marginTop: spacing.sm },
});
