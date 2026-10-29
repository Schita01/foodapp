import { Text as RNText, TextProps, StyleSheet } from "react-native";
import { colors, fontSize, fontWeight } from "@/theme";

type Variant =
  | "display"
  | "title"
  | "h1"
  | "h2"
  | "h3"
  | "body"
  | "bodySm"
  | "label"
  | "caption";

type Tone = "primary" | "secondary" | "tertiary" | "brand" | "error" | "success" | "inverse" | "accent";

type Props = TextProps & {
  variant?: Variant;
  tone?: Tone;
  weight?: keyof typeof fontWeight;
  center?: boolean;
};

const toneColor: Record<Tone, string> = {
  primary: colors.textPrimary,
  secondary: colors.textSecondary,
  tertiary: colors.textTertiary,
  brand: colors.primary,
  error: colors.error,
  success: colors.success,
  inverse: colors.white,
  accent: colors.accent,
};

export function Text({
  variant = "body",
  tone = "primary",
  weight,
  center,
  style,
  ...rest
}: Props) {
  return (
    <RNText
      style={[
        styles[variant],
        { color: toneColor[tone] },
        weight ? { fontWeight: fontWeight[weight] } : null,
        center ? { textAlign: "center" } : null,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  display: { fontSize: fontSize.display, fontWeight: fontWeight.bold, lineHeight: 42 },
  title: { fontSize: fontSize.xxxl, fontWeight: fontWeight.bold, lineHeight: 38 },
  h1: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, lineHeight: 30 },
  h2: { fontSize: fontSize.xl, fontWeight: fontWeight.semibold, lineHeight: 26 },
  h3: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, lineHeight: 23 },
  body: { fontSize: fontSize.md, fontWeight: fontWeight.regular, lineHeight: 22 },
  bodySm: { fontSize: fontSize.sm, fontWeight: fontWeight.regular, lineHeight: 19 },
  label: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, lineHeight: 20 },
  caption: { fontSize: fontSize.xs, fontWeight: fontWeight.medium, lineHeight: 15 },
});
