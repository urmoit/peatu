import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import EmptyState from "@/components/EmptyState";
import StopRow from "@/components/StopRow";
import { STOPS } from "@/data/stops";
import { useLanguage } from "@/i18n/LanguageContext";
import { useTheme } from "@/theme/ThemeContext";

export default function SearchScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return STOPS;
    return STOPS.filter(
      (s) => s.name.toLowerCase().includes(q) || s.area.toLowerCase().includes(q)
    );
  }, [query]);

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
        {t("search.resultsCount", { count: results.length })}
      </Text>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={16}
        renderItem={({ item }) => (
          <StopRow
            stop={item}
            onPress={() => {
              router.replace(`/stop/${item.id}`);
            }}
          />
        )}
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
});
