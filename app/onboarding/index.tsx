import { useEffect, useRef } from "react";
import { Animated, Image, Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { colors, radii, shadow, spacing } from "@/theme";
import { Screen, Text } from "@/components/ui";
import { authAssets } from "@/assets/auth";
import { triggerAdvanceFeedback } from "@/utils/actionFeedback";

const PALETTE = {
  bg: "#FFFFFF",
  primaryGreen: "#0E6B50",
  accentGreen: "#7CCB3D",
  textPrimary: "#143A2D",
  textSecondary: "#666666",
  inactive: "#D9D9D9",
} as const;

/** Single onboarding screen (TGTG-inspired, premium, minimal). */
export default function OnboardingIntro() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const contentW = Math.min(width, 520);
  const compact = height < 740;

  const floatY = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 420,
      useNativeDriver: true,
    }).start();

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, { toValue: -6, duration: 600, useNativeDriver: true }),
        Animated.timing(floatY, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [fadeIn, floatY]);

  return (
    <Screen edges={["top", "bottom"]} background={PALETTE.bg}>
      <View style={styles.bgDecor} pointerEvents="none">
        <View style={[styles.blob, styles.blobA]} />
        <View style={[styles.blob, styles.blobB]} />
        <View style={[styles.blob, styles.blobC]} />
      </View>

      <View style={[styles.inner, { width: contentW }]}>
        <View style={[styles.badgeRow, compact && { marginTop: spacing.sm }]}>
          <View style={styles.badge}>
            <Image source={authAssets.logo} style={styles.badgeLogo} resizeMode="contain" />
          </View>
        </View>

        <Animated.View style={[styles.copy, { opacity: fadeIn }]}>
          <Text style={styles.title}>
            <Text style={styles.titlePrimary}>Get ready{"\n"}for a </Text>
            <Text style={styles.titleAccent}>surprise</Text>
          </Text>
          <View style={styles.underline} />
          <Text style={styles.subtitle}>
            Stores can't know exactly what will be left at the end of the day, so what you get in
            your Surprise Bag is always a surprise.
          </Text>
        </Animated.View>

        <Animated.View style={[styles.heroWrap, { transform: [{ translateY: floatY }] }]}>
          <Image source={authAssets.hero} resizeMode="contain" style={styles.heroImg} />
        </Animated.View>
      </View>

      <View style={[styles.footer, { width: contentW }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Next"
          onPress={() => {
            triggerAdvanceFeedback();
            router.push("/onboarding/motivation");
          }}
          style={({ pressed }) => [
            styles.nextBtn,
            pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
          ]}
        >
          <Text style={styles.nextLabel}>Next</Text>
          <Feather name="arrow-right" size={22} color={colors.white} style={styles.nextArrow} />
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  bgDecor: { ...StyleSheet.absoluteFill },
  blob: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: radii.pill,
    backgroundColor: "#7CCB3D",
    opacity: 0.08,
  },
  blobA: { top: -90, right: -120 },
  blobB: { top: 120, left: -140, backgroundColor: "#0E6B50", opacity: 0.06 },
  blobC: { bottom: 140, right: -160, width: 320, height: 320, backgroundColor: "#7CCB3D", opacity: 0.06 },
  inner: { flex: 1, alignSelf: "center", paddingHorizontal: spacing.xl, paddingTop: spacing.md },
  badgeRow: { flexDirection: "row", marginTop: spacing.md },
  badge: {
    width: 52,
    height: 52,
    borderRadius: radii.pill,
    backgroundColor: "rgba(124,203,61,0.18)",
    alignItems: "center",
    justifyContent: "center",
    ...shadow.soft,
  },
  badgeLogo: { width: 26, height: 26, tintColor: PALETTE.primaryGreen },
  copy: { gap: spacing.sm, marginTop: spacing.lg },
  title: { fontSize: 38, lineHeight: 42 },
  titlePrimary: { color: PALETTE.textPrimary, fontWeight: "800" },
  titleAccent: { color: PALETTE.accentGreen, fontWeight: "900", textTransform: "capitalize" },
  underline: {
    height: 6,
    width: 116,
    borderRadius: radii.pill,
    backgroundColor: "rgba(124,203,61,0.35)",
    marginTop: -spacing.sm,
    marginLeft: 4,
  },
  subtitle: {
    color: PALETTE.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 320,
  },
  heroWrap: { flex: 1, alignItems: "center", justifyContent: "flex-end" },
  heroImg: { width: "100%", height: 360 },
  footer: { alignSelf: "center", padding: spacing.xl },
  nextBtn: {
    height: 58,
    borderRadius: 30,
    backgroundColor: PALETTE.primaryGreen,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.card,
  },
  nextLabel: { color: colors.white, fontSize: 16, fontWeight: "700" },
  nextArrow: { position: "absolute", right: spacing.xl },
});
