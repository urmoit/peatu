import React from "react";
import { Slot } from "expo-router";
import { ThemeProvider } from "@/theme/ThemeContext";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { Providers } from "./Providers";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Providers>
          <Slot />
        </Providers>
      </LanguageProvider>
    </ThemeProvider>
  );
}