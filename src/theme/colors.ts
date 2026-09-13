export const modeColors = {
  bus: { bg: "#EFF6FF", bgDark: "#0B2559", text: "#2563EB", textDark: "#60A5FA" },
  train: { bg: "#F0FDF4", bgDark: "#0B3B22", text: "#16A34A", textDark: "#4ADE80" },
  tram: { bg: "#FEFCE8", bgDark: "#3B310B", text: "#CA8A04", textDark: "#FACC15" },
  trolley: { bg: "#FEFCE8", bgDark: "#3B310B", text: "#CA8A04", textDark: "#FACC15" },
  walk: { bg: "#F3F4F6", bgDark: "#1F2430", text: "#6B7280", textDark: "#9CA3AF" },
} as const;

export interface Palette {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  textFaint: string;
  primary: string;
  primaryText: string;
  accentGreen: string;
  accentYellow: string;
  danger: string;
  tabActive: string;
  tabInactive: string;
  shadow: string;
}

export const palette: { light: Palette; dark: Palette } = {
  light: {
    background: "#F9FAFB",
    surface: "#FFFFFF",
    surfaceAlt: "#F3F4F6",
    border: "#E5E7EB",
    text: "#111827",
    textMuted: "#6B7280",
    textFaint: "#9CA3AF",
    primary: "#2563EB",
    primaryText: "#FFFFFF",
    accentGreen: "#16A34A",
    accentYellow: "#CA8A04",
    danger: "#DC2626",
    tabActive: "#2563EB",
    tabInactive: "#9CA3AF",
    shadow: "rgba(15, 23, 42, 0.08)",
  },
  dark: {
    background: "#030712",
    surface: "#111827",
    surfaceAlt: "#1F2937",
    border: "#1F2937",
    text: "#F9FAFB",
    textMuted: "#9CA3AF",
    textFaint: "#6B7280",
    primary: "#60A5FA",
    primaryText: "#0B1220",
    accentGreen: "#4ADE80",
    accentYellow: "#FACC15",
    danger: "#F87171",
    tabActive: "#60A5FA",
    tabInactive: "#6B7280",
    shadow: "rgba(0, 0, 0, 0.4)",
  },
};
