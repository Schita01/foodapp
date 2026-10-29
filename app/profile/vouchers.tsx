import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, radii, shadow, spacing } from "@/theme";
import {
  BottomSheet,
  IconButton,
  PrimaryButton,
  Screen,
  ScreenHeader,
  StatusBadge,
  Text,
  TextField,
} from "@/components/ui";
import { mockVouchers } from "@/mock/data";
import { useVoucherWalletStore } from "@/store/voucherWalletStore";
import { formatDate, formatPrice } from "@/utils/format";
import type { Voucher } from "@/types";

const HOW = [
  {
    icon: "shopping-bag" as const,
    title: "Eligible Surprise Bags",
    body: "Some stores offer Special Rewards with their Surprise Bags. You’ll see a “Special Reward” tag on these.",
  },
  {
    icon: "gift" as const,
    title: "Surprise gifts from stores",
    body: "Special Rewards are well-earned gifts from our partners.",
  },
  {
    icon: "percent" as const,
    title: "Free product or discount",
    body: "A Special Reward can be a free product or an in-store discount.",
  },
  {
    icon: "map-pin" as const,
    title: "Redeem in-store",
    body: "Show your Special Reward in-store to redeem it. Some Special Rewards have conditions, so be sure to check the details.",
  },
  {
    icon: "clock" as const,
    title: "Expiration",
    body: "Special Rewards expire, so use them before they’re gone.",
  },
];

export default function VouchersScreen() {
  const extras = useVoucherWalletStore((s) => s.extras);
  const redeem = useVoucherWalletStore((s) => s.redeem);
  const [tab, setTab] = useState<"rewards" | "discounts">("rewards");
  const [addOpen, setAddOpen] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const discounts = useMemo(() => {
    const all = [...extras, ...mockVouchers];
    const seen = new Set<string>();
    return all.filter((v) => {
      if (seen.has(v.code)) return false;
      seen.add(v.code);
      return true;
    });
  }, [extras]);

  const submit = () => {
    const result = redeem(code);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setCode("");
    setError(null);
    setAddOpen(false);
    setTab("discounts");
  };

  return (
    <Screen edges={["top"]}>
      <ScreenHeader
        title="Vouchers"
        right={
          <IconButton
            icon="plus"
            accessibilityLabel="Add a voucher"
            onPress={() => setAddOpen(true)}
            background={colors.primaryDark}
            color={colors.white}
          />
        }
      />
      <View style={styles.tabs}>
        <Tab label="Special Rewards" active={tab === "rewards"} onPress={() => setTab("rewards")} />
        <Tab label="Discounts" active={tab === "discounts"} onPress={() => setTab("discounts")} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {tab === "rewards" ? (
          <>
            <Text variant="h3" style={styles.howTitle}>
              How it works
            </Text>
            {HOW.map((item) => (
              <View key={item.title} style={styles.howRow}>
                <View style={styles.howIcon}>
                  <Feather name={item.icon} size={18} color={colors.primaryDark} />
                </View>
                <View style={styles.flex}>
                  <Text variant="label">{item.title}</Text>
                  <Text variant="bodySm" tone="secondary">
                    {item.body}
                  </Text>
                </View>
              </View>
            ))}
            <View style={styles.emptyHero}>
              <View style={styles.emptyArt}>
                <Feather name="gift" size={42} color={colors.primaryDark} />
              </View>
              <Text variant="h2" center>
                NO SPECIAL REWARDS YET
              </Text>
              <Text variant="body" tone="secondary" center>
                Collect eligible Surprise Bags to unlock Special Rewards. Once unlocked, they appear here.
              </Text>
            </View>
          </>
        ) : discounts.length === 0 ? (
          <Text variant="body" tone="secondary">
            No discount codes yet. Tap + to add one.
          </Text>
        ) : (
          discounts.map((v) => <VoucherCard key={v.voucherId} voucher={v} />)
        )}
      </ScrollView>

      <BottomSheet
        visible={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add a new voucher"
        closeInCircle
        footer={
          <PrimaryButton label="Add" onPress={submit} disabled={!code.trim()} />
        }
      >
        <TextField
          placeholder="Enter your voucher code"
          value={code}
          autoCapitalize="characters"
          onChangeText={(t) => {
            setCode(t);
            setError(null);
          }}
        />
        {error ? (
          <Text variant="bodySm" tone="error" style={styles.err}>
            {error}
          </Text>
        ) : (
          <Text variant="caption" tone="secondary" style={styles.err}>
            Try WELCOME5, FRIEND5 or SAVE10.
          </Text>
        )}
      </BottomSheet>
    </Screen>
  );
}

function Tab({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      style={[styles.tab, active && styles.tabActive]}
    >
      <Text variant="bodySm" weight="semibold" style={{ color: active ? colors.primaryDark : colors.textSecondary }}>
        {label}
      </Text>
    </Pressable>
  );
}

function VoucherCard({ voucher }: { voucher: Voucher }) {
  const tone =
    voucher.status === "active" ? "success" : voucher.status === "used" ? "neutral" : "warning";
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text variant="h3">{voucher.code}</Text>
        <StatusBadge label={voucher.status} tone={tone} />
      </View>
      <Text variant="body" tone="secondary">
        {voucher.description}
      </Text>
      <Text variant="label">{formatPrice(voucher.amount, voucher.currency)} off</Text>
      <Text variant="caption" tone="tertiary">
        Expires {formatDate(voucher.expiresAt)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: "row",
    marginHorizontal: spacing.lg,
    backgroundColor: colors.backgroundAlt,
    borderRadius: radii.pill,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    height: 36,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: { backgroundColor: colors.surface, ...shadow.soft },
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.huge },
  howTitle: { marginBottom: spacing.xs },
  howRow: { flexDirection: "row", gap: spacing.md, alignItems: "flex-start" },
  howIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  flex: { flex: 1, gap: 2 },
  emptyHero: {
    marginTop: spacing.lg,
    backgroundColor: colors.primarySoft,
    borderRadius: radii.cardLg,
    padding: spacing.xxl,
    alignItems: "center",
    gap: spacing.md,
  },
  emptyArt: {
    width: 88,
    height: 88,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.lg,
    gap: spacing.xs,
    ...shadow.soft,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  err: { marginTop: spacing.sm },
});
