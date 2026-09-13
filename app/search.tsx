import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import EmptyState from "@/components/EmptyState";
import LineRow from "@/components/LineRow";
import SectionHeader from "@/components/SectionHeader";
import StopRow from "@/components/StopRow";
import { STOPS } from "@/data/stops";
import { TRANSIT_LINES } from "@/data/lines";
import { useLanguage } from "@/i18n/LanguageContext";
import { useTheme } from "@/theme/ThemeContext";
import type { Stop, TransitLine } from "@/types";
import { StorageKeys, getJSON, setJSON } from "@/utils/storage";

type ResultItem = { kind: "stop"; data: Stop } | { kind: "line"; data: TransitLine };

export default function SearchScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [savedLineIds, setSavedLineIds] = useState<string[]>([]);

  useEffect(() => {
    (async () => setSavedLineIds(await getJSON<string[]>(StorageKeys.savedLines, [])))();
  }, []);

  const toggleSaveLine = async (lineId: string) => {
    const isSaved = savedLineIds.includes(lineId);
    const next = isSaved ? savedLineIds.filter((id) => id !== lineId) : [...savedLineIds, lineId];
    setSavedLineIds(next);
    await setJSON(StorageKeys.savedLines, next);
  };

  const { stopResults, lineResults } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const stops = q
      ? STOPS.filter((s) => s.name.toLowerCase().includes(q) || s.area.toLowerCase().includes(q))
      : STOPS;
    const lines = q
      ? TRANSIT_LINES.filter((l) => l.number.toLowerCase() === q || l.number.toLowerCase().includes(q) || l.name.toLowerCase().includes(q))
      : [];
    return { stopResults: stops, lineResults: lines };
  }, [query]);

  const items: ResultItem[] = useMemo(() => {
    const lineItems: ResultItem[] = lineResults.map((l) => ({ kind: "line", data: l }));
    const stopItems: ResultItem[] = stopResults.map((s) => ({ kind: "stop", data: s }));
    return [...lineItems, ...stopItems];
  }, [stopResults, lineResults]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 8 }]}>
      <View style={styles.searchRow}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMuted} />
        </Pressable>
        <View style={[styles.inputWrap, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
          <MaterialCommunityIcons name="magnify" size={18} color={colors.textFaint} />
          <TextInput
            autoFocus
            value={query}
            onChangeText={setQuery}
            placeholder={t("search.placeholder")}
            placeholderTextColor={colors.textFaint}
            style={[styles.input, { color: colors.text }]}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")} hitSlop={8}>
              <MaterialCommunityIcons name="close" size={18} color={colors.textFaint} />
            </Pressable>
          )}
        </View>
      </View>

      <Text style={[styles.resultsCount, { color: colors.textFaint }]}>
        {t("search.resultsCount", { count: stopResults.length })}
      </Text>

      <FlatList
        data={items}
        keyExtractor={(item) => `${item.kind}-${item.data.id}`}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={16}
        ListHeaderComponent={
          lineResults.length > 0 ? (
            <View style={{ marginBottom: 4 }}>
              <SectionHeader title={t("search.linesSection")} />
            </View>
          ) : null
        }
        renderItem={({ item, index }) => {
          if (item.kind === "line") {
            return (
              <LineRow
                line={item.data}
                saved={savedLineIds.includes(item.data.id)}
                onToggleSave={() => toggleSaveLine(item.data.id)}
                onPress={() => router.push({ pathname: "/(tabs)/map", params: { lineId: item.data.id } })}
              />
            );
          }
          const isFirstStop = index === lineResults.length;
          return (
            <View>
              {isFirstStop && lineResults.length > 0 && (
                <View style={{ marginTop: 8, marginBottom: 4 }}>
                  <SectionHeader title={t("search.stopsSection")} />
                </View>
              )}
              <StopRow stop={item.data} onPress={() => router.replace(`/stop/${item.data.id}`)} />
            </View>
          );
        }}
        ListFooterComponent={
          lineResults.length > 0 ? (
            <Text style={[styles.note, { color: colors.textFaint }]}>{t("search.sampleLinesNote")}</Text>
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            icon="map-marker-off-outline"
            title={t("search.noResultsTitle")}
            subtitle={t("search.noResultsSubtitle")}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: { width: 24 },
  inputWrap: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    paddingVertical: 0,
  },
  resultsCount: {
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  note: {
    fontSize: 11,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 8,
  },
});
