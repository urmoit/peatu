import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import EmptyState from "@/components/EmptyState";
import HeaderGlow from "@/components/HeaderGlow";
import LineRow from "@/components/LineRow";
import StopRow from "@/components/StopRow";
import { SAVED_STOP_IDS_DEFAULT, STOPS } from "@/data/stops";
import { TRANSIT_LINES } from "@/data/lines";
import { useLanguage } from "@/i18n/LanguageContext";
import { useTheme } from "@/theme/ThemeContext";
import type { Stop, TransitLine } from "@/types";
import { StorageKeys, getJSON, setJSON } from "@/utils/storage";

type Segment = "stops" | "lines";

export default function Saved() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [segment, setSegment] = useState<Segment>("stops");
  const [savedStops, setSavedStops] = useState<Stop[]>([]);
  const [savedLines, setSavedLines] = useState<TransitLine[]>([]);

  const reload = useCallback(async () => {
    const stopIds = await getJSON(StorageKeys.savedStops, SAVED_STOP_IDS_DEFAULT);
    setSavedStops(STOPS.filter((s) => stopIds.includes(s.id)));
    const lineIds = await getJSON<string[]>(StorageKeys.savedLines, []);
    setSavedLines(TRANSIT_LINES.filter((l) => lineIds.includes(l.id)));
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        if (active) await reload();
      })();
      return () => {
        active = false;
      };
    }, [reload])
  );

  const unsaveStop = async (stopId: string) => {
    const ids = await getJSON(StorageKeys.savedStops, SAVED_STOP_IDS_DEFAULT);
    await setJSON(StorageKeys.savedStops, ids.filter((id) => id !== stopId));
    setSavedStops((prev) => prev.filter((s) => s.id !== stopId));
  };

  const unsaveLine = async (lineId: string) => {
    const ids = await getJSON<string[]>(StorageKeys.savedLines, []);
    await setJSON(StorageKeys.savedLines, ids.filter((id) => id !== lineId));
    setSavedLines((prev) => prev.filter((l) => l.id !== lineId));
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <HeaderGlow color="#EAB308" />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <View style={[styles.eyebrowPill, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
            <MaterialCommunityIcons name="bookmark" size={12} color={colors.primary} />
            <Text style={[styles.eyebrow, { color: colors.textMuted }]}>
              {t("saved.stopsCount", { count: savedStops.length + savedLines.length })}
            </Text>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>{t("saved.title")}</Text>
          <Text style={[styles.subtitle, { color: colors.textFaint }]}>{t("saved.subtitle")}</Text>
        </View>

        <View style={styles.segmentWrap}>
          <View style={[styles.segment, { backgroundColor: colors.surfaceAlt }]}>
            <Pressable
              onPress={() => setSegment("stops")}
              style={[styles.segmentBtn, segment === "stops" && { backgroundColor: colors.surface, shadowColor: colors.shadow }]}
            >
              <MaterialCommunityIcons
                name="map-marker"
                size={15}
                color={segment === "stops" ? colors.text : colors.textFaint}
              />
              <Text style={{ color: segment === "stops" ? colors.text : colors.textFaint, fontWeight: "700", fontSize: 13 }}>
                {t("search.stopsSection")} · {savedStops.length}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setSegment("lines")}
              style={[styles.segmentBtn, segment === "lines" && { backgroundColor: colors.surface, shadowColor: colors.shadow }]}
            >
              <MaterialCommunityIcons
                name="vector-polyline"
                size={15}
                color={segment === "lines" ? colors.text : colors.textFaint}
              />
              <Text style={{ color: segment === "lines" ? colors.text : colors.textFaint, fontWeight: "700", fontSize: 13 }}>
                {t("search.linesSection")} · {savedLines.length}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          {segment === "stops" ? (
            savedStops.length === 0 ? (
              <EmptyState icon="bookmark-outline" title={t("saved.emptyTitle")} subtitle={t("saved.emptySubtitle")} />
            ) : (
              savedStops.map((s) => (
                <StopRow
                  key={s.id}
                  stop={s}
                  onPress={() => router.push(`/stop/${s.id}`)}
                  trailing={
                    <Pressable onPress={() => unsaveStop(s.id)} hitSlop={10}>
                      <MaterialCommunityIcons name="bookmark-remove-outline" size={20} color={colors.textFaint} />
                    </Pressable>
                  }
                />
              ))
            )
          ) : savedLines.length === 0 ? (
            <EmptyState icon="vector-polyline" title={t("saved.emptyLinesTitle")} subtitle={t("saved.emptyLinesSubtitle")} />
          ) : (
            savedLines.map((l) => (
              <LineRow
                key={l.id}
                line={l}
                saved
                onToggleSave={() => unsaveLine(l.id)}
                onPress={() => router.push({ pathname: "/(tabs)/map", params: { lineId: l.id } })}
              />
            ))
          )}
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
  segmentWrap: { paddingHorizontal: 16, marginTop: 20 },
  segment: {
    flexDirection: "row",
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 38,
    borderRadius: 10,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  section: { paddingHorizontal: 16, marginTop: 16 },
});
