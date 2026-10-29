import { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { spacing } from "@/theme";
import {
  BottomSheet,
  ConfirmDialog,
  PageLoader,
  PrimaryButton,
  Screen,
  ScreenHeader,
  Text,
  TextField,
} from "@/components/ui";
import { SettingsGroup, SettingsRow, SettingsSectionLabel } from "@/components/settings/SettingsList";
import { useDeleteAccount, useMe, useUpdateMe } from "@/hooks/useMe";
import { useAuthStore } from "@/store/authStore";
import { useLocationStore } from "@/store/locationStore";
import { useOnboardingStore } from "@/store/onboardingStore";

const COUNTRIES = ["Georgia", "Armenia", "Azerbaijan", "Turkey", "Germany", "United Kingdom"];
const GENDERS = ["Woman", "Man", "Non-binary", "Prefer not to say"];
const DIETS = ["Vegetarian", "Vegan", "Pescatarian", "Gluten-free", "Halal"];
const WINDOWS = [
  "Early morning",
  "Late morning",
  "Midday",
  "Afternoon",
  "Evening",
  "Late night",
];

type Sheet =
  | "name"
  | "email"
  | "phone"
  | "country"
  | "birthday"
  | "gender"
  | "diet"
  | "windows"
  | null;

export default function AccountDetailsScreen() {
  const router = useRouter();
  const me = useMe();
  const update = useUpdateMe();
  const remove = useDeleteAccount();
  const signOut = useAuthStore((s) => s.signOut);
  const loc = useLocationStore();
  const onboardingWindows = useOnboardingStore((s) => s.preferredPickupWindows);
  const setWindows = useOnboardingStore((s) => s.setPreferredPickupWindows);

  const [sheet, setSheet] = useState<Sheet>(null);
  const [draft, setDraft] = useState("");
  const [multi, setMulti] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const user = me.data;
  const windows = user?.preferredPickupWindows?.length
    ? user.preferredPickupWindows
    : onboardingWindows;

  const openText = (kind: Exclude<Sheet, "country" | "gender" | "diet" | "windows" | null>, value: string) => {
    setDraft(value);
    setSheet(kind);
  };

  const savePatch = async (patch: Record<string, unknown>) => {
    await update.mutateAsync(patch as never);
    setSheet(null);
  };

  const addressValue = (city?: string | null) => city ?? "";

  const dietLabel = useMemo(() => {
    const prefs = user?.dietaryPreferences ?? [];
    return prefs.length ? prefs.join(", ") : "";
  }, [user?.dietaryPreferences]);

  if (me.isLoading || !user) {
    return (
      <Screen edges={["top"]}>
        <ScreenHeader title="Account details" />
        <PageLoader />
      </Screen>
    );
  }

  return (
    <Screen edges={["top"]}>
      <ScreenHeader title="Account details" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <SettingsGroup>
          <SettingsRow
            label="Name"
            value={`${user.firstName} ${user.lastName}`.trim()}
            onPress={() => openText("name", `${user.firstName} ${user.lastName}`.trim())}
          />
          <SettingsRow
            label="Email"
            value={user.email}
            onPress={() => openText("email", user.email)}
          />
          <SettingsRow
            label="Phone number"
            value={user.phone}
            placeholder="Add phone number"
            onPress={() => openText("phone", user.phone ?? "")}
          />
          <SettingsRow
            label="Country"
            value={user.country}
            onPress={() => {
              setDraft(user.country);
              setSheet("country");
            }}
          />
          <SettingsRow
            label="Birthday"
            value={user.birthday}
            placeholder="Add birthday"
            onPress={() => openText("birthday", user.birthday ?? "")}
          />
          <SettingsRow
            label="Gender"
            value={user.gender}
            placeholder="Select"
            onPress={() => {
              setDraft(user.gender ?? "");
              setSheet("gender");
            }}
          />
          <SettingsRow
            label="Dietary preferences"
            value={dietLabel}
            placeholder="Select"
            onPress={() => {
              setMulti(user.dietaryPreferences ?? []);
              setSheet("diet");
            }}
            last
          />
        </SettingsGroup>

        <SettingsSectionLabel label="Delivery addresses" />
        <SettingsGroup>
          <SettingsRow
            label="Home"
            value={addressValue(loc.home?.city)}
            placeholder="Add"
            onPress={() => router.push("/location/edit?slot=home" as Href)}
          />
          <SettingsRow
            label="Work"
            value={addressValue(loc.work?.city)}
            placeholder="Add"
            onPress={() => router.push("/location/edit?slot=work" as Href)}
          />
          <SettingsRow
            label="Other"
            value={addressValue(loc.other?.city)}
            placeholder="Add"
            onPress={() => router.push("/location/edit?slot=other" as Href)}
            last
          />
        </SettingsGroup>

        <SettingsSectionLabel label="Collection times" />
        <SettingsGroup>
          <SettingsRow
            label="Collection times"
            value={windows.length ? windows.join(", ") : ""}
            placeholder="Tap to select"
            onPress={() => {
              setMulti(windows);
              setSheet("windows");
            }}
            last
          />
        </SettingsGroup>

        <View style={styles.deleteWrap}>
          <SettingsRow
            icon="trash-2"
            label="Delete account"
            danger
            last
            onPress={() => setConfirmDelete(true)}
          />
        </View>
      </ScrollView>

      <FieldSheet
        visible={sheet === "name"}
        title="Name"
        value={draft}
        onChange={setDraft}
        onClose={() => setSheet(null)}
        loading={update.isPending}
        onSave={() => {
          const parts = draft.trim().split(/\s+/);
          const firstName = parts[0] || user.firstName;
          const lastName = parts.slice(1).join(" ") || user.lastName;
          return savePatch({ firstName, lastName });
        }}
      />
      <FieldSheet
        visible={sheet === "email"}
        title="Email"
        value={draft}
        keyboardType="email-address"
        onChange={setDraft}
        onClose={() => setSheet(null)}
        loading={update.isPending}
        onSave={() => savePatch({ email: draft.trim() })}
      />
      <FieldSheet
        visible={sheet === "phone"}
        title="Phone number"
        value={draft}
        keyboardType="phone-pad"
        onChange={setDraft}
        onClose={() => setSheet(null)}
        loading={update.isPending}
        onSave={() => savePatch({ phone: draft.trim() })}
      />
      <FieldSheet
        visible={sheet === "birthday"}
        title="Birthday"
        value={draft}
        placeholder="YYYY-MM-DD"
        onChange={setDraft}
        onClose={() => setSheet(null)}
        loading={update.isPending}
        onSave={() => savePatch({ birthday: draft.trim() })}
      />

      <ChoiceSheet
        visible={sheet === "country"}
        title="Country"
        options={COUNTRIES}
        selected={draft}
        onClose={() => setSheet(null)}
        onSelect={(v) => savePatch({ country: v })}
      />
      <ChoiceSheet
        visible={sheet === "gender"}
        title="Gender"
        options={GENDERS}
        selected={draft}
        onClose={() => setSheet(null)}
        onSelect={(v) => savePatch({ gender: v })}
      />
      <MultiSheet
        visible={sheet === "diet"}
        title="Dietary preferences"
        options={DIETS}
        selected={multi}
        onChange={setMulti}
        onClose={() => setSheet(null)}
        loading={update.isPending}
        onSave={() => savePatch({ dietaryPreferences: multi })}
      />
      <MultiSheet
        visible={sheet === "windows"}
        title="Collection times"
        options={WINDOWS}
        selected={multi}
        onChange={setMulti}
        onClose={() => setSheet(null)}
        loading={update.isPending}
        onSave={async () => {
          setWindows(multi);
          await savePatch({ preferredPickupWindows: multi });
        }}
      />

      <ConfirmDialog
        visible={confirmDelete}
        title="Delete account"
        message="This permanently removes your RescueBite account, orders and saved places."
        confirmLabel="Delete account"
        destructive
        icon="trash-2"
        loading={remove.isPending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={async () => {
          await remove.mutateAsync();
          signOut();
          setConfirmDelete(false);
          Alert.alert("Account deleted", "We’re sorry to see you go.");
          router.replace("/auth");
        }}
      />
    </Screen>
  );
}

function FieldSheet({
  visible,
  title,
  value,
  placeholder,
  keyboardType,
  loading,
  onChange,
  onClose,
  onSave,
}: {
  visible: boolean;
  title: string;
  value: string;
  placeholder?: string;
  keyboardType?: "email-address" | "phone-pad" | "default";
  loading?: boolean;
  onChange: (v: string) => void;
  onClose: () => void;
  onSave: () => void | Promise<void>;
}) {
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={title}
      closeInCircle
      footer={<PrimaryButton label="Save" loading={loading} onPress={() => void onSave()} />}
    >
      <TextField
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        autoCapitalize={keyboardType === "email-address" ? "none" : "words"}
        keyboardType={keyboardType}
      />
    </BottomSheet>
  );
}

function ChoiceSheet({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  options: string[];
  selected: string;
  onSelect: (v: string) => void;
  onClose: () => void;
}) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title={title} closeInCircle>
      <SettingsGroup>
        {options.map((opt, i) => (
          <SettingsRow
            key={opt}
            label={opt}
            value={selected === opt ? "Selected" : undefined}
            last={i === options.length - 1}
            onPress={() => onSelect(opt)}
          />
        ))}
      </SettingsGroup>
    </BottomSheet>
  );
}

function MultiSheet({
  visible,
  title,
  options,
  selected,
  onChange,
  onClose,
  onSave,
  loading,
}: {
  visible: boolean;
  title: string;
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
  onClose: () => void;
  onSave: () => void | Promise<void>;
  loading?: boolean;
}) {
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={title}
      closeInCircle
      footer={<PrimaryButton label="Save" loading={loading} onPress={() => void onSave()} />}
    >
      <SettingsGroup>
        {options.map((opt, i) => {
          const on = selected.includes(opt);
          return (
            <SettingsRow
              key={opt}
              label={opt}
              value={on ? "Selected" : undefined}
              last={i === options.length - 1}
              onPress={() =>
                onChange(on ? selected.filter((x) => x !== opt) : [...selected, opt])
              }
            />
          );
        })}
      </SettingsGroup>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.huge },
  deleteWrap: { marginTop: spacing.xxxl },
});
