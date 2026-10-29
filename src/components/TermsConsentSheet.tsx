import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { colors, radii, shadow, spacing } from "@/theme";
import { BottomSheet, Text } from "./ui";
import { useOnboardingStore } from "@/store/onboardingStore";
import { triggerAdvanceFeedback } from "@/utils/actionFeedback";

const COUNTRIES = ["Georgia", "Germany", "United States", "United Kingdom", "France", "Spain"];

/** Brand palette: lime fills + ink-green text/links (see theme tokens). */
const LIME = colors.brandLime; // buttons & checkbox fills
const INK = colors.brandInk; // links + text/icons on lime
const CHECK_BORDER = "#BFD3CA"; // unchecked checkbox border
const SELECT_BORDER = "#E4E9E5"; // country field / list border
const DISABLED_BG = "#E5E9E6"; // disabled Continue background
const DISABLED_FG = "#9BA6A0"; // disabled Continue text/arrow

/**
 * Terms & privacy consent presented as an in-place modal on the Auth/Register
 * screen. The user picks a country and agrees to the terms here, then
 * `onAccepted` continues the registration/onboarding flow.
 */
export function TermsConsentSheet({
  visible,
  onClose,
  onAccepted,
}: {
  visible: boolean;
  onClose: () => void;
  onAccepted: () => void;
}) {
  const router = useRouter();
  const acceptTerms = useOnboardingStore((s) => s.acceptTerms);
  const setCookiePrefs = useOnboardingStore((s) => s.setCookiePrefs);
  const setMarketingOptIn = useOnboardingStore((s) => s.setMarketingOptIn);

  const [country, setCountry] = useState("");
  const [countryOpen, setCountryOpen] = useState(false);
  const [dataConsent, setDataConsent] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const canContinue = !!country && dataConsent && agreeTerms;

  const openDoc = (doc: "terms" | "privacy") => router.push(`/legal/${doc}`);

  const onContinue = () => {
    if (!canContinue) return;
    triggerAdvanceFeedback();
    setMarketingOptIn(dataConsent);
    setCookiePrefs({ required: true, analytics: true, personalization: true, marketing: dataConsent });
    acceptTerms();
    onAccepted();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text variant="h2" style={styles.heading}>
        Choose your country
      </Text>

      <Pressable
        style={styles.select}
        onPress={() => setCountryOpen((v) => !v)}
        accessibilityRole="button"
        accessibilityLabel="Select country"
      >
        <Feather name="map-pin" size={18} color={colors.textSecondary} />
        <Text variant="body" tone={country ? "primary" : "tertiary"} style={styles.flex}>
          {country || "Select country"}
        </Text>
        <Feather name={countryOpen ? "chevron-up" : "chevron-down"} size={20} color={colors.textSecondary} />
      </Pressable>

      {countryOpen ? (
        <View style={styles.countryList}>
          {COUNTRIES.map((c) => (
            <Pressable
              key={c}
              style={styles.countryRow}
              onPress={() => {
                setCountry(c);
                setCountryOpen(false);
              }}
            >
              <Text variant="body">{c}</Text>
              {c === country ? <Feather name="check" size={20} color={colors.primary} /> : null}
            </Pressable>
          ))}
        </View>
      ) : null}

      <View style={styles.checks}>
        <CheckRow checked={dataConsent} onToggle={() => setDataConsent((v) => !v)}>
          <Text variant="bodySm" style={styles.checkText}>
            I allow RescueBite to store my email address and name according to our{" "}
            <Text style={styles.link} onPress={() => openDoc("privacy")}>
              privacy policy
            </Text>
            .
          </Text>
        </CheckRow>

        <CheckRow checked={agreeTerms} onToggle={() => setAgreeTerms((v) => !v)}>
          <Text variant="bodySm" style={styles.checkText}>
            I agree with the{" "}
            <Text style={styles.link} onPress={() => openDoc("terms")}>
              terms &amp; conditions
            </Text>{" "}
            and the{" "}
            <Text style={styles.link} onPress={() => openDoc("privacy")}>
              privacy policy
            </Text>
            .
          </Text>
        </CheckRow>
      </View>

      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Continue"
          accessibilityState={{ disabled: !canContinue }}
          disabled={!canContinue}
          onPress={onContinue}
          style={({ pressed }) => [
            styles.continue,
            { backgroundColor: canContinue ? LIME : DISABLED_BG },
            pressed && canContinue && styles.continuePressed,
          ]}
        >
          <Text variant="label" weight="semibold" style={{ color: canContinue ? INK : DISABLED_FG }}>
            Continue
          </Text>
          <Feather
            name="arrow-right"
            size={20}
            color={canContinue ? INK : DISABLED_FG}
            style={styles.continueArrow}
          />
        </Pressable>
      </View>
    </BottomSheet>
  );
}

function CheckRow({
  checked,
  onToggle,
  children,
}: {
  checked: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={onToggle}
      style={styles.checkRow}
    >
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked ? <Feather name="check" size={14} color={INK} /> : null}
      </View>
      <View style={styles.flex}>{children}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  heading: { marginBottom: spacing.md },
  flex: { flex: 1 },
  select: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: SELECT_BORDER,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 56,
    ...shadow.soft,
  },
  countryList: {
    borderWidth: 1,
    borderColor: SELECT_BORDER,
    borderRadius: radii.md,
    marginTop: spacing.xs,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  countryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  checks: { marginTop: spacing.xl, gap: spacing.md },
  checkRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md },
  box: {
    width: 24,
    height: 24,
    borderRadius: radii.sm,
    borderWidth: 2,
    borderColor: CHECK_BORDER,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  boxChecked: { backgroundColor: LIME, borderColor: LIME },
  checkText: { lineHeight: 20, color: colors.textPrimary },
  link: { color: INK, fontWeight: "600", textDecorationLine: "underline" },
  footer: { marginTop: spacing.xxl },
  continue: {
    minHeight: 56,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  continuePressed: { opacity: 0.9 },
  continueArrow: { position: "absolute", right: spacing.xl },
});
