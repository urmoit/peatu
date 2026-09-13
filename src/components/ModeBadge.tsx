import { StyleSheet, View } from "react-native";
import ModeIcon from "./ModeIcon";
import { modeColors } from "@/theme/colors";
import { useTheme } from "@/theme/ThemeContext";
import type { TransitMode } from "@/types";

export default function ModeBadge({
  mode,
  size = "md",
}: {
  mode: TransitMode;
  size?: "sm" | "md";
}) {
  const { mode: themeMode } = useTheme();
  const c = modeColors[mode];
  const dim = size === "sm" ? 28 : 36;
  const iconSize = size === "sm" ? 14 : 18;
  const bg = themeMode === "dark" ? c.bgDark : c.bg;
  const text = themeMode === "dark" ? c.textDark : c.text;

  return (
    <View style={[styles.badge, { width: dim, height: dim, borderRadius: dim / 2, backgroundColor: bg }]}>
      <ModeIcon mode={mode} size={iconSize} color={text} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    justifyContent: "center",
  },
});
