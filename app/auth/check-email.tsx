import { useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { colors, spacing } from "@/theme";
import { Screen, Text, PrimaryButton, TextField, ScreenHeader } from "@/components/ui";
import { authApi, ApiError, MOCK_OTP } from "@/services";
import { useAuthStore } from "@/store/authStore";

const MAX_ATTEMPTS = 5;

export default function CheckEmailScreen() {
  const router = useRouter();
  const email = useAuthStore((s) => s.pendingEmail) ?? "";
  const signIn = useAuthStore((s) => s.signIn);
  const setPendingEmail = useAuthStore((s) => s.setPendingEmail);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const attempts = useRef(0);

  const onVerify = async () => {
    setError(null);
    if (!email) {
      router.replace("/auth/email");
      return;
    }
    if (code.trim().length < 6) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.emailVerify(email, code.trim());
      if (res.accountStatus === "blocked") {
        setError("This account cannot be used right now.");
        return;
      }
      signIn(res.token, res.customerId);
      setPendingEmail(null);
      router.replace("/onboarding");
    } catch (e) {
      attempts.current += 1;
      if (attempts.current >= MAX_ATTEMPTS) {
        setError("Too many attempts. Request a new code.");
      } else {
        setError(e instanceof ApiError ? e.message : "Could not verify. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    if (!email || resendIn > 0) return;
    setError(null);
    try {
      const res = await authApi.emailStart(email);
      setResendIn(res.resendInSec);
      const tick = setInterval(() => {
        setResendIn((s) => {
          if (s <= 1) {
            clearInterval(tick);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not resend code.");
    }
  };

  return (
    <Screen edges={["top", "bottom"]}>
      <ScreenHeader title="Check your email" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <View style={styles.content}>
          <Text variant="title">Enter your code</Text>
          <Text variant="body" tone="secondary">
            We sent a 6-digit code to {email || "your email"}. It may take a minute to arrive.
          </Text>
          <TextField
            label="Code"
            placeholder="123456"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
            error={error ?? undefined}
            autoFocus
            style={styles.input}
          />
          <Text variant="caption" tone="tertiary">
            Demo code: {MOCK_OTP}
          </Text>
          <Pressable onPress={onResend} disabled={resendIn > 0} accessibilityRole="button">
            <Text variant="label" tone={resendIn > 0 ? "tertiary" : "brand"}>
              {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
            </Text>
          </Pressable>
        </View>
        <View style={styles.footer}>
          <PrimaryButton label="Verify" loading={loading} onPress={onVerify} advanceFeedback />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flex: 1, paddingHorizontal: spacing.lg, gap: spacing.md, paddingTop: spacing.lg },
  input: { marginTop: spacing.sm },
  footer: { padding: spacing.xl },
});
