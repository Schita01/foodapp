import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { spacing } from "@/theme";
import { Screen, ScreenHeader } from "@/components/ui";
import { SettingsGroup, SettingsRow } from "@/components/settings/SettingsList";

export default function ProfileLegalScreen() {
  const router = useRouter();

  return (
    <Screen edges={["top"]}>
      <ScreenHeader title="Legal" />
      <View style={styles.list}>
        <SettingsGroup>
          <SettingsRow
            icon="file-text"
            label="Terms and conditions"
            onPress={() => router.push("/legal/terms")}
          />
          <SettingsRow
            icon="shield"
            label="Privacy policy"
            onPress={() => router.push("/legal/privacy")}
          />
          <SettingsRow
            icon="info"
            label="Cookie preferences"
            onPress={() => router.push("/legal/privacy")}
            last
          />
        </SettingsGroup>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { paddingTop: spacing.sm },
});
