import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import { palette, type Palette } from "./colors";
import type { ThemeMode } from "@/types";

const THEME_KEY = "peatu:theme-mode";

interface ThemeContextValue {
  mode: ThemeMode;
  colors: Palette;
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
  isLoaded: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>(systemScheme === "dark" ? "dark" : "light");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_KEY);
        if (stored === "light" || stored === "dark") {
          setModeState(stored);
        } else if (systemScheme === "dark" || systemScheme === "light") {
          setModeState(systemScheme);
        }
      } finally {
        setIsLoaded(true);
      }
    })();
    // Only run on mount — user's explicit choice should win afterwards.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setMode = (next: ThemeMode) => {
    setModeState(next);
    AsyncStorage.setItem(THEME_KEY, next).catch(() => {});
  };

  const toggleTheme = () => setMode(mode === "light" ? "dark" : "light");

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, colors: palette[mode], toggleTheme, setMode, isLoaded }),
    [mode, isLoaded]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
