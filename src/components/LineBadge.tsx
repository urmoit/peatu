import { StyleSheet, Text, View } from "react-native";
import { modeColors } from "@/theme/colors";
import { useTheme } from "@/theme/ThemeContext";
import type { TransitMode } from "@/types";

const SIZES = {
  sm: { minWidth: 26, height: 24, fontSize: 12, paddingHorizontal: 6 },
  md: { minWidth: 32, height: 30, fontSize: 14, paddingHorizontal: 8 },
  lg: { minWidth: 40, height: 36, fontSize: 16, paddingHorizontal: 10 },
} as const;

export default function LineBadge({
  line,
  mode,
  size = "md",
}: {
  line: string;
  mode: TransitMode;
  size?: keyof typeof SIZES;
}) {
  const { mode: themeMode } = useTheme();
  const c = modeColors[mode];
  const bg = themeMode === "dark" ? c.bgDark : c.bg;
  const text = themeMode === "dark" ? c.textDark : c.text;
  const dims = SIZES[size];

  return (
    <View
      style={[
        styles.badge,
        {
          minWidth: dims.minWidth,
          height: dims.height,
          paddingHorizontal: dims.paddingHorizontal,
          backgroundColor: bg,
          borderRadius: dims.height / 2.6,
        },
      ]}
    >
      <Text style={{ color: text, fontWeight: "800", fontSize: dims.fontSize }}>{line}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    justifyContent: "center",
  },
});
