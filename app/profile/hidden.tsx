import { Screen, ScreenHeader, EmptyState } from "@/components/ui";

export default function HiddenStoresScreen() {
  return (
    <Screen edges={["top"]}>
      <ScreenHeader title="Hidden stores" />
      <EmptyState
        icon="eye-off"
        title="No hidden stores"
        subtitle="Stores you hide from Discover and Browse will appear here. You can unhide them any time."
      />
    </Screen>
  );
}
