import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { colors, radii, spacing } from "@/theme";
import {
  PageLoader,
  PrimaryButton,
  Screen,
  ScreenHeader,
  SettingsToggle,
  Text,
} from "@/components/ui";
import { CheckSettingRow } from "@/components/settings/SettingsList";
import { useMe, useUpdateMe } from "@/hooks/useMe";
import type { NotificationSettings } from "@/types";

const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"] as const;

const DEFAULTS: NotificationSettings = {
  pickupReminders: true,
  orderUpdates: true,
  supportReplies: true,
  favouriteStoreAlerts: true,
  marketingEmails: true,
  dailyReminder: true,
  pushNotifications: true,
  emailNotifications: true,
  calendarReminders: false,
  dailyReminderDays: ["Mo", "Tu", "We", "Th", "Fr"],
};

export default function NotificationSettingsScreen() {
  const me = useMe();
  const update = useUpdateMe();
  const [prefs, setPrefs] = useState<NotificationSettings>(DEFAULTS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (me.data?.notificationSettings) {
      const next = { ...DEFAULTS, ...me.data.notificationSettings };
      setPrefs({
        ...next,
        dailyReminderDays: next.dailyReminderDays?.length
          ? next.dailyReminderDays
          : DEFAULTS.dailyReminderDays,
      });
    }
  }, [me.data?.notificationSettings]);

  const patch = (partial: Partial<NotificationSettings>) => {
    setPrefs((p) => ({ ...p, ...partial }));
    setSaved(false);
  };

  const toggleDay = (day: string) => {
    const days = prefs.dailyReminderDays.includes(day)
      ? prefs.dailyReminderDays.filter((d) => d !== day)
      : [...prefs.dailyReminderDays, day];
    patch({ dailyReminderDays: days, dailyReminder: days.length > 0 });
  };

  const save = async () => {
    await update.mutateAsync({ notificationSettings: prefs });
    setSaved(true);
  };

  if (me.isLoading) {
    return (
      <Screen edges={["top"]}>
        <ScreenHeader title="Notifications" />
        <PageLoader />
      </Screen>
    );
  }

  const pushOn = prefs.pushNotifications;

  return (
    <Screen edges={["top", "bottom"]}>
      <ScreenHeader title="Notifications" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <SettingsToggle
          label="Email"
          description="Be the first to learn about new stores, great tips, updates, and even a food pun or two."
          value={prefs.emailNotifications}
          onValueChange={(v) => patch({ emailNotifications: v })}
        />
        <SettingsToggle
          label="Calendar reminders"
          description="Get a calendar reminder before the collection time starts."
          value={prefs.calendarReminders}
          onValueChange={(v) => patch({ calendarReminders: v })}
        />
        <SettingsToggle
          label="Push notifications"
          description="Get notified about availability, feature updates, promotions, and more."
          value={prefs.pushNotifications}
          onValueChange={(v) => patch({ pushNotifications: v })}
        />

        <CheckSettingRow
          label="Important updates"
          description="Receive updates related to your order and other essential app notifications. Recommended for a seamless app experience."
          checked={prefs.orderUpdates}
          disabled={!pushOn}
          onToggle={() => patch({ orderUpdates: !prefs.orderUpdates })}
        />
        <CheckSettingRow
          label="Announcements and promotions"
          description="Be the first to hear about new stores joining the app, competitions, promotions in your area, and more."
          checked={prefs.marketingEmails}
          disabled={!pushOn}
          onToggle={() => patch({ marketingEmails: !prefs.marketingEmails })}
        />
        <CheckSettingRow
          label="Surprise Bag alerts"
          description="Receive personalised Surprise Bag recommendations and alerts."
          checked={prefs.pickupReminders}
          disabled={!pushOn}
          onToggle={() => patch({ pickupReminders: !prefs.pickupReminders })}
        />

        <View style={styles.daily}>
          <Text variant="label">Daily reminder</Text>
          <Text variant="bodySm" tone="secondary">
            Select which days you’d like an extra reminder to save food.
          </Text>
          <View style={styles.days}>
            {DAYS.map((day) => {
              const on = prefs.dailyReminderDays.includes(day);
              return (
                <Pressable
                  key={day}
                  onPress={() => toggleDay(day)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  style={[styles.day, on && styles.dayOn]}
                >
                  <Text
                    variant="caption"
                    weight="semibold"
                    style={{ color: on ? colors.primaryDark : colors.textSecondary }}
                  >
                    {day}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton
          label={saved ? "Saved" : "Save changes"}
          loading={update.isPending}
          onPress={() => void save()}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  daily: { gap: spacing.sm, paddingTop: spacing.lg },
  days: { flexDirection: "row", gap: spacing.xs, marginTop: spacing.sm },
  day: {
    flex: 1,
    height: 40,
    borderRadius: radii.pill,
    backgroundColor: colors.backgroundAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  dayOn: { backgroundColor: colors.primarySoft },
  footer: { padding: spacing.lg },
});
