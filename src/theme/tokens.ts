/**
 * RescueBite design tokens.
 * Warm, clean, food-rescue identity: cream background, green primary actions,
 * orange/yellow accents, red reserved for errors only.
 */

export const colors = {
  background: "#FFFFFF",
  backgroundAlt: "#F6F6F4",
  surface: "#FFFFFF",

  primary: "#1F8F5F",
  primaryDark: "#0F4F37",
  primarySoft: "#E4F3EA",

  /** Brand accent palette: lime for filled actions, ink-green for text/links. */
  brandLime: "#9FE870",
  brandInk: "#163300",

  accent: "#F59E0B",
  accentSoft: "#FEF3C7",

  error: "#DC2626",
  errorSoft: "#FDECEC",
  success: "#16A34A",
  successSoft: "#E6F6EC",
  warning: "#D97706",
  info: "#2563EB",

  textPrimary: "#17211B",
  textSecondary: "#647067",
  textTertiary: "#9AA59E",

  border: "#E8E8E6",
  borderStrong: "#D6D6D2",
  disabled: "#C9C9C9",
  disabledBg: "#EFEFED",

  overlay: "rgba(15, 33, 23, 0.45)",
  white: "#FFFFFF",
  black: "#000000",
} as const;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  card: 20,
  cardLg: 24,
  pill: 999,
  sheet: 24,
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  display: 36,
} as const;

export const fontWeight = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const;

export const shadow = {
  card: {
    shadowColor: "#1F2A22",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  soft: {
    shadowColor: "#1F2A22",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  sheet: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  },
  button: {
    shadowColor: "#0F4F37",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
} as const;

/** Minimum accessible tap target. */
export const HIT_TARGET = 44;

export const theme = {
  colors,
  spacing,
  radii,
  fontSize,
  fontWeight,
  shadow,
};

export type Theme = typeof theme;
