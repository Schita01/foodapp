import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radii, shadow, spacing } from "@/theme";
import { Screen, Text, ErrorState, PageLoader } from "@/components/ui";
import { useMe } from "@/hooks/useMe";
import { useOrders } from "@/hooks/useOrders";
import { useUnreadCount } from "@/hooks/useNotifications";
import { useAuthStore } from "@/store/authStore";
import { mockVouchers } from "@/mock/data";
import type { Order } from "@/types";
import { currencySymbol, formatPrice } from "@/utils/format";

const INK = "#0F4F37";

function storesSupportedCount(orders: Order[]) {
  const stores = new Set<string>();
  for (const o of orders) {
    if (!["CANCELLED", "MISSED_PICKUP"].includes(o.orderStatus)) {
      stores.add(o.restaurantId);
    }
  }
  return stores.size;
}

export default function ProfileScreen() {
  const router = useRouter();
  const go = (href: string) => router.push(href as Href);
  const signOut = useAuthStore((s) => s.signOut);
  const me = useMe();
  const orders = useOrders();
  const unread = useUnreadCount();

  const storesSupported = useMemo(
    () => storesSupportedCount(orders.data ?? []),
    [orders.data],
  );
  const activeVouchers = useMemo(
    () => mockVouchers.filter((v) => v.status === "active").length,
    [],
  );

  if (me.isLoading) {
    return (
      <Screen edges={["top"]} background={colors.background}>
        <PageLoader />
      </Screen>
    );
  }

  if (me.isError) {
    return (
      <Screen edges={["top"]} background={colors.background}>
        <ErrorState onRetry={() => me.refetch()} />
      </Screen>
    );
  }

  const user = me.data;
  const name = user ? `${user.firstName} ${user.lastName}`.trim() : "Guest";
  const sym = currencySymbol("GEL");

  return (
    <Screen edges={["top"]} background={colors.background}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.topHeader}>
          <View style={styles.flex}>
            <Text variant="h1" style={styles.pageTitle}>
              Profile
            </Text>
            <View style={styles.subtitleRow}>
              <Text variant="bodySm" tone="secondary">
                Manage your account and impact
              </Text>
              <Feather name="feather" size={14} color={colors.primary} />
            </View>
          </View>
          <View style={styles.headerIcons}>
            <Pressable
              onPress={() => router.push("/notifications")}
              style={styles.iconBtn}
              accessibilityLabel="Notifications"
            >
              <Feather name="bell" size={22} color={colors.textPrimary} />
              {unread > 0 ? <View style={styles.notifDot} /> : null}
            </Pressable>
            <Pressable
              onPress={() => go("/profile/settings")}
              style={styles.iconBtn}
              accessibilityLabel="Settings"
            >
              <Feather name="settings" size={22} color={colors.textPrimary} />
            </Pressable>
          </View>
        </View>

        {/* User card */}
        <Pressable
          style={styles.userCard}
          onPress={() => go("/profile/account")}
        >
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Feather name="user" size={32} color={INK} />
            </View>
            <View style={styles.editBadge}>
              <Feather name="edit-2" size={12} color={INK} />
            </View>
          </View>
          <View style={styles.userText}>
            <Text variant="h3">{name}</Text>
            {user?.email ? (
              <Text variant="bodySm" tone="secondary">
                {user.email}
              </Text>
            ) : null}
            <View style={styles.ecoBadge}>
              <Feather name="feather" size={12} color={colors.primary} />
              <Text variant="caption" weight="semibold" tone="brand">
                Eco Saver
              </Text>
            </View>
          </View>
          <Feather name="chevron-right" size={22} color={colors.textTertiary} />
        </Pressable>

        {/* Impact */}
        {user ? (
          <LinearGradient colors={[INK, "#1A6B52"]} style={styles.impactCard}>
            <View style={styles.impactHead}>
              <Text variant="label" tone="inverse">
                Your rescue impact
              </Text>
              <View style={styles.yearPill}>
                <Text variant="caption" tone="inverse">
                  This year
                </Text>
                <Feather name="chevron-down" size={14} color={colors.white} />
              </View>
            </View>
            <View style={styles.impactStats}>
              <ImpactStat icon="shopping-bag" value={String(user.mealsRescued)} label="Meals saved" />
              <View style={styles.impactDivider} />
              <ImpactStat
                icon="dollar-sign"
                value={formatPrice(user.moneySaved, "GEL")}
                label="Money saved"
              />
              <View style={styles.impactDivider} />
              <ImpactStat
                icon="cloud"
                value={`${user.co2SavedKg.toFixed(1)} kg`}
                label="CO₂ avoided"
              />
              <View style={styles.impactDivider} />
              <ImpactStat
                icon="heart"
                value={String(storesSupported)}
                label="Stores supported"
              />
            </View>
          </LinearGradient>
        ) : null}

        {/* Menu */}
        <View style={styles.menuCard}>
          <MenuRow
            icon="bookmark"
            title="Favourites"
            subtitle="Your favourite stores"
            onPress={() => router.push("/(tabs)/favourites")}
          />
          <MenuRow
            icon="tag"
            title="Vouchers & rewards"
            subtitle="View your vouchers and rewards"
            badge={activeVouchers > 0 ? activeVouchers : undefined}
            onPress={() => go("/profile/vouchers")}
          />
          <MenuRow
            icon="credit-card"
            title="Payment methods"
            subtitle="Manage your cards and wallets"
            onPress={() => go("/profile/payments")}
          />
          <MenuRow
            icon="map-pin"
            title="Addresses"
            subtitle="Your pickup addresses"
            onPress={() => router.push("/location")}
          />
          <MenuRow
            icon="help-circle"
            title="Help & support"
            subtitle="FAQs and contact us"
            onPress={() => go("/profile/support")}
            last
          />
        </View>

        {/* Referral */}
        <View style={styles.referral}>
          <View style={styles.referralArt}>
            <Feather name="gift" size={28} color={INK} />
          </View>
          <View style={styles.flex}>
            <Text variant="label">Invite your friends</Text>
            <Text variant="bodySm" weight="semibold" style={{ color: INK }}>
              Give {sym}5.00, get {sym}5.00!
            </Text>
            <Text variant="caption" tone="secondary">
              They get a discount, you get a reward.
            </Text>
          </View>
          <Pressable
            style={styles.inviteBtn}
            onPress={() => go("/profile/invite")}
          >
            <Text variant="caption" weight="semibold" tone="inverse">
              Invite friends
            </Text>
          </Pressable>
        </View>

        {/* Legal */}
        <Pressable style={styles.legalRow} onPress={() => go("/profile/legal")}>
          <View style={styles.legalIcon}>
            <Feather name="shield" size={18} color={INK} />
          </View>
          <View style={styles.flex}>
            <Text variant="label">Legal</Text>
            <Text variant="caption" tone="secondary">
              Terms • Privacy • Cookies
            </Text>
          </View>
          <Feather name="chevron-right" size={20} color={colors.textTertiary} />
        </Pressable>

        {/* Sign out */}
        <Pressable
          style={styles.signOut}
          onPress={() => {
            signOut();
            router.replace("/auth");
          }}
        >
          <Feather name="log-out" size={18} color={INK} />
          <Text variant="label" style={{ color: INK }}>
            Sign out
          </Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

function ImpactStat({
  icon,
  value,
  label,
}: {
  icon: keyof typeof Feather.glyphMap;
  value: string;
  label: string;
}) {
  return (
    <View style={styles.impactStat}>
      <Feather name={icon} size={16} color="rgba(255,255,255,0.85)" />
      <Text variant="h3" tone="inverse" style={styles.impactValue}>
        {value}
      </Text>
      <Text variant="caption" tone="inverse" style={styles.impactLabel}>
        {label}
      </Text>
    </View>
  );
}

function MenuRow({
  icon,
  title,
  subtitle,
  badge,
  onPress,
  last,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle: string;
  badge?: number;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuRow,
        !last && styles.menuRowBorder,
        pressed && { backgroundColor: colors.backgroundAlt },
      ]}
    >
      <View style={styles.menuIcon}>
        <Feather name={icon} size={18} color={INK} />
      </View>
      <View style={styles.flex}>
        <Text variant="label">{title}</Text>
        <Text variant="caption" tone="secondary">
          {subtitle}
        </Text>
      </View>
      {badge ? (
        <View style={styles.menuBadge}>
          <Text variant="caption" weight="bold" tone="inverse">
            {badge}
          </Text>
        </View>
      ) : null}
      <Feather name="chevron-right" size={20} color={colors.textTertiary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.huge,
    gap: spacing.lg,
  },
  flex: { flex: 1 },

  topHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  pageTitle: { fontSize: 28, fontWeight: "800", color: colors.textPrimary },
  subtitleRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  headerIcons: { flexDirection: "row", gap: spacing.xs },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  notifDot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    borderWidth: 1.5,
    borderColor: colors.background,
  },

  userCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    ...shadow.soft,
  },
  avatarWrap: { position: "relative" },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  editBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  userText: { flex: 1, gap: 2 },
  ecoBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
    marginTop: 4,
    borderWidth: 1,
    borderColor: colors.primarySoft,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    backgroundColor: colors.surface,
  },

  impactCard: {
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  impactHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  yearPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  impactStats: { flexDirection: "row", alignItems: "stretch" },
  impactStat: { flex: 1, alignItems: "center", gap: 4, paddingHorizontal: 2 },
  impactValue: { fontSize: 18, lineHeight: 22 },
  impactLabel: { opacity: 0.9, textAlign: "center", fontSize: 10, lineHeight: 12 },
  impactDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.25)",
    marginVertical: 4,
  },

  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    overflow: "hidden",
    ...shadow.soft,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  menuRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  menuBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },

  referral: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.primarySoft,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  referralArt: {
    width: 52,
    height: 52,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  inviteBtn: {
    backgroundColor: INK,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },

  legalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    ...shadow.soft,
  },
  legalIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },

  signOut: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: INK,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    marginTop: spacing.xs,
  },
});
