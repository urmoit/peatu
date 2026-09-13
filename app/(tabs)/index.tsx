import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HeaderGlow from "@/components/HeaderGlow";
import SectionHeader from "@/components/SectionHeader";
import StopRow from "@/components/StopRow";
import TripCard from "@/components/TripCard";
import { STOPS } from "@/data/stops";
import { RECENT_TRIPS, getDeparturesForStop } from "@/data/trips";
import { useLanguage } from "@/i18n/LanguageContext";
import { useTheme } from "@/theme/ThemeContext";
import type { Stop } from "@/types";
import { formatDistance, haversineKm } from "@/utils/geo";

export default function Home() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);

  const useMyLocation = useCallback(async () => {
    try {
      setLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
    } catch {
      // silently ignore — user can retry
    } finally {
      setLocating(false);
    }
  }, []);

  const sortedStops: Stop[] = coords
    ? [...STOPS].sort(
        (a, b) => haversineKm(coords.lat, coords.lng, a.lat, a.lng) - haversineKm(coords.lat, coords.lng, b.lat, b.lng)
      )
    : STOPS;

  const nearby = sortedStops.slice(0, 8);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <HeaderGlow color="#3B82F6" />
      <FlatList
        data={nearby}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        renderItem={({ item }) => (
          <View style={styles.stopWrap}>
            <StopRow
              stop={item}
              distanceLabel={coords ? formatDistance(haversineKm(coords.lat, coords.lng, item.lat, item.lng)) : undefined}
              etaLabel={String(getDeparturesForStop(item.id)[0]?.etaMin ?? "–")}
              onPress={() => router.push(`/stop/${item.id}`)}
            />
          </View>
        )}
        ListHeaderComponent={
          <View>
            <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
              <View style={styles.headerRow}>
                <View>
                  <View style={[styles.eyebrowPill, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
                    <View style={[styles.eyebrowDot, { backgroundColor: colors.primary }]} />
                    <Text style={[styles.eyebrow, { color: colors.textMuted }]}>{t("home.estonia")}</Text>
                  </View>
                  <Text style={[styles.title, { color: colors.text }]}>{t("app.name")}</Text>
                </View>
                <Pressable
                  onPress={useMyLocation}
                  style={[styles.locateBtn, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}
                >
                  <MaterialCommunityIcons
                    name="crosshairs-gps"
                    size={20}
                    color={locating ? colors.primary : colors.textMuted}
                  />
                </Pressable>
              </View>

              <Pressable
                onPress={() => router.push("/search")}
                style={[styles.searchBar, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}
              >
                <MaterialCommunityIcons name="magnify" size={20} color={colors.textFaint} />
                <Text style={[styles.searchPlaceholder, { color: colors.textFaint }]}>{t("home.searchPlaceholder")}</Text>
              </Pressable>
            </View>

            <View style={styles.section}>
              <SectionHeader title={t("home.recentTrips")} />
              <FlatList
                data={RECENT_TRIPS}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16 }}
                renderItem={({ item }) => <TripCard trip={item} onPress={() => router.push("/planner")} />}
              />
            </View>

            <View style={[styles.section, { paddingHorizontal: 16 }]}>
              <SectionHeader
                title={t("home.nearbyStops")}
                action={
                  <Pressable onPress={useMyLocation} hitSlop={8}>
                    <Text style={[styles.sortLink, { color: colors.primary }]}>
                      {coords ? t("home.sortedByDistance") : t("home.useCurrentLocation")}
                    </Text>
                  </Pressable>
                }
              />
            </View>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 18,
  },
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
  eyebrowDot: { width: 6, height: 6, borderRadius: 3 },
  eyebrow: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  locateBtn: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  searchBar: {
    height: 52,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  searchPlaceholder: {
    fontSize: 14,
    fontWeight: "500",
  },
  section: {
    marginTop: 24,
  },
  sortLink: {
    fontSize: 12,
    fontWeight: "700",
  },
  stopWrap: {
    paddingHorizontal: 16,
  },
});
