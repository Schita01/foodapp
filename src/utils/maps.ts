import { Linking, Platform } from "react-native";

export function openDirections(
  latitude?: number,
  longitude?: number,
  address?: string,
): void {
  const label = encodeURIComponent(address ?? "Pickup location");
  if (latitude != null && longitude != null) {
    const coords = `${latitude},${longitude}`;
    const url =
      Platform.OS === "ios"
        ? `http://maps.apple.com/?daddr=${coords}&q=${label}`
        : `https://www.google.com/maps/dir/?api=1&destination=${coords}`;
    void Linking.openURL(url);
    return;
  }
  if (address) {
    const q = encodeURIComponent(address);
    const url =
      Platform.OS === "ios"
        ? `http://maps.apple.com/?q=${q}`
        : `https://www.google.com/maps/search/?api=1&query=${q}`;
    void Linking.openURL(url);
  }
}
