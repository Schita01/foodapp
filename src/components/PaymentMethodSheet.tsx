import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, radii, spacing } from "@/theme";
import {
  BottomSheet,
  Text,
  PrimaryButton,
  SecondaryButton,
  TextField,
  Checkbox,
} from "./ui";
import { useCards, useAddCard } from "@/hooks/usePayments";

export type SelectedMethod =
  | { kind: "google_pay"; label: string }
  | { kind: "apple_pay"; label: string }
  | { kind: "paypal"; label: string }
  | { kind: "card"; cardId: string; label: string };

type WalletKind = Extract<SelectedMethod, { kind: "google_pay" | "apple_pay" | "paypal" }>;

const WALLETS: WalletKind[] = [
  { kind: "google_pay", label: "Google Pay" },
  { kind: "apple_pay", label: "Apple Pay" },
  { kind: "paypal", label: "PayPal" },
];

export function PaymentMethodSheet({
  visible,
  onClose,
  selected,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  selected: SelectedMethod | null;
  onSelect: (m: SelectedMethod) => void;
}) {
  const { data: cards } = useCards();
  const addCard = useAddCard();
  const [adding, setAdding] = useState(false);
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [name, setName] = useState("");
  const [saveCard, setSaveCard] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isSel = (m: SelectedMethod) => {
    if (!selected || selected.kind !== m.kind) return false;
    if (m.kind === "card" && selected.kind === "card") return selected.cardId === m.cardId;
    return true;
  };

  const submitCard = async () => {
    setError(null);
    if (number.replace(/\s/g, "").length < 12 || !expiry || cvc.length < 3) {
      setError("Please check your card details.");
      return;
    }
    try {
      const card = await addCard.mutateAsync({ number, expiry, name, setDefault: saveCard });
      onSelect({ kind: "card", cardId: card.cardId, label: `${card.brand} •••• ${card.last4}` });
      setAdding(false);
      setNumber("");
      setExpiry("");
      setCvc("");
      setName("");
      onClose();
    } catch {
      setError("Couldn't add your card. Please try again.");
    }
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Select a payment method"
      closeInCircle
      footer={
        adding ? (
          <>
            <PrimaryButton label="Add card" loading={addCard.isPending} onPress={() => void submitCard()} />
            <SecondaryButton label="Cancel" onPress={() => setAdding(false)} />
          </>
        ) : undefined
      }
    >
      {adding ? (
        <View style={styles.form}>
          <TextField
            label="Card number"
            placeholder="1234 5678 9012 3456"
            keyboardType="number-pad"
            value={number}
            onChangeText={setNumber}
          />
          <View style={styles.row}>
            <View style={styles.flex}>
              <TextField label="Expiry" placeholder="MM/YY" value={expiry} onChangeText={setExpiry} />
            </View>
            <View style={styles.flex}>
              <TextField
                label="CVC"
                placeholder="123"
                keyboardType="number-pad"
                value={cvc}
                onChangeText={setCvc}
                maxLength={4}
              />
            </View>
          </View>
          <TextField label="Name on card" placeholder="Full name" value={name} onChangeText={setName} />
          <Checkbox checked={saveCard} onToggle={() => setSaveCard(!saveCard)} label="Save card for future rescues" />
          {error ? (
            <Text variant="bodySm" tone="error">
              {error}
            </Text>
          ) : null}
        </View>
      ) : (
        <View style={styles.list}>
          <Text variant="caption" weight="semibold" tone="tertiary" style={styles.section}>
            PAYMENT METHODS
          </Text>
          <MethodRow
            icon="credit-card"
            label="Payment card"
            onPress={() => setAdding(true)}
          />
          {(cards ?? []).map((c) => (
            <MethodRow
              key={c.cardId}
              icon="credit-card"
              label={`${c.brand.toUpperCase()} •••• ${c.last4}`}
              selected={isSel({ kind: "card", cardId: c.cardId, label: "" })}
              onPress={() => {
                onSelect({ kind: "card", cardId: c.cardId, label: `${c.brand} •••• ${c.last4}` });
                onClose();
              }}
            />
          ))}
          {WALLETS.map((w) => (
            <MethodRow
              key={w.kind}
              icon={w.kind === "paypal" ? "send" : "smartphone"}
              label={w.label}
              selected={isSel(w)}
              onPress={() => {
                onSelect(w);
                onClose();
              }}
            />
          ))}
        </View>
      )}
    </BottomSheet>
  );
}

function MethodRow({
  icon,
  label,
  selected,
  onPress,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  selected?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.method, pressed && { backgroundColor: colors.backgroundAlt }]}
    >
      <View style={styles.methodIcon}>
        <Feather name={icon} size={18} color={colors.textPrimary} />
      </View>
      <Text variant="body" style={styles.flex}>
        {label}
      </Text>
      {selected ? <Feather name="check" size={18} color={colors.primaryDark} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  list: { gap: 2 },
  section: { letterSpacing: 0.6, marginBottom: spacing.sm },
  form: { gap: spacing.md },
  row: { flexDirection: "row", gap: spacing.md },
  flex: { flex: 1 },
  method: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.backgroundAlt,
    alignItems: "center",
    justifyContent: "center",
  },
});
