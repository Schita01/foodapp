import { useState } from "react";
import { View } from "react-native";
import { spacing } from "@/theme";
import { BottomSheet, Text, PrimaryButton, SecondaryButton, TextButton, SettingsToggle, Divider } from "./ui";
import type { CookiePrefs } from "@/store/onboardingStore";

export function CookieConsentSheet({
  visible,
  onClose,
  initial,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  initial?: CookiePrefs | null;
  onSave: (prefs: CookiePrefs) => void;
}) {
  const [analytics, setAnalytics] = useState(initial?.analytics ?? true);
  const [personalization, setPersonalization] = useState(initial?.personalization ?? true);
  const [marketing, setMarketing] = useState(initial?.marketing ?? false);

  const save = (a: boolean, p: boolean, m: boolean) => {
    onSave({ required: true, analytics: a, personalization: p, marketing: m });
    onClose();
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Cookie preferences"
      footer={
        <>
          <PrimaryButton label="Accept all" onPress={() => save(true, true, true)} />
          <SecondaryButton
            label="Save choices"
            onPress={() => save(analytics, personalization, marketing)}
          />
          <TextButton label="Reject optional" onPress={() => save(false, false, false)} />
        </>
      }
    >
      <Text variant="body" tone="secondary">
        We use required cookies to run RescueBite. Optional cookies help us improve the app and show
        relevant content. You can change these anytime in Profile - Legal.
      </Text>
      <View style={{ marginTop: spacing.md }}>
        <SettingsToggle
          label="Required cookies"
          description="Always on - needed for the app to work."
          value
          onValueChange={() => {}}
          disabled
        />
        <Divider />
        <SettingsToggle
          label="Analytics cookies"
          description="Help us understand how the app is used."
          value={analytics}
          onValueChange={setAnalytics}
        />
        <Divider />
        <SettingsToggle
          label="Personalization cookies"
          description="Tailor listings and recommendations."
          value={personalization}
          onValueChange={setPersonalization}
        />
        <Divider />
        <SettingsToggle
          label="Marketing cookies"
          description="Show relevant promotions."
          value={marketing}
          onValueChange={setMarketing}
        />
      </View>
    </BottomSheet>
  );
}
