import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomMap, { type CustomMapHandle } from "@/components/CustomMap";
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
  const [savedLineIds, setSavedLineIds] = useState<string[]>([]);

  useEffect(() => {
    (async () => setSavedLineIds(await getJSON<string[]>(StorageKeys.savedLines, [])))();
  }, []);

  const toggleSaveSelectedLine = async () => {
    if (!selectedLineId) return;
    const isSaved = savedLineIds.includes(selectedLineId);
    const next = isSaved ? savedLineIds.filter((id) => id !== selectedLineId) : [...savedLineIds, selectedLineId];
    setSavedLineIds(next);
    await setJSON(StorageKeys.savedLines, next);
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
  const visibleLines = showLines
    ? TRANSIT_LINES.filter((l) => (filter === "all" ? true : l.mode === filter))
    : [];

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
        onStopPress={(id) => router.push(`/stop/${id}`)}
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

      <View style={[styles.actionsCol, { bottom: insets.bottom + 24 }]} pointerEvents="box-none">
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
});
