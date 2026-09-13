import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.style.margin = "0";
      document.body.style.padding = "0";
      document.documentElement.style.height = "100%";
      document.body.style.height = "100%";
      document.getElementById("root")!.style.height = "100%";
    }
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <View style={styles.inner}>{children}</View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: "100vh",
    minHeight: "100dvh",
  },
  inner: {
    flex: 1,
  },
});