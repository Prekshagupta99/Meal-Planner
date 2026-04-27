const palette = {
  cream: "#FAF6EE",
  creamSoft: "#F3ECDD",
  ink: "#2A1F17",
  inkSoft: "#5A4A3A",
  terracotta: "#C9603A",
  terracottaDeep: "#A84E2C",
  sage: "#6B8E5A",
  sageDeep: "#4F6E42",
  butter: "#F1C669",
  blush: "#E8B7A2",
  rose: "#D9534F",
  white: "#FFFFFF",
  border: "#E8DDC8",
  shadow: "rgba(42, 31, 23, 0.08)",
};

const colors = {
  light: {
    text: palette.ink,
    tint: palette.terracotta,

    background: palette.cream,
    foreground: palette.ink,

    card: palette.white,
    cardForeground: palette.ink,
    cardSoft: palette.creamSoft,

    primary: palette.terracotta,
    primaryForeground: palette.white,
    primaryDeep: palette.terracottaDeep,

    secondary: palette.sage,
    secondaryForeground: palette.white,
    secondaryDeep: palette.sageDeep,

    muted: palette.creamSoft,
    mutedForeground: palette.inkSoft,

    accent: palette.butter,
    accentForeground: palette.ink,

    blush: palette.blush,

    destructive: palette.rose,
    destructiveForeground: palette.white,

    border: palette.border,
    input: palette.border,

    shadow: palette.shadow,
  },

  radius: 18,
};

export default colors;
