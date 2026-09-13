import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import HeaderGlow from "@/components/HeaderGlow";
import StopRow from "@/components/StopRow";
import { SAVED_STOP_IDS_DEFAULT, STOPS } from "@/data/stops";
import { useLanguage } from "@/i18n/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";
import { useTheme } from "@/theme/ThemeContext";
import type { Stop } from "@/types";
import { StorageKeys, getJSON } from "@/utils/storage";

const MODE_INFO: { icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"]; labelKey: TranslationKey; subKey: TranslationKey; tint: string }[] = [
  { icon: "bus", labelKey: "mode.bus", subKey: "mode.bus.sub", tint: "#3B82F6" },
  { icon: "train", labelKey: "mode.train", subKey: "mode.train.sub", tint: "#22C55E" },
  { icon: "tram", labelKey: "mode.tram", subKey: "mode.tram.sub", tint: "#EAB308" },
  { icon: "tram", labelKey: "mode.trolley", subKey: "mode.trolley.sub", tint: "#EAB308" },
];

export default function Saved() {
  const { colors, mode: themeMode } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [savedStops, setSavedStops] = useState<Stop[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const ids = await getJSON(StorageKeys.savedStops, SAVED_STOP_IDS_DEFAULT);
        if (active) setSavedStops(STOPS.filter((s) => ids.includes(s.id)));
      })();
      return () => {
        active = false;
      };
    }, [])
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <HeaderGlow color="#EAB308" />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <View style={[styles.eyebrowPill, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
            <MaterialCommunityIcons name="bookmark" size={12} color={colors.primary} />
            <Text style={[styles.eyebrow, { color: colors.textMuted }]}>
              {t("saved.stopsCount", { count: savedStops.length })}
            </Text>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>{t("saved.title")}</Text>
          <Text style={[styles.subtitle, { color: colors.textFaint }]}>{t("saved.subtitle")}</Text>
        </View>

        <View style={styles.section}>
          {savedStops.length === 0 ? (
            <Card>
              <EmptyState icon="bookmark-outline" title={t("saved.emptyTitle")} subtitle={t("saved.emptySubtitle")} />
            </Card>
          ) : (
            savedStops.map((s) => <StopRow key={s.id} stop={s} onPress={() => router.push(`/stop/${s.id}`)} />)
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t("saved.transitModes")}</Text>
          <View style={styles.grid}>
            {MODE_INFO.map((m) => (
              <Card key={m.labelKey} style={styles.gridCard}>
                <View style={[styles.gridIcon, { backgroundColor: themeMode === "dark" ? `${m.tint}26` : `${m.tint}14` }]}>
                  <MaterialCommunityIcons name={m.icon} size={20} color={m.tint} />
                </View>
                <Text style={[styles.gridLabel, { color: colors.text }]}>{t(m.labelKey)}</Text>
                <Text style={[styles.gridSub, { color: colors.textFaint }]}>{t(m.subKey)}</Text>
              </Card>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingBottom: 8 },
  eyebrowPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    height: 24,
    borderRadius: 12,
    marginBottom: 8,
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  eyebrow: { fontSize: 11, fontWeight: "800", letterSpacing: 0.3 },
  title: { fontSize: 30, fontWeight: "800", letterSpacing: -0.5 },
  subtitle: { fontSize: 13, marginTop: 4 },
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle: { fontSize: 12, fontWeight: "800", letterSpacing: 0.4, textTransform: "uppercase", marginBottom: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  gridCard: { width: "47%" },
  gridIcon: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  gridLabel: { fontSize: 14, fontWeight: "700" },
  gridSub: { fontSize: 12, marginTop: 2 },
});
