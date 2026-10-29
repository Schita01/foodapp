import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { spacing } from "@/theme";
import { Text } from "../ui/Text";
import { SearchBar } from "../ui/SearchBar";
import { LocationPill } from "./LocationPill";
import { NotificationBell } from "./NotificationBell";

export function TopHeader({
  greeting,
  showSearch,
  searchValue,
  onSearchChange,
  onSearchPress,
}: {
  greeting?: string;
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (t: string) => void;
  onSearchPress?: () => void;
}) {
  const router = useRouter();
  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <LocationPill />
        <NotificationBell />
      </View>
      {greeting ? (
        <Text variant="h1" style={styles.greeting}>
          {greeting}
        </Text>
      ) : null}
      {showSearch ? (
        <SearchBar
          value={searchValue}
          onChangeText={onSearchChange}
          editable={!onSearchPress}
          onPress={onSearchPress ?? (() => router.push("/search"))}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, gap: spacing.md },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  greeting: { marginTop: spacing.xs },
});
