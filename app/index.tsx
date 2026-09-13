import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useTheme } from "@/theme/ThemeContext";
import { StorageKeys, getJSON } from "@/utils/storage";

export default function Index() {
  const { colors } = useTheme();
  const [target, setTarget] = useState<"/onboarding" | "/(tabs)" | null>(null);

  useEffect(() => {
    (async () => {
      const hasOnboarded = await getJSON(StorageKeys.hasOnboarded, false);
      setTarget(hasOnboarded ? "/(tabs)" : "/onboarding");
    })();
  }, []);

  if (!target) {
    return (
      <View style={[styles.wrap, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <Redirect href={target} />;
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
