import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { colors, radii, spacing } from "@/theme";
import { Screen, ScreenHeader, Text } from "@/components/ui";
import {
  SettingsGroup,
  SettingsRow,
  SettingsSectionLabel,
} from "@/components/settings/SettingsList";
import { useAuthStore } from "@/store/authStore";

export default function ManageAccountScreen() {
  const router = useRouter();
  const signOut = useAuthStore((s) => s.signOut);
  const go = (href: string) => router.push(href as Href);

  const logout = () => {
    Alert.alert("Log out", "You’ll need to sign in again to rescue food.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: () => {
          signOut();
          router.replace("/auth");
        },
      },
    ]);
  };

  return (
    <Screen edges={["top"]}>
      <ScreenHeader title="Manage account" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <SettingsGroup>
          <SettingsRow
            icon="user"
            label="Account details"
            onPress={() => go("/profile/account")}
          />
          <SettingsRow
            icon="credit-card"
            label="Payment cards"
            onPress={() => go("/profile/payments")}
          />
          <SettingsRow
            icon="gift"
            label="Vouchers"
            onPress={() => go("/profile/vouchers")}
          />
          <SettingsRow
            icon="bell"
            label="Notifications"
            onPress={() => go("/profile/notification-settings")}
          />
          <SettingsRow
            icon="headphones"
            label="Customer support"
            onPress={() => go("/profile/support")}
            last
          />
        </SettingsGroup>

        <SettingsSectionLabel label="Community" />
        <SettingsGroup>
          <SettingsRow
            icon="users"
            label="Invite your friends"
            onPress={() => go("/profile/invite")}
          />
          <SettingsRow
            icon="map-pin"
            label="Recommend a store"
            onPress={() => go("/profile/recommend")}
          />
          <SettingsRow
            icon="briefcase"
            label="Sign up your food business"
            onPress={() => go("/profile/business")}
          />
          <SettingsRow
            icon="heart"
            label="Join RescueBite"
            onPress={() => go("/profile/join")}
            last
          />
        </SettingsGroup>

        <SettingsSectionLabel label="Other" />
        <SettingsGroup>
          <SettingsRow
            icon="eye-off"
            label="Hidden stores"
            onPress={() => go("/profile/hidden")}
          />
          <SettingsRow
            icon="book-open"
            label="Blog"
            onPress={() => go("/profile/blog")}
          />
          <SettingsRow
            icon="file-text"
            label="Legal"
            onPress={() => go("/profile/legal")}
            last
          />
        </SettingsGroup>

        <Pressable
          onPress={logout}
          accessibilityRole="button"
          accessibilityLabel="Log out"
          style={({ pressed }) => [styles.logout, pressed && { opacity: 0.85 }]}
        >
          <Text variant="label" style={styles.logoutText}>
            Log out
          </Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.huge },
  logout: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xxxl,
    minHeight: 52,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.error,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutText: { color: colors.error },
});
