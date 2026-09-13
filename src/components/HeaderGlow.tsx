import { BlurView } from "expo-blur";
import { StyleSheet, View } from "react-native";
import { useTheme } from "@/theme/ThemeContext";

export default function HeaderGlow({ color = "#3B82F6", height = 260 }: { color?: string; height?: number }) {
  const { mode } = useTheme();
  return (
    <View pointerEvents="none" style={[styles.layer, { height }]}>
      <View style={[styles.blobBig, { backgroundColor: color, top: -140, right: -100 }]} />
      <View style={[styles.blobSmall, { backgroundColor: color, top: 20, left: -70 }]} />
      <BlurView intensity={65} tint={mode === "dark" ? "dark" : "light"} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
  },
  blobBig: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.22,
  },
  blobSmall: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    opacity: 0.16,
  },
});
