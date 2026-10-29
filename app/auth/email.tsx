import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { spacing } from "@/theme";
import { Screen, Text, PrimaryButton, TextField, ScreenHeader } from "@/components/ui";
import { authApi, ApiError } from "@/services";
import { useAuthStore } from "@/store/authStore";

export default function EmailScreen() {
  const router = useRouter();
  const setPendingEmail = useAuthStore((s) => s.setPendingEmail);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onContinue = async () => {
    setError(null);
    if (!email.trim()) {
      setError("Enter your email address.");
      return;
    }
    setLoading(true);
    try {
      await authApi.emailStart(email.trim());
      setPendingEmail(email.trim());
      router.push("/auth/check-email");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen edges={["top", "bottom"]}>
      <ScreenHeader title="Sign in" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <View style={styles.content}>
          <Text variant="title">What's your email?</Text>
          <Text variant="body" tone="secondary">
            We'll send you a 6-digit code to sign in or create your account.
          </Text>
          <TextField
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            error={error ?? undefined}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            autoFocus
            style={styles.input}
          />
          <Text variant="caption" tone="tertiary">
            Tip: use an email containing "new" to try the sign-up path, or "blocked" to see the
            blocked-account state.
          </Text>
        </View>
        <View style={styles.footer}>
          <PrimaryButton label="Continue" loading={loading} onPress={onContinue} advanceFeedback />
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
