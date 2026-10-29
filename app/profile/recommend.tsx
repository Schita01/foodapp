import { useState } from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { spacing } from "@/theme";
import { PrimaryButton, Screen, ScreenHeader, Text, TextField } from "@/components/ui";

export default function RecommendStoreScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [note, setNote] = useState("");

  const submit = () => {
    Alert.alert(
      "Thanks for the tip",
      `We’ll reach out to ${name.trim()} in ${city.trim() || "your city"} about joining RescueBite.`,
      [{ text: "OK", onPress: () => router.back() }],
    );
  };

  return (
    <Screen edges={["top", "bottom"]}>
      <ScreenHeader title="Recommend a store" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text variant="body" tone="secondary">
          Know a bakery, restaurant or grocery that has surplus food? Tell us and we’ll invite them to the app.
        </Text>
        <TextField label="Store name" placeholder="e.g. Maison Patisserie" value={name} onChangeText={setName} />
        <TextField label="City" placeholder="Tbilisi" value={city} onChangeText={setCity} />
        <TextField
          label="Anything else?"
          placeholder="Address, contact, or why they’d be a great fit"
          multiline
          value={note}
          onChangeText={setNote}
        />
      </ScrollView>
      <PrimaryButton
        label="Send recommendation"
        disabled={!name.trim()}
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
