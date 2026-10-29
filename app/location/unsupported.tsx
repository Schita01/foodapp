import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { spacing } from "@/theme";
import { Screen, Text, PrimaryButton, SecondaryButton } from "@/components/ui";

export default function UnsupportedCityScreen() {
  const router = useRouter();

  return (
    <Screen edges={["top", "bottom"]}>
      <View style={styles.content}>
        <Text variant="h1">Not in your city yet</Text>
        <Text variant="body" tone="secondary">
          RescueBite is rolling out city by city. We are not live in this area yet, but you can
          pick a supported city or get notified when we launch nearby.
        </Text>
        <PrimaryButton label="Choose another city" onPress={() => router.replace("/location/manual")} />
        <SecondaryButton label="Back to area selection" onPress={() => router.replace("/location")} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, padding: spacing.xl, gap: spacing.lg, justifyContent: "center" },
});
