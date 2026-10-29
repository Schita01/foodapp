import { StyleSheet, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { Feather } from "@expo/vector-icons";
import { colors, radii, spacing } from "@/theme";
import { Text } from "./Text";

export function QRCodeDisplay({
  value,
  code,
  locked,
  size = 200,
}: {
  value: string;
  code: string;
  locked?: boolean;
  size?: number;
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.qrBox}>
        {locked ? (
          <View style={[styles.locked, { width: size, height: size }]}>
            <Feather name="lock" size={40} color={colors.textTertiary} />
            <Text variant="bodySm" tone="secondary" center>
              Available during your pickup window
            </Text>
          </View>
        ) : (
          <QRCode value={value} size={size} backgroundColor={colors.white} color={colors.primaryDark} />
        )}
      </View>
      <View style={styles.codeRow}>
        <Text variant="bodySm" tone="secondary">
          Pickup code
        </Text>
        <Text variant="title" weight="bold" style={styles.code}>
          {locked ? "• • • • • •" : code}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", gap: spacing.lg },
  qrBox: {
    backgroundColor: colors.white,
    borderRadius: radii.cardLg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  locked: { alignItems: "center", justifyContent: "center", gap: spacing.sm, padding: spacing.lg },
  codeRow: { alignItems: "center", gap: 2 },
  code: { letterSpacing: 6 },
});
