import { useRef, useState } from "react";
import { Image, Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "@/theme";

/** Cap the content column so buttons/hero don't stretch on tablets & web. */
const MAX_CONTENT_WIDTH = 480;
import { authAssets, authColors } from "@/assets/auth";
import { Text } from "@/components/ui";
import { AuthOptionButton } from "@/components/auth/AuthOptionButton";
import { TermsConsentSheet } from "@/components/TermsConsentSheet";
import { useAuthStore } from "@/store/authStore";

export default function AuthLanding() {
  const router = useRouter();
  const signIn = useAuthStore((s) => s.signIn);
  const continueAsGuest = useAuthStore((s) => s.continueAsGuest);
  const [loading, setLoading] = useState<string | null>(null);
  const [termsVisible, setTermsVisible] = useState(false);
  const [termsDone, setTermsDone] = useState(false);
  const [showOther, setShowOther] = useState(false);
  const pendingAction = useRef<(() => void) | null>(null);

  const { width, height } = useWindowDimensions();
  const scale = Math.min(Math.max(width / 375, 0.9), 1.2);
  const compact = height < 700;
  const headlineSize = Math.round(24 * scale);
  const logoSize = Math.round(58 * scale);
  const waveClearance = compact ? 54 : 72;

  const goNext = () => router.replace("/onboarding");

  const withTerms = (action: () => void) => {
    if (termsDone) {
      action();
      return;
    }
    pendingAction.current = action;
    setTermsVisible(true);
  };

  const onTermsAccepted = () => {
    setTermsDone(true);
    setTermsVisible(false);
    const action = pendingAction.current;
    pendingAction.current = null;
    action?.();
  };

  const socialSignIn = (provider: string) => {
    setLoading(provider);
    setTimeout(() => {
      signIn(`tok_${provider}_${Date.now()}`, "cust_001");
      setLoading(null);
      goNext();
    }, 800);
  };

  const browseAsGuest = () => {
    continueAsGuest();
    goNext();
  };

  return (
    <View style={styles.root}>
      <SafeAreaView edges={["top"]} style={styles.top}>
        <Image source={authAssets.dots} style={styles.dotsRight} resizeMode="contain" />
        <Image source={authAssets.dots} style={styles.dotsLeft} resizeMode="contain" />

        <View style={styles.topInner}>
          <View style={[styles.header, { marginTop: compact ? spacing.sm : spacing.lg }]}>
            <Image
              source={authAssets.logo}
              style={{ width: logoSize, height: logoSize }}
              resizeMode="contain"
            />
            <Text
              weight="bold"
              center
              style={[styles.headline, { fontSize: headlineSize, lineHeight: headlineSize + 4 }]}
            >
              LET'S GET STARTED{"\n"}SAVING FOOD
            </Text>
          </View>

          <Image source={authAssets.hero} style={styles.hero} resizeMode="contain" />
        </View>
      </SafeAreaView>

      <View style={styles.footer}>
        <Image source={authAssets.wave} style={styles.wave} resizeMode="stretch" />
        <SafeAreaView edges={["bottom"]} style={[styles.footerInner, { paddingTop: waveClearance }]}>
          <View style={styles.buttons}>
            <AuthOptionButton
              variant="google"
              label="Continue with Google"
              loading={loading === "google"}
              onPress={() => withTerms(() => socialSignIn("google"))}
            />
            <AuthOptionButton
              variant="facebook"
              label="Continue with Facebook"
              loading={loading === "facebook"}
              onPress={() => withTerms(() => socialSignIn("facebook"))}
            />
            <AuthOptionButton
              variant="email"
              label="Continue with email"
              loading={loading === "email"}
              onPress={() => withTerms(() => router.push("/auth/email"))}
            />
          </View>

          <Pressable onPress={() => setShowOther((v) => !v)} style={styles.otherRow}>
            <View style={styles.otherLine} />
            <Text variant="bodySm" weight="semibold" style={styles.otherLabel}>
              {showOther ? "Less" : "Other"}
            </Text>
            <View style={styles.otherLine} />
          </Pressable>

          {showOther ? (
            <View style={styles.otherOptions}>
              <AuthLink
                label="Continue with Apple"
                onPress={() => withTerms(() => socialSignIn("apple"))}
              />
              <AuthLink label="Browse as guest" onPress={() => withTerms(browseAsGuest)} />
            </View>
          ) : null}

          <Text variant="caption" center style={styles.legal}>
            By continuing you agree to our{" "}
            <Text
              variant="caption"
              style={styles.legalLink}
              onPress={() => router.push("/legal/terms")}
              accessibilityRole="link"
            >
              Terms
            </Text>
            {" and "}
            <Text
              variant="caption"
              style={styles.legalLink}
              onPress={() => router.push("/legal/privacy")}
              accessibilityRole="link"
            >
              Privacy Policy
            </Text>
            .
          </Text>
        </SafeAreaView>
      </View>

      <TermsConsentSheet
        visible={termsVisible}
        onClose={() => {
          pendingAction.current = null;
          setTermsVisible(false);
        }}
        onAccepted={onTermsAccepted}
      />
    </View>
  );
}

function AuthLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} accessibilityRole="button">
      <Text variant="bodySm" weight="semibold" style={styles.otherLink}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  top: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  topInner: {
    flex: 1,
    width: "100%",
    maxWidth: MAX_CONTENT_WIDTH,
    alignItems: "center",
  },
  dotsRight: {
    position: "absolute",
    top: spacing.huge,
    right: spacing.xl,
    width: 60,
    height: 44,
    opacity: 0.9,
  },
  dotsLeft: {
    position: "absolute",
    top: "34%",
    left: spacing.lg,
    width: 48,
    height: 36,
    opacity: 0.85,
  },
  header: { alignItems: "center", gap: spacing.sm },
  headline: {
    color: authColors.headline,
    letterSpacing: 0.5,
  },
  hero: {
    flex: 1,
    width: "100%",
    marginTop: spacing.sm,
  },
  footer: { backgroundColor: colors.white },
  wave: {
    position: "absolute",
    top: -36,
    left: 0,
    right: 0,
    bottom: 0,
  },
  footerInner: {
    width: "100%",
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: "center",
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  buttons: { gap: spacing.md },
  otherRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  otherLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.25)" },
  otherLabel: { color: "rgba(255,255,255,0.7)" },
  otherOptions: { alignItems: "center", gap: spacing.sm },
  otherLink: { color: colors.white },
  legal: { color: "rgba(255,255,255,0.55)", marginTop: spacing.xs },
  legalLink: {
    color: colors.white,
    textDecorationLine: "underline",
    fontWeight: "600",
  },
});
