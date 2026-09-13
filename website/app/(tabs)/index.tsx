import React, { useCallback, useState, useEffect } from "react";
import { StyleSheet, View, FlatList, Pressable, Text, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { STOPS, getDeparturesForStop } from "@/data/stops";
import { RECENT_TRIPS } from "@/data/trips";
import { formatDistance, haversineKm } from "@/utils/helpers";
import type { Stop } from "@/types";

const TALLINN_CENTER = { lat: 59.437, lng: 24.7536 };

export default function Home() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const useMyLocation = useCallback(async () => {
    if (typeof navigator === "undefined") return;
    try {
      setLocating(true);
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 });
      });
      setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
    } catch {
      // silently ignore
    } finally {
      setLocating(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && !coords) {
      const saved = localStorage.getItem("peatu-web:last-location");
      if (saved) {
        try {
          setCoords(JSON.parse(saved));
        } catch {}
      }
    }
  }, [coords]);

  useEffect(() => {
    if (coords && typeof window !== "undefined") {
      localStorage.setItem("peatu-web:last-location", JSON.stringify(coords));
    }
  }, [coords]);

  const sortedStops: Stop[] = coords
    ? [...STOPS].sort(
        (a, b) =>
          haversineKm(coords.lat, coords.lng, a.lat, a.lng) - haversineKm(coords.lat, coords.lng, b.lat, b.lng)
      )
    : STOPS;

  const nearby = sortedStops.slice(0, 8);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 16 : 12) }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.eyebrow, { color: colors.textFaint }]}>{t("home.title")}</Text>
            <Text style={[styles.title, { color: colors.text }]}>{t("app.name")}</Text>
          </View>
          <Pressable
            onPress={useMyLocation}
            style={[styles.locateBtn, { backgroundColor: colors.surface, boxShadow: `0 2px 8px ${colors.shadow}` }]}
            aria-label={locating ? "Locating..." : "Use current location"}
          >
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={locating ? colors.primary : colors.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
            </svg>
          </Pressable>
        </View>

        <Pressable
          onPress={() => setSearchFocused(true)}
          style={[styles.searchBar, { backgroundColor: colors.surface, boxShadow: `0 3px 10px ${colors.shadow}` }]}
          aria-label={t("home.searchPlaceholder")}
        >
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.textFaint} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <Text style={[styles.searchPlaceholder, { color: colors.textFaint }]}>{t("home.searchPlaceholder")}</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("home.recentTrips")}</Text>
        </View>
        <FlatList
          data={RECENT_TRIPS}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingRight: 16 }}
          renderItem={({ item }) => (
            <Pressable style={styles.tripCard} onPress={() => {}} aria-label={`${item.from} to ${item.to}`}>
              <View style={styles.tripCardContent}>
                <View style={styles.tripRoute}>
                  <Text style={[styles.tripFrom, { color: colors.text }]}>{item.from}</Text>
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                  <Text style={[styles.tripTo, { color: colors.text }]}>{item.to}</Text>
                </View>
                <View style={styles.tripMeta}>
                  <Text style={[styles.tripDuration, { color: colors.primary }]}>{item.duration} min</Text>
                  {item.transfers > 0 && (
                    <Text style={[styles.tripTransfers, { color: colors.textMuted }]}>{item.transfers} {item.transfers === 1 ? "transfer" : "transfers"}</Text>
                  )}
                </View>
              </View>
            </Pressable>
          )}
        />
      </View>

      <View style={[styles.section, { paddingHorizontal: 16 }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("home.nearbyStops")}</Text>
          <Pressable onPress={useMyLocation} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} aria-label={coords ? t("home.sortedByDistance") : t("home.useCurrentLocation")}>
            <Text style={[styles.sortLink, { color: colors.primary }]}>
              {coords ? t("home.sortedByDistance") : t("home.useCurrentLocation")}
            </Text>
          </Pressable>
        </View>
        <FlatList
          data={nearby}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const distance = coords ? haversineKm(coords.lat, coords.lng, item.lat, item.lng) : null;
            const departures = getDeparturesForStop(item.id);
            const nextDeparture = departures[0];
            return (
              <View style={styles.stopWrap}>
                <Pressable style={styles.stopCard} onPress={() => {}} aria-label={`${item.name}, ${nextDeparture ? `${nextDeparture.etaMin} min` : "no departures"}`}>
                  <View style={styles.stopMain}>
                    <View style={styles.stopInfo}>
                      <Text style={[styles.stopName, { color: colors.text }]}>{item.name}</Text>
                      <View style={styles.stopMeta}>
                        {distance !== null && (
                          <Text style={[styles.stopDistance, { color: colors.textMuted }]}>{formatDistance(distance)}</Text>
                        )}
                        <View style={styles.modeBadges}>
                          {item.modes.slice(0, 3).map((mode) => (
                            <View key={mode} style={[styles.modeBadge, { backgroundColor: getModeColor(mode, colors) }]}>
                              <Text style={styles.modeBadgeText}>{mode.charAt(0).toUpperCase()}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    </View>
                    <View style={styles.stopNext}>
                      {nextDeparture ? (
                        <>
                          <Text style={[styles.nextEta, { color: colors.primary }]}>{nextDeparture.etaMin} min</Text>
                          <Text style={[styles.nextLine, { color: colors.textMuted }]}>{nextDeparture.line}</Text>
                        </>
                      ) : (
                        <Text style={[styles.noDepartures, { color: colors.textFaint }]}>{t("stop.noDepartures")}</Text>
                      )}
                    </View>
                  </View>
                </Pressable>
              </View>
            );
          }}
        />
      </View>

      <View style={styles.bottomSpacer} />
    </View>
  );
}

const getModeColor = (mode: string, colors: any) => {
  const modeColors: Record<string, string> = {
    bus: "#2563EB",
    train: "#16A34A",
    tram: "#CA8A04",
    trolley: "#CA8A04",
  };
  return modeColors[mode] || colors.primary;
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  locateBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBar: {
    height: 52,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
  },
  searchPlaceholder: {
    fontSize: 15,
    fontWeight: "500",
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  sortLink: {
    fontSize: 13,
    fontWeight: "600",
  },
  tripCard: {
    width: 280,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
  },
  tripCardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tripRoute: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tripFrom: { fontSize: 14, fontWeight: "600" },
  tripTo: { fontSize: 14, fontWeight: "600", color: "inherit" },
  tripMeta: { alignItems: "flex-end" },
  tripDuration: { fontSize: 16, fontWeight: "700" },
  tripTransfers: { fontSize: 11, marginTop: 2 },
  stopWrap: { paddingHorizontal: 16, marginBottom: 8 },
  stopCard: {
    backgroundColor: "inherit",
    borderRadius: 14,
    padding: 14,
  },
  stopMain: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  stopInfo: { flex: 1 },
  stopName: { fontSize: 16, fontWeight: "700", marginBottom: 6 },
  stopMeta: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  stopDistance: { fontSize: 12, fontWeight: "500" },
  modeBadges: { flexDirection: "row", gap: 4 },
  modeBadge: { width: 20, height: 20, borderRadius: 4, alignItems: "center", justifyContent: "center" },
  modeBadgeText: { fontSize: 10, fontWeight: "800", color: "#FFFFFF" },
  stopNext: { alignItems: "flex-end" },
  nextEta: { fontSize: 18, fontWeight: "800", marginBottom: 2 },
  nextLine: { fontSize: 12, fontWeight: "500" },
  noDepartures: { fontSize: 12 },
  bottomSpacer: { height: 100 },
});