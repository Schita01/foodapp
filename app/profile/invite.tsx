import { Pressable, ScrollView, Share, StyleSheet, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { colors, radii, spacing } from "@/theme";
import { PrimaryButton, Screen, ScreenHeader, Text } from "@/components/ui";
import { currencySymbol } from "@/utils/format";

const STEPS = [
  {
    icon: "user-plus" as const,
    title: "New app users only",
    body: "Invite a friend who hasn’t downloaded the app and have never saved a Surprise Bag or a RescueBite Parcel.",
  },
  {
    icon: "link" as const,
    title: "Share your unique link",
    body: "This only works if your friends use your unique invitation link to download the app.",
  },
  {
    icon: "bell" as const,
    title: "Get notified",
    body: "Turn on push notifications, and we’ll let you know when you earn a voucher.",
  },
  {
    icon: "clock" as const,
    title: "Use your voucher within 21 days",
    body: "You have 21 days from the time a voucher is issued until it expires.",
  },
];

const REFERRAL = "https://rescuebite.app/invite/luka";

export default function InviteFriendsScreen() {
  const router = useRouter();
  const amount = `${currencySymbol("GEL")}5.00`;

  const invite = async () => {
    try {
      await Share.share({
        message: `Join me on RescueBite and rescue surplus food. Use my link to get ${amount} off your first bag: ${REFERRAL}`,
      });
    } catch {
      /* user dismissed the share sheet */
    }
  };

  return (
    <Screen edges={["top"]}>
      <ScreenHeader title="Invite your friends" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={["#E4F3EA", "#F4FBF6"]} style={styles.hero}>
          <Text variant="h1" center style={styles.heroTitle}>
            Invite your friends and earn {amount} vouchers
          </Text>
          <Text variant="body" tone="secondary" center>
            Invite as many friends as you want and earn a {amount} voucher for every first Surprise Bag or RescueBite Parcel they save. Ready to make a difference together?
          </Text>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800",
            }}
            style={styles.photo}
            contentFit="cover"
          />
          <PrimaryButton label="Invite your friends" onPress={() => void invite()} />
          <Pressable onPress={() => router.push("/legal/terms")}>
            <Text variant="bodySm" weight="semibold" tone="brand" center>
              See full Terms
            </Text>
          </Pressable>
        </LinearGradient>

        <Text variant="h3" style={styles.how}>
          How it works:
        </Text>
        {STEPS.map((step) => (
          <View key={step.title} style={styles.step}>
            <View style={styles.stepIcon}>
              <Feather name={step.icon} size={18} color={colors.primaryDark} />
            </View>
            <View style={styles.flex}>
              <Text variant="label">{step.title}</Text>
              <Text variant="bodySm" tone="secondary">
                {step.body}
              </Text>
              {step.title === "Get notified" ? (
                <Pressable onPress={() => router.push("/profile/notification-settings" as Href)}>
                  <Text variant="bodySm" weight="semibold" tone="brand">
                    Go to Notifications
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, paddingBottom: spacing.huge, gap: spacing.md },
  hero: {
    borderRadius: radii.cardLg,
    padding: spacing.lg,
    gap: spacing.md,
    alignItems: "center",
  },
  heroTitle: { color: colors.primaryDark },
  photo: {
    width: "100%",
    height: 160,
    borderRadius: radii.lg,
    backgroundColor: colors.primarySoft,
  },
  how: { marginTop: spacing.md },
  step: { flexDirection: "row", gap: spacing.md, alignItems: "flex-start" },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  flex: { flex: 1, gap: 4 },
});
