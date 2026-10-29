import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { colors, radii, shadow, spacing } from "@/theme";
import {
  BottomSheet,
  EmptyState,
  PageLoader,
  PrimaryButton,
  Screen,
  ScreenHeader,
  StatusBadge,
  Text,
  TextField,
} from "@/components/ui";
import { SettingsGroup, SettingsRow } from "@/components/settings/SettingsList";
import { useCreateTicket, useTickets } from "@/hooks/useSupport";
import { supportStatusMeta } from "@/utils/status";
import { formatDateTime } from "@/utils/format";
import type { SupportCategory } from "@/types";

const CATEGORIES: SupportCategory[] = [
  "Pickup issue",
  "Payment issue",
  "Refund request",
  "Technical issue",
  "Other",
];

export default function CustomerSupportScreen() {
  const tickets = useTickets();
  const create = useCreateTicket();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<SupportCategory>("Other");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (message.trim().length < 8) {
      setError("Please tell us a bit more so we can help.");
      return;
    }
    await create.mutateAsync({ category, message: message.trim() });
    setMessage("");
    setOpen(false);
  };

  return (
    <Screen edges={["top"]}>
      <ScreenHeader title="Customer support" />
      {tickets.isLoading ? (
        <PageLoader />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text variant="body" tone="secondary">
            Need help with an order, a payment, or the app? Send us a message and we’ll get back to you.
          </Text>
          <PrimaryButton label="Start a conversation" onPress={() => setOpen(true)} />

          <Text variant="h3" style={styles.section}>
            Your tickets
          </Text>
          {(tickets.data ?? []).length === 0 ? (
            <EmptyState
              compact
              icon="headphones"
              title="No conversations yet"
              subtitle="When you contact us, your tickets will show up here."
            />
          ) : (
            <View style={styles.list}>
              {(tickets.data ?? []).map((t) => {
                const meta = supportStatusMeta(t.status);
                return (
                  <View key={t.supportTicketId} style={styles.ticket}>
                    <View style={styles.ticketTop}>
                      <Text variant="label" style={styles.flex}>
                        {t.title || t.category}
                      </Text>
                      <StatusBadge label={meta.label} tone={meta.tone} size="sm" />
                    </View>
                    <Text variant="bodySm" tone="secondary" numberOfLines={2}>
                      {t.messages[t.messages.length - 1]?.body}
                    </Text>
                    <Text variant="caption" tone="tertiary">
                      {formatDateTime(t.updatedAt)}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}

      <BottomSheet
        visible={open}
        onClose={() => setOpen(false)}
        title="How can we help?"
        closeInCircle
        footer={
          <PrimaryButton label="Send" loading={create.isPending} onPress={() => void submit()} />
        }
      >
        <Text variant="caption" tone="tertiary" style={styles.catLabel}>
          CATEGORY
        </Text>
        <SettingsGroup>
          {CATEGORIES.map((c, i) => (
            <SettingsRow
              key={c}
              label={c}
              value={category === c ? "Selected" : undefined}
              last={i === CATEGORIES.length - 1}
              onPress={() => setCategory(c)}
            />
          ))}
        </SettingsGroup>
        <View style={styles.msg}>
          <TextField
            label="Message"
            placeholder="Describe what happened"
            multiline
            value={message}
            onChangeText={(t) => {
              setMessage(t);
              setError(null);
            }}
          />
          {error ? (
            <Text variant="bodySm" tone="error">
              {error}
            </Text>
          ) : null}
        </View>
      </BottomSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.huge },
  section: { marginTop: spacing.sm },
  list: { gap: spacing.md },
  ticket: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: 4,
    ...shadow.soft,
  },
  ticketTop: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  flex: { flex: 1 },
  catLabel: { marginBottom: spacing.sm, letterSpacing: 0.5 },
  msg: { marginTop: spacing.lg, gap: spacing.sm },
});
