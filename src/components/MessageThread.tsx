import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { colors, radii, spacing } from "@/theme";
import type { SupportMessage } from "@/types";
import { timeAgo } from "@/utils/format";
import { Text } from "./ui/Text";

export function MessageThread({ messages }: { messages: SupportMessage[] }) {
  return (
    <View style={styles.wrap}>
      {messages.map((m) => {
        const mine = m.author === "customer";
        return (
          <View key={m.messageId} style={[styles.row, mine ? styles.rowMine : styles.rowTheirs]}>
            <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
              {!mine ? (
                <Text variant="caption" tone="brand" style={styles.author}>
                  {m.authorName}
                </Text>
              ) : null}
              <Text variant="body" style={{ color: mine ? colors.white : colors.textPrimary }}>
                {m.body}
              </Text>
              {m.attachments?.length ? (
                <View style={styles.attachments}>
                  {m.attachments.map((a) => (
                    <Image key={a.uploadId} source={{ uri: a.url }} style={styles.attachment} contentFit="cover" />
                  ))}
                </View>
              ) : null}
              <Text
                variant="caption"
                style={[styles.time, { color: mine ? "rgba(255,255,255,0.8)" : colors.textTertiary }]}
              >
                {timeAgo(m.createdAt)}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  row: { flexDirection: "row" },
  rowMine: { justifyContent: "flex-end" },
  rowTheirs: { justifyContent: "flex-start" },
  bubble: { maxWidth: "82%", borderRadius: radii.lg, padding: spacing.md, gap: 4 },
  mine: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  theirs: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 4,
  },
  author: { marginBottom: 2 },
  attachments: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginTop: spacing.xs },
  attachment: { width: 80, height: 80, borderRadius: radii.sm },
  time: { alignSelf: "flex-end" },
});
