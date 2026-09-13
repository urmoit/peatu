import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Card from "@/components/Card";
import CustomMap, { type CustomMapHandle } from "@/components/CustomMap";
import LineRow from "@/components/LineRow";
import ModeBadge from "@/components/ModeBadge";
import { STOPS } from "@/data/stops";
import { TRANSIT_LINES } from "@/data/lines";
import { useLanguage } from "@/i18n/LanguageContext";
import { useTheme } from "@/theme/ThemeContext";
import type { TranslationKey } from "@/i18n/translations";
import { StorageKeys, getJSON, setJSON } from "@/utils/storage";

const TALLINN_CENTER = { lat: 59.437, lng: 24.7536 };

const MODE_FILTERS: { key: "all" | "bus" | "train" | "tram" | "trolley"; labelKey: TranslationKey }[] = [
  { key: "all", labelKey: "map.filter.all" },
  { key: "bus", labelKey: "map.filter.bus" },
  { key: "train", labelKey: "map.filter.train" },
  { key: "tram", labelKey: "map.filter.tram" },
  { key: "trolley", labelKey: "map.filter.trolley" },
];

export default function MapTab() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ lineId?: string }>();
  const mapRef = useRef<CustomMapHandle>(null);
  const [showStops, setShowStops] = useState(true);
  const [showLines, setShowLines] = useState(true);
  const [filter, setFilter] = useState<(typeof MODE_FILTERS)[number]["key"]>("all");
  const [locating, setLocating] = useState(false);
  const [selectedLineId, setSelectedLineId] = useState<string | undefined>(undefined);
  const [tappedStopId, setTappedStopId] = useState<string | undefined>(undefined);
  const [savedLineIds, setSavedLineIds] = useState<string[]>([]);
  const [stopsHiddenByZoom, setStopsHiddenByZoom] = useState(true);

  useEffect(() => {
    (async () => setSavedLineIds(await getJSON<string[]>(StorageKeys.savedLines, [])))();
  }, []);

  const toggleSaveLine = async (lineId: string) => {
    const isSaved = savedLineIds.includes(lineId);
    const next = isSaved ? savedLineIds.filter((id) => id !== lineId) : [...savedLineIds, lineId];
    setSavedLineIds(next);
    await setJSON(StorageKeys.savedLines, next);
  };

  const toggleSaveSelectedLine = async () => {
    if (!selectedLineId) return;
    await toggleSaveLine(selectedLineId);
  };

  useEffect(() => {
    (async () => {
      const stored = await getJSON(StorageKeys.showStopsByDefault, true);
      setShowStops(stored);
      const storedFilter = await getJSON<(typeof MODE_FILTERS)[number]["key"]>(StorageKeys.mapFilter, "all");
      setFilter(storedFilter);
    })();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (params.lineId) {
        setSelectedLineId(params.lineId);
        setTappedStopId(undefined);
        setShowLines(true);
        const line = TRANSIT_LINES.find((l) => l.id === params.lineId);
        if (line) setFilter(line.mode as typeof filter);
      }
    }, [params.lineId])
  );

  const toggleStops = () => {
    const next = !showStops;
    setShowStops(next);
    setJSON(StorageKeys.showStopsByDefault, next);
  };

  const goToMyLocation = async () => {
    try {
      setLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      mapRef.current?.setUserLocation(position.coords.latitude, position.coords.longitude);
      mapRef.current?.flyTo(position.coords.latitude, position.coords.longitude, 15);
    } catch {
      // ignore — button remains usable
    } finally {
      setLocating(false);
    }
  };

  const visibleStops = showStops ? STOPS.filter((s) => (filter === "all" ? true : s.modes.includes(filter))) : [];

  // Only ever draw what the user explicitly asked for: a selected line, or the
  // lines serving a tapped stop. Nothing is shown by default.
  const tappedStop = tappedStopId ? STOPS.find((s) => s.id === tappedStopId) : undefined;
  const linesThroughTappedStop = tappedStop ? TRANSIT_LINES.filter((l) => l.stopIds.includes(tappedStop.id)) : [];
  const selectedLine = selectedLineId ? TRANSIT_LINES.find((l) => l.id === selectedLineId) : undefined;
  const visibleLines = !showLines ? [] : selectedLine ? [selectedLine] : tappedStop ? linesThroughTappedStop : [];

  const handleStopPress = (id: string) => {
    router.setParams({ lineId: undefined });
    setSelectedLineId(undefined);
    setTappedStopId(id);
    setShowLines(true);
  };

  const handleSelectLine = (lineId: string) => {
    const line = TRANSIT_LINES.find((l) => l.id === lineId);
    setTappedStopId(undefined);
    setSelectedLineId(lineId);
    setShowLines(true);
    if (line) {
      setFilter(line.mode as typeof filter);
      setJSON(StorageKeys.mapFilter, line.mode);
    }
    router.setParams({ lineId });
  };

  return (
    <View style={{ flex: 1 }}>
      <CustomMap
        ref={mapRef}
        stops={visibleStops}
        lines={visibleLines}
        center={TALLINN_CENTER}
        zoom={13}
        interactive
        selectedLineId={selectedLineId}
        selectedStopId={tappedStopId}
        onStopPress={handleStopPress}
        onMarkersVisibilityChange={(visible) => setStopsHiddenByZoom(!visible)}
      />

      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
        <View style={[styles.filterScroll, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
          {MODE_FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => {
                  setFilter(f.key);
                  setSelectedLineId(undefined);
                  setTappedStopId(undefined);
                  setJSON(StorageKeys.mapFilter, f.key);
                }}
                style={[styles.filterChip, active && { backgroundColor: colors.text }]}
              >
                <Text style={{ color: active ? colors.background : colors.textMuted, fontSize: 12, fontWeight: "700" }}>
                  {t(f.labelKey)}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {selectedLineId && (
          <View style={styles.lineSelectionRow}>
            <View style={[styles.clearLinePill, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
              <Pressable
                onPress={() => {
                  router.setParams({ lineId: undefined });
                  setSelectedLineId(undefined);
                }}
                style={styles.clearLinePillTouch}
              >
                <MaterialCommunityIcons name="close-circle" size={14} color={colors.textMuted} />
                <Text style={[styles.clearLineText, { color: colors.textMuted }]}>
                  {TRANSIT_LINES.find((l) => l.id === selectedLineId)?.number}
                </Text>
              </Pressable>
            </View>
            <Pressable
              onPress={toggleSaveSelectedLine}
              style={[styles.saveLineFab, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}
            >
              <MaterialCommunityIcons
                name={savedLineIds.includes(selectedLineId) ? "bookmark" : "bookmark-outline"}
                size={16}
                color={savedLineIds.includes(selectedLineId) ? colors.primary : colors.textMuted}
              />
            </Pressable>
          </View>
        )}
      </View>

      {showStops && stopsHiddenByZoom && (
        <View style={[styles.zoomHintWrap, { top: insets.top + 58 }]} pointerEvents="none">
          <View style={[styles.zoomHintPill, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
            <MaterialCommunityIcons name="magnify-plus-outline" size={14} color={colors.textMuted} />
            <Text style={[styles.zoomHintText, { color: colors.textMuted }]}>{t("map.zoomToSeeStops")}</Text>
          </View>
        </View>
      )}

      {tappedStop && !selectedLineId && (
        <View style={[styles.stopSheetWrap, { bottom: insets.bottom + 16 }]} pointerEvents="box-none">
          <Card padding={0} style={styles.stopSheet}>
            <View style={styles.stopSheetHeader}>
              <ModeBadge mode={tappedStop.modes[0]} size="md" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.stopSheetTitle, { color: colors.text }]} numberOfLines={1}>
                  {tappedStop.name}
                </Text>
                <Text style={[styles.stopSheetMeta, { color: colors.textFaint }]} numberOfLines={1}>
                  {tappedStop.area} · {tappedStop.distance}
                </Text>
              </View>
              <Pressable
                onPress={() => setTappedStopId(undefined)}
                hitSlop={10}
                style={[styles.stopSheetClose, { backgroundColor: colors.surfaceAlt }]}
              >
                <MaterialCommunityIcons name="close" size={18} color={colors.textMuted} />
              </Pressable>
            </View>
            <Text style={[styles.stopSheetSection, { color: colors.textMuted }]}>
              {t("search.linesSection").toUpperCase()} · {linesThroughTappedStop.length}
            </Text>
            {linesThroughTappedStop.length === 0 ? (
              <Text style={[styles.stopSheetEmpty, { color: colors.textFaint }]}>{t("map.noLinesAtStop")}</Text>
            ) : (
              <ScrollView style={styles.stopSheetList} showsVerticalScrollIndicator={false}>
                {linesThroughTappedStop.map((line) => (
                  <LineRow
                    key={line.id}
                    line={line}
                    saved={savedLineIds.includes(line.id)}
                    onToggleSave={() => toggleSaveLine(line.id)}
                    onPress={() => handleSelectLine(line.id)}
                  />
                ))}
              </ScrollView>
            )}
            <Pressable onPress={() => router.push(`/stop/${tappedStop.id}`)} style={styles.stopSheetFooter} hitSlop={8}>
              <Text style={[styles.stopSheetFooterText, { color: colors.primary }]}>{t("map.stopDetails")}</Text>
              <MaterialCommunityIcons name="chevron-right" size={16} color={colors.primary} />
            </Pressable>
          </Card>
        </View>
      )}

      <View
        style={[styles.actionsCol, { bottom: tappedStop && !selectedLineId ? insets.bottom + 356 : insets.bottom + 24 }]}
        pointerEvents="box-none"
      >
        <Pressable
          onPress={() => setShowLines((v) => !v)}
          style={[styles.fab, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}
        >
          <MaterialCommunityIcons name="vector-polyline" size={20} color={showLines ? colors.primary : colors.textMuted} />
        </Pressable>
        <Pressable onPress={toggleStops} style={[styles.fab, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
          <MaterialCommunityIcons
            name={showStops ? "map-marker-multiple" : "map-marker-multiple-outline"}
            size={20}
            color={showStops ? colors.primary : colors.textMuted}
          />
        </Pressable>
        <Pressable onPress={goToMyLocation} style={[styles.fab, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
          <MaterialCommunityIcons name="crosshairs-gps" size={20} color={locating ? colors.primary : colors.textMuted} />
        </Pressable>
      </View>

      <View style={[styles.attribution, { bottom: insets.bottom + 6 }]} pointerEvents="none">
        <Text style={styles.attributionText}>© OpenStreetMap contributors</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    position: "absolute",
    left: 16,
    right: 16,
    top: 0,
    gap: 8,
  },
  filterScroll: {
    flexDirection: "row",
    borderRadius: 20,
    padding: 4,
    gap: 4,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  filterChip: {
    flex: 1,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  clearLinePill: {
    alignSelf: "flex-start",
    borderRadius: 15,
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  lineSelectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  clearLinePillTouch: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    height: 30,
  },
  saveLineFab: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  clearLineText: { fontSize: 12, fontWeight: "700" },
  actionsCol: {
    position: "absolute",
    right: 16,
    gap: 10,
  },
  stopSheetWrap: {
    position: "absolute",
    left: 16,
    right: 16,
  },
  stopSheet: {
    padding: 16,
    maxHeight: 340,
  },
  stopSheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  stopSheetTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  stopSheetMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  stopSheetClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  stopSheetSection: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.4,
    marginBottom: 8,
  },
  stopSheetList: {
    maxHeight: 168,
  },
  stopSheetEmpty: {
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 12,
  },
  stopSheetFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingTop: 12,
  },
  stopSheetFooterText: {
    fontSize: 13,
    fontWeight: "700",
  },
  fab: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  attribution: {
    position: "absolute",
    left: 12,
  },
  attributionText: {
    fontSize: 9,
    color: "rgba(107,114,128,0.9)",
  },
  zoomHintWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  zoomHintPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    height: 30,
    borderRadius: 15,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  zoomHintText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
