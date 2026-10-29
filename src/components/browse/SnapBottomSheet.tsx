import { useCallback, useEffect } from "react";
import { Dimensions } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { radii } from "@/theme";

const FALLBACK_H = Dimensions.get("window").height;
/** Handle + title stay on screen in the lowest snap (above the tab bar). */
export const SHEET_PEEK = 88;
const SPRING = { damping: 22, stiffness: 220, mass: 0.9 };

export type SheetSnap = "collapsed" | "mid" | "full";

function nearestSnap(y: number, vy: number, full: number, mid: number, collapsed: number) {
  "worklet";
  const sorted = [full, mid, collapsed].sort((a, b) => a - b);
  if (vy < -850) return sorted.find((p) => p < y - 12) ?? sorted[0];
  if (vy > 850) return [...sorted].reverse().find((p) => p > y + 12) ?? sorted[sorted.length - 1];
  let best = sorted[0];
  let bestDist = Math.abs(y - best);
  for (const p of sorted) {
    const d = Math.abs(y - p);
    if (d < bestDist) {
      best = p;
      bestDist = d;
    }
  }
  return best;
}

export function useSnapSheet(
  containerH: number,
  topOffset: number,
  onSnapChange?: (s: SheetSnap) => void,
) {
  const height = containerH > 120 ? containerH : FALLBACK_H;
  const fullY = Math.max(0, topOffset);
  const midY = Math.round(height * 0.45);
  const collapsedY = Math.max(fullY + 80, height - SHEET_PEEK);

  const full = useSharedValue(fullY);
  const mid = useSharedValue(midY);
  const collapsed = useSharedValue(collapsedY);
  const y = useSharedValue(collapsedY);
  const startY = useSharedValue(collapsedY);

  useEffect(() => {
    full.value = fullY;
    mid.value = midY;
    collapsed.value = collapsedY;
    if (y.value > collapsedY - 4) {
      y.value = collapsedY;
    }
  }, [collapsed, collapsedY, full, fullY, mid, midY, y]);

  const report = useCallback(
    (value: number) => {
      if (value <= fullY + 28) onSnapChange?.("full");
      else if (value >= collapsedY - 28) onSnapChange?.("collapsed");
      else onSnapChange?.("mid");
    },
    [collapsedY, fullY, onSnapChange],
  );

  const snapTo = useCallback(
    (next: SheetSnap) => {
      const target = next === "full" ? fullY : next === "mid" ? midY : collapsedY;
      y.value = withSpring(target, SPRING);
      onSnapChange?.(next);
    },
    [collapsedY, fullY, midY, onSnapChange, y],
  );

  const pan = Gesture.Pan()
    .activeOffsetY([-6, 6])
    .onStart(() => {
      startY.value = y.value;
    })
    .onUpdate((e) => {
      const next = startY.value + e.translationY;
      y.value = Math.max(full.value, Math.min(collapsed.value, next));
    })
    .onEnd((e) => {
      const target = nearestSnap(y.value, e.velocityY, full.value, mid.value, collapsed.value);
      y.value = withSpring(target, SPRING);
      runOnJS(report)(target);
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
    borderTopLeftRadius: interpolate(y.value, [full.value, mid.value], [0, radii.sheet], "clamp"),
    borderTopRightRadius: interpolate(y.value, [full.value, mid.value], [0, radii.sheet], "clamp"),
  }));

  const compassStyle = useAnimatedStyle(() => ({
    bottom: height - y.value + 12,
    opacity: interpolate(y.value, [full.value + 50, mid.value], [0, 1], "clamp"),
  }));

  const mapFabStyle = useAnimatedStyle(() => ({
    opacity: interpolate(y.value, [full.value, mid.value - 40], [1, 0], "clamp"),
    transform: [
      {
        translateY: interpolate(y.value, [full.value, mid.value], [0, 24], "clamp"),
      },
    ],
  }));

  return { pan, sheetStyle, compassStyle, mapFabStyle, snapTo, sheetHeight: height };
}
