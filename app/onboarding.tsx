import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LanguageCompactSwitch } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/i18n/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";
import { useTheme } from "@/theme/ThemeContext";
import { StorageKeys, setJSON } from "@/utils/storage";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const SLIDES: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  titleKey: TranslationKey;
  descKey: TranslationKey;
  tint: "blue" | "green" | "yellow";
}[] = [
  { icon: "map-marker-radius", titleKey: "onboarding.slide1.title", descKey: "onboarding.slide1.desc", tint: "blue" },
  { icon: "bus", titleKey: "onboarding.slide2.title", descKey: "onboarding.slide2.desc", tint: "green" },
  { icon: "routes", titleKey: "onboarding.slide3.title", descKey: "onboarding.slide3.desc", tint: "yellow" },
];

const TINTS = {
  blue: "#3B82F6",
  green: "#22C55E",
  yellow: "#EAB308",
};

export default function Onboarding() {
  const { colors, mode } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);

  const finishOnboarding = async () => {
    await setJSON(StorageKeys.hasOnboarded, true);
    router.replace("/(tabs)");
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setIndex(page);
  };

  const goTo = (page: number) => {
    scrollRef.current?.scrollTo({ x: page * SCREEN_WIDTH, animated: true });
  };

  const isLast = index === SLIDES.length - 1;
  const accent = TINTS[SLIDES[index].tint];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View pointerEvents="none" style={styles.blobLayer}>
        <View style={[styles.blob, { backgroundColor: accent, top: -160, right: -90 }]} />
        <View style={[styles.blobSmall, { backgroundColor: accent, top: 40, left: -60 }]} />
        <BlurView
          intensity={70}
          tint={mode === "dark" ? "dark" : "light"}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        />
      </View>

      <View style={[styles.topRow, { paddingTop: insets.top + 16 }]}>
        <View style={styles.brandRow}>
          <View style={[styles.brandIcon, { backgroundColor: accent }]}>
            <MaterialCommunityIcons name="bus" size={16} color="#FFFFFF" />
          </View>
          <Text style={[styles.brand, { color: colors.text }]}>{t("app.name")}</Text>
        </View>
        <LanguageCompactSwitch />
      </View>

      <View style={styles.header}>
        <View style={[styles.eyebrowPill, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
          <View style={[styles.eyebrowDot, { backgroundColor: accent }]} />
          <Text style={[styles.eyebrow, { color: colors.textMuted }]}>{t("onboarding.eyebrow")}</Text>
        </View>
        <Text style={[styles.tagline, { color: colors.textMuted }]}>{t("app.tagline")}</Text>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        style={styles.scroller}
      >
        {SLIDES.map((slide) => {
          const tint = TINTS[slide.tint];
          return (
            <View key={slide.titleKey} style={[styles.slide, { width: SCREEN_WIDTH }]}>
              <View style={styles.iconStack}>
                <View style={[styles.iconHalo, { borderColor: `${tint}33` }]} />
                <View style={[styles.iconCircle, { backgroundColor: tint, shadowColor: tint }]}>
                  <MaterialCommunityIcons name={slide.icon} size={40} color="#FFFFFF" />
                </View>
              </View>
              <Text style={[styles.slideTitle, { color: colors.text }]}>{t(slide.titleKey)}</Text>
              <Text style={[styles.slideDescription, { color: colors.textMuted }]}>{t(slide.descKey)}</Text>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.dots}>
        {SLIDES.map((slide, i) => (
          <Pressable
            key={slide.titleKey}
            onPress={() => goTo(i)}
            style={[
              styles.dot,
              {
                width: i === index ? 26 : 7,
                backgroundColor: i === index ? accent : colors.border,
              },
            ]}
          />
        ))}
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <Pressable
          onPress={() => (isLast ? finishOnboarding() : goTo(index + 1))}
          style={[styles.primaryBtn, { backgroundColor: accent, shadowColor: accent }]}
        >
          <Text style={styles.primaryBtnText}>{isLast ? t("onboarding.getStarted") : t("onboarding.continue")}</Text>
          {!isLast && <MaterialCommunityIcons name="arrow-right" size={19} color="#FFFFFF" />}
        </Pressable>
        {!isLast && (
          <Pressable onPress={finishOnboarding} style={styles.skipBtn}>
            <Text style={[styles.skipText, { color: colors.textFaint }]}>{t("onboarding.skip")}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  blobLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 420,
    overflow: "hidden",
  },
  blob: {
    position: "absolute",
    width: 340,
    height: 340,
    borderRadius: 170,
    opacity: 0.35,
  },
  blobSmall: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    opacity: 0.25,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  brandIcon: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  brand: { fontSize: 17, fontWeight: "800", letterSpacing: -0.3 },
  header: { alignItems: "center", paddingTop: 32, paddingBottom: 4, paddingHorizontal: 32 },
  eyebrowPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    height: 26,
    borderRadius: 13,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  eyebrowDot: { width: 6, height: 6, borderRadius: 3 },
  eyebrow: { fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.6 },
  tagline: { fontSize: 13, marginTop: 14, textAlign: "center", lineHeight: 19, maxWidth: 280 },
  scroller: { flexGrow: 0, marginTop: 12 },
  slide: { alignItems: "center", paddingHorizontal: 36, paddingTop: 20 },
  iconStack: { alignItems: "center", justifyContent: "center", marginBottom: 36, width: 156, height: 156 },
  iconHalo: {
    position: "absolute",
    width: 156,
    height: 156,
    borderRadius: 78,
    borderWidth: 14,
  },
  iconCircle: {
    width: 92,
    height: 92,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  slideTitle: { fontSize: 22, fontWeight: "800", textAlign: "center", marginBottom: 12, letterSpacing: -0.3 },
  slideDescription: { fontSize: 14.5, textAlign: "center", lineHeight: 22 },
  dots: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 7, paddingVertical: 22 },
  dot: { height: 7, borderRadius: 4 },
  footer: { paddingHorizontal: 24, paddingTop: 4 },
  primaryBtn: {
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  primaryBtnText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
  skipBtn: { alignItems: "center", marginTop: 16 },
  skipText: { fontSize: 13, fontWeight: "600" },
});
