import { StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, radii, shadow, spacing } from "@/theme";
import type { SupportTicket } from "@/types";
import { timeAgo } from "@/utils/format";
import { supportStatusMeta } from "@/utils/status";
import { Text } from "../ui/Text";
import { StatusBadge } from "../ui/Badge";
import { Card } from "../ui/Card";

export function SupportTicketCard({
  ticket,
  onPress,
}: {
  ticket: SupportTicket;
  onPress: () => void;
}) {
  const meta = supportStatusMeta(ticket.status);
  const last = ticket.messages[ticket.messages.length - 1];
  return (
    <Card onPress={onPress} accessibilityLabel={ticket.title} style={styles.card}>
      <View style={styles.top}>
        <View style={styles.iconBox}>
          <Feather name="life-buoy" size={18} color={colors.primary} />
        </View>
        <View style={styles.text}>
          <Text variant="label" numberOfLines={1}>
            {ticket.title}
          </Text>
          <Text variant="bodySm" tone="secondary" numberOfLines={1}>
            {ticket.category}
          </Text>
        </View>
        <StatusBadge label={meta.label} tone={meta.tone} />
      </View>
      {last ? (
        <Text variant="bodySm" tone="secondary" numberOfLines={2} style={styles.preview}>
          {last.author === "support" ? "Support: " : "You: "}
          {last.body}
        </Text>
      ) : null}
      <Text variant="caption" tone="tertiary">
        Updated {timeAgo(ticket.updatedAt)}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm, ...shadow.soft },
  top: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { flex: 1, gap: 2 },
  preview: {},
});
