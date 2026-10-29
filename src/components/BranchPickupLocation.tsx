import { StyleSheet, View } from "react-native";
import { colors, spacing } from "@/theme";
import { formatPickupWindow } from "@/utils/format";
import { openDirections } from "@/utils/maps";
import { MapPreview } from "./MapPreview";
import { Text, SecondaryButton } from "./ui";

type Props = {
  restaurantName: string;
  branchName: string;
  branchAddress: string;
  pickupStart: string;
  pickupEnd: string;
  timezone?: string;
  pickupInstructions?: string;
  branchLatitude?: number;
  branchLongitude?: number;
  compact?: boolean;
  showMap?: boolean;
  showDirections?: boolean;
};

export function BranchPickupLocation({
  restaurantName,
  branchName,
  branchAddress,
  pickupStart,
  pickupEnd,
  timezone,
  pickupInstructions,
  branchLatitude,
  branchLongitude,
  compact = false,
  showMap = true,
  showDirections = true,
}: Props) {
  return (
    <View style={styles.wrap}>
      <Text variant={compact ? "bodySm" : "body"} tone="secondary">
        {restaurantName}
      </Text>
      <Text variant={compact ? "h3" : "h2"}>{branchName}</Text>
      <Text variant="body" tone="secondary">
        {branchAddress}
      </Text>
      <Text variant="bodySm" tone="secondary">
        Pickup {formatPickupWindow(pickupStart, pickupEnd, timezone)}
      </Text>
      {pickupInstructions ? (
        <Text variant="bodySm" tone="secondary" style={styles.instructions}>
          {pickupInstructions}
        </Text>
      ) : null}
      {showMap && branchLatitude != null && branchLongitude != null ? (
        <MapPreview
          height={compact ? 140 : 180}
          pins={[{ id: "branch", latitude: branchLatitude, longitude: branchLongitude, active: true }]}
        />
      ) : null}
      {showDirections ? (
        <SecondaryButton
          label="Get directions"
          icon="navigation"
          onPress={() => openDirections(branchLatitude, branchLongitude, branchAddress)}
          style={styles.directions}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  instructions: { marginTop: spacing.xs },
  directions: { marginTop: spacing.sm },
});
