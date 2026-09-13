import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import { palette, type Palette } from "./colors";

export type ThemeMode = "light" | "dark";

const THEME_KEY = "peatu-web:theme-mode";

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
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored === "light" || stored === "dark") {
        setModeState(stored);
      } else if (systemScheme === "dark" || systemScheme === "light") {
        setModeState(systemScheme);
      }
      setIsLoaded(true);
    }
  }, [systemScheme]);

  const setMode = (next: ThemeMode) => {
    setModeState(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(THEME_KEY, next);
    }
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