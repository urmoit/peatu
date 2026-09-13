import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Card from "@/components/Card";
import CustomMap from "@/components/CustomMap";
import EmptyState from "@/components/EmptyState";
import LineBadge from "@/components/LineBadge";
import LineRow from "@/components/LineRow";
import ModeBadge from "@/components/ModeBadge";
import ModeIcon from "@/components/ModeIcon";
import { getStopById, SAVED_STOP_IDS_DEFAULT } from "@/data/stops";
import { TRANSIT_LINES } from "@/data/lines";
import { getDeparturesForStop } from "@/data/trips";
import { useLanguage } from "@/i18n/LanguageContext";
import { modeColors } from "@/theme/colors";
import { useTheme } from "@/theme/ThemeContext";
import type { TranslationKey } from "@/i18n/translations";
import type { TransitMode } from "@/types";
import { StorageKeys, getJSON, setJSON } from "@/utils/storage";

const FILTERS: { key: "all" | TransitMode; labelKey: TranslationKey }[] = [
  { key: "all", labelKey: "stop.filter.all" },
  { key: "bus", labelKey: "stop.filter.bus" },
  { key: "train", labelKey: "stop.filter.train" },
  { key: "tram", labelKey: "stop.filter.tram" },
];

export default function StopDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, mode: themeMode } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const stop = getStopById(id);
  const departures = getDeparturesForStop(stop.id);
  const linesThroughStop = TRANSIT_LINES.filter((l) => l.stopIds.includes(stop.id));
  const [filter, setFilter] = useState<"all" | TransitMode>("all");
  const [saved, setSaved] = useState(false);
  const [savedLineIds, setSavedLineIds] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const savedIds = await getJSON(StorageKeys.savedStops, SAVED_STOP_IDS_DEFAULT);
      setSaved(savedIds.includes(stop.id));
      setSavedLineIds(await getJSON<string[]>(StorageKeys.savedLines, []));
    })();
  }, [stop.id]);

  const toggleSaved = async () => {
    const savedIds = await getJSON(StorageKeys.savedStops, SAVED_STOP_IDS_DEFAULT);
    const next = saved ? savedIds.filter((s) => s !== stop.id) : [...savedIds, stop.id];
    await setJSON(StorageKeys.savedStops, next);
    setSaved(!saved);
  };

  const toggleSavedLine = async (lineId: string) => {
    const isSaved = savedLineIds.includes(lineId);
    const next = isSaved ? savedLineIds.filter((id) => id !== lineId) : [...savedLineIds, lineId];
    setSavedLineIds(next);
    await setJSON(StorageKeys.savedLines, next);
  };

  const filtered = useMemo(
    () =>
      departures.filter((d) => {
        if (filter === "all") return true;
        if (filter === "tram") return d.mode === "tram" || d.mode === "trolley";
        return d.mode === filter;
      }),
    [departures, filter]
  );

  const nonWalkModes = stop.modes.filter((m) => m !== "walk");
  const heroMode = nonWalkModes[0] ?? "bus";
  const heroColor = modeColors[heroMode];
  const heroBg = themeMode === "dark" ? heroColor.bgDark : heroColor.bg;
  const heroText = themeMode === "dark" ? heroColor.textDark : heroColor.text;

  const openInMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${stop.lat},${stop.lng}`;
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.hero}>
        <CustomMap
          stops={[stop]}
          lines={linesThroughStop}
          center={{ lat: stop.lat, lng: stop.lng }}
          zoom={14}
          interactive={false}
          selectedStopId={stop.id}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        />
        <View style={[styles.heroTopBar, { paddingTop: insets.top + 8 }]}>
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))}
            style={[styles.heroBtn, { backgroundColor: "rgba(255,255,255,0.9)" }]}
          >
            <MaterialCommunityIcons name="arrow-left" size={20} color="#1F2937" />
          </Pressable>
          <Pressable
            onPress={toggleSaved}
            style={[styles.heroBtn, { backgroundColor: "rgba(255,255,255,0.9)" }]}
          >
            <MaterialCommunityIcons
              name={saved ? "bookmark" : "bookmark-outline"}
              size={20}
              color={saved ? "#CA8A04" : "#1F2937"}
            />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        <View style={styles.summaryWrap}>
          <Card style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.stopName, { color: colors.text }]} numberOfLines={1}>
                  {stop.name}
                </Text>
                <Text style={[styles.stopMeta, { color: colors.textFaint }]}>
                  {stop.area} · {stop.distance} {t("stop.away")}
                </Text>
              </View>
              <Pressable onPress={openInMaps} style={[styles.navBtn, { backgroundColor: heroBg }]}>
                <MaterialCommunityIcons name="navigation-variant" size={18} color={heroText} />
              </Pressable>
            </View>
            <View style={styles.modesRow}>
              {nonWalkModes.map((m) => (
                <ModeBadge key={m} mode={m} size="sm" />
              ))}
            </View>
          </Card>
        </View>

        <View style={styles.filterRow}>
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => setFilter(f.key)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: active ? colors.text : colors.surface,
                    shadowColor: colors.shadow,
                  },
                ]}
              >
                <Text style={{ color: active ? colors.background : colors.textMuted, fontWeight: "700", fontSize: 13 }}>
                  {t(f.labelKey)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.list}>
          {filtered.length === 0 ? (
            <EmptyState icon="bus-alert" title={t("stop.noDepartures")} />
          ) : (
            filtered.map((d) => (
              <Card key={d.id} padding={14} style={styles.departureCard}>
                <View style={styles.departureRow}>
                  <LineBadge line={d.line} mode={d.mode} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.destination, { color: colors.text }]} numberOfLines={1}>
                      {d.destination}
                    </Text>
                    <View style={styles.destinationMeta}>
                      <ModeIcon mode={d.mode} size={12} color={colors.textFaint} />
                      <Text style={[styles.destinationModeText, { color: colors.textFaint }]}>
                        {t(`mode.${d.mode === "trolley" ? "trolley" : d.mode}` as any)}
                      </Text>
                    </View>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text
                      style={[
                        styles.etaValue,
                        { color: d.etaMin <= 5 ? colors.primary : colors.text },
                      ]}
                    >
                      {d.etaMin} {t("stop.min")}
                    </Text>
                    <Text style={[styles.etaSub, { color: colors.textFaint }]}>{t("stop.onTime")}</Text>
                  </View>
                </View>
              </Card>
            ))
          )}
        </View>

        {linesThroughStop.length > 0 && (
          <View style={styles.list}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
              {t("search.linesSection").toUpperCase()}
            </Text>
            {linesThroughStop.map((line) => (
              <LineRow
                key={line.id}
                line={line}
                saved={savedLineIds.includes(line.id)}
                onToggleSave={() => toggleSavedLine(line.id)}
                onPress={() => router.push({ pathname: "/(tabs)/map", params: { lineId: line.id } })}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: 176,
    justifyContent: "center",
  },
  heroTopBar: {
    position: "absolute",
    left: 16,
    right: 16,
    top: 0,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  heroBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryWrap: {
    paddingHorizontal: 16,
    marginTop: -24,
  },
  summaryCard: {},
  summaryRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  stopName: {
    fontSize: 20,
    fontWeight: "800",
  },
  stopMeta: {
    fontSize: 13,
    marginTop: 2,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  modesRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 12,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 20,
  },
  filterChip: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  list: {
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  departureCard: {},
  departureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  destination: {
    fontSize: 15,
    fontWeight: "700",
  },
  destinationMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 3,
  },
  destinationModeText: {
    fontSize: 11,
  },
  etaValue: {
    fontSize: 16,
    fontWeight: "800",
  },
  etaSub: {
    fontSize: 10,
    marginTop: 1,
  },
});
