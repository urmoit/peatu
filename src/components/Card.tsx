import React from "react";
import { Platform, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { useTheme } from "@/theme/ThemeContext";

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  padding?: number;
}

export default function Card({ children, onPress, style, padding = 16 }: CardProps) {
  const { colors, mode } = useTheme();

  const cardStyle: StyleProp<ViewStyle> = [
    styles.base,
    {
      backgroundColor: colors.surface,
      padding,
      shadowColor: mode === "dark" ? "#000" : "#0F172A",
    },
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [cardStyle, pressed && styles.pressed]}
        android_ripple={{ color: colors.border, borderless: false }}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 18,
    ...Platform.select({
      ios: {
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 2,
      },
      default: {},
    }),
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
});
