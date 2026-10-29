import { useState } from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { spacing } from "@/theme";
import { PrimaryButton, Screen, ScreenHeader, Text, TextField } from "@/components/ui";

export default function SignUpBusinessScreen() {
  const router = useRouter();
  const [business, setBusiness] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");

  const submit = () => {
    Alert.alert(
      "Application received",
      "A partner specialist will email you about listing Surprise Bags on RescueBite.",
      [{ text: "OK", onPress: () => router.back() }],
    );
  };

  return (
    <Screen edges={["top", "bottom"]}>
      <ScreenHeader title="Sign up your food business" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text variant="h3">Turn surplus into impact</Text>
        <Text variant="body" tone="secondary">
          Bakeries, restaurants and grocers use RescueBite to sell leftover food at the end of the day instead of throwing it away.
        </Text>
        <TextField label="Business name" value={business} onChangeText={setBusiness} />
        <TextField
          label="Work email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <TextField label="City" value={city} onChangeText={setCity} placeholder="Tbilisi" />
      </ScrollView>
      <PrimaryButton
        label="Request a partner account"
        disabled={!business.trim() || !email.trim()}
        onPress={submit}
        style={styles.cta}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  cta: { margin: spacing.lg },
});
