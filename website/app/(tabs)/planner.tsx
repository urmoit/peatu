import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, Pressable, FlatList, ScrollView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { STOPS } from "@/data/stops";
import { ROUTE_OPTIONS, type RouteOption } from "@/data/trips";
import type { Stop } from "@/types";

export default function Planner() {
  const { colors, mode } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [fromStop, setFromStop] = useState<Stop | null>(null);
  const [toStop, setToStop] = useState<Stop | null>(null);
  const [showFromSearch, setShowFromSearch] = useState(false);
  const [showToSearch, setShowToSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [showRoutes, setShowRoutes] = useState(false);

  const filteredStops = STOPS.filter(
    (stop) =>
      stop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stop.lines.some((line) => line.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handlePlanTrip = () => {
    if (fromStop && toStop) {
      setRoutes(ROUTE_OPTIONS);
      setShowRoutes(true);
    }
  };

  const swapStops = () => {
    const temp = fromStop;
    setFromStop(toStop);
    setToStop(temp);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 16 : 12) }]}>
        <Text style={[styles.eyebrow, { color: colors.textFaint }]}>{t("home.title")}</Text>
        <Text style={[styles.title, { color: colors.text }]}>{t("planner.title")}</Text>
      </View>

      <View style={styles.inputSection}>
        <View style={styles.inputRow}>
          <Pressable
            style={[
              styles.inputField,
              { backgroundColor: colors.surface, borderColor: colors.border, boxShadow: `0 1px 3px ${colors.shadow}` },
            ]}
            onPress={() => setShowFromSearch(true)}
            aria-label={t("planner.from")}
          >
            <View style={styles.inputIcon}>
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
              </svg>
            </View>
            <View style={styles.inputContent}>
              <Text style={[styles.inputLabel, { color: colors.textFaint }]}>{t("planner.from")}</Text>
              <Text style={[styles.inputValue, { color: fromStop ? colors.text : colors.textMuted }]}>
                {fromStop?.name || t("planner.from")}
              </Text>
            </View>
          </Pressable>

          <Pressable
            style={[styles.swapBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
            onPress={swapStops}
            disabled={!fromStop && !toStop}
            aria-label="Swap from and to"
          >
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={fromStop || toStop ? colors.primary : colors.textFaint} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 16l-4-4 4-4" />
              <path d="M17 8l4 4-4 4" />
              <line x1="3" y1="12" x2="21" y2="12" />
            </svg>
          </Pressable>

          <Pressable
            style={[
              styles.inputField,
              { backgroundColor: colors.surface, borderColor: colors.border, boxShadow: `0 1px 3px ${colors.shadow}` },
            ]}
            onPress={() => setShowToSearch(true)}
            aria-label={t("planner.to")}
          >
            <View style={styles.inputIcon}>
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.accentGreen} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </View>
            <View style={styles.inputContent}>
              <Text style={[styles.inputLabel, { color: colors.textFaint }]}>{t("planner.to")}</Text>
              <Text style={[styles.inputValue, { color: toStop ? colors.text : colors.textMuted }]}>
                {toStop?.name || t("planner.to")}
              </Text>
            </View>
          </Pressable>
        </View>

        <Pressable
          style={[
            styles.planBtn,
            { backgroundColor: (fromStop && toStop) ? colors.primary : colors.border },
            { boxShadow: (fromStop && toStop) ? `0 4px 12px ${colors.primary}40` : "none" },
          ]}
          onPress={handlePlanTrip}
          disabled={!(fromStop && toStop)}
          aria-label={t("planner.planTrip")}
        >
          <Text style={[
            styles.planBtnText,
            { color: (fromStop && toStop) ? colors.primaryText : colors.textMuted }
          ]}>
            {t("planner.planTrip")}
          </Text>
        </Pressable>
      </View>

      {showRoutes && routes.length > 0 && (
        <View style={styles.routesSection}>
          <Text style={[styles.sectionTitle, { color: colors.text, paddingHorizontal: 16 }]}>{t("planner.routeOptions")}</Text>
          <FlatList
            data={routes}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <Pressable style={styles.routeCard} onPress={() => {}} aria-label={`${item.duration} min, ${item.transfers} transfers`}>
                <View style={styles.routeHeader}>
                  <View style={styles.routeMeta}>
                    <Text style={[styles.routeDuration, { color: colors.primary }]}>{item.duration} min</Text>
                    <View style={styles.routeTransfers}>
                      {item.transfers === 0 ? (
                        <Text style={[styles.directBadge, { color: colors.accentGreen, backgroundColor: modeColors.train.bg }]}>{t("planner.direct")}</Text>
                      ) : (
                        <>
                          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M7 16l-4-4 4-4" />
                            <path d="M17 8l4 4-4 4" />
                            <line x1="3" y1="12" x2="21" y2="12" />
                          </svg>
                          <Text style={[styles.transferCount, { color: colors.textMuted }]}>{item.transfers} {item.transfers === 1 ? "transfer" : "transfers"}</Text>
                        </>
                      )}
                    </View>
                  </View>
                  <View style={styles.routeTimes}>
                    <Text style={[styles.routeTime, { color: colors.text }]}>{item.departure}</Text>
                    <Text style={[styles.routeTime, { color: colors.textMuted }]}>{item.arrival}</Text>
                  </View>
                </View>
                <View style={styles.routeLegs}>
                  {item.legs.map((leg, i) => (
                    <View key={i} style={styles.legRow}>
                      <View style={[styles.legIcon, { backgroundColor: getLegColor(leg.type, mode) }]}>
                        {getLegIcon(leg.type)}
                      </View>
                      <View style={styles.legInfo}>
                        <Text style={[styles.legLine, { color: getLegColor(leg.type, mode) }]}>{leg.line || (leg.type === "walk" ? t("route.walk") : "")}</Text>
                        <Text style={[styles.legRoute, { color: colors.textMuted }]}>{leg.from} → {leg.to}</Text>
                      </View>
                      <View style={styles.legTime}>
                        {leg.departure && leg.arrival && (
                          <Text style={[styles.legTimeText, { color: colors.textFaint }]}>{leg.departure} – {leg.arrival}</Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              </Pressable>
            )}
          />
        </View>
      )}

      {(showFromSearch || showToSearch) && (
        <View style={styles.modalOverlay} pointerEvents="box-none">
          <View style={[styles.modalSheet, { backgroundColor: colors.surface }]} pointerEvents="auto">
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{showFromSearch ? t("planner.from") : t("planner.to")}</Text>
              <Pressable onPress={() => { setShowFromSearch(false); setShowToSearch(false); setSearchQuery(""); }} style={styles.modalClose} aria-label="Close">
                <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </Pressable>
            </View>
            <View style={styles.modalSearch}>
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.textFaint} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                style={styles.modalSearchInput}
                placeholder={t("search.placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </View>
            <FlatList
              data={filteredStops}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.modalStopItem}
                  onPress={() => {
                    if (showFromSearch) setFromStop(item);
                    else setToStop(item);
                    setShowFromSearch(false);
                    setShowToSearch(false);
                    setSearchQuery("");
                  }}
                >
                  <Text style={[styles.modalStopName, { color: colors.text }]}>{item.name}</Text>
                  <View style={styles.modalStopModes}>
                    {item.modes.slice(0, 3).map((m) => (
                      <View key={m} style={[styles.modalModeBadge, { backgroundColor: getModeColor(m, mode) }]}>
                        <Text style={styles.modalModeBadgeText}>{m.charAt(0).toUpperCase()}</Text>
                      </View>
                    ))}
                  </View>
                </Pressable>
              )}
            />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const getModeColor = (mode: string, themeMode: string) => {
  const lightColors: Record<string, string> = {
    bus: "#EFF6FF",
    train: "#F0FDF4",
    tram: "#FEFCE8",
    trolley: "#FEFCE8",
  };
  const darkColors: Record<string, string> = {
    bus: "#0B2559",
    train: "#0B3B22",
    tram: "#3B310B",
    trolley: "#3B310B",
  };
  return themeMode === "dark" ? darkColors[mode] || "#1F2937" : lightColors[mode] || "#F3F4F6";
};

const getLegColor = (type: string, themeMode: string) => {
  const lightColors: Record<string, string> = {
    walk: "#F3F4F6",
    bus: "#2563EB",
    train: "#16A34A",
    tram: "#CA8A04",
    trolley: "#CA8A04",
  };
  const darkColors: Record<string, string> = {
    walk: "#1F2937",
    bus: "#60A5FA",
    train: "#4ADE80",
    tram: "#FACC15",
    trolley: "#FACC15",
  };
  return themeMode === "dark" ? darkColors[type] || "#6B7280" : lightColors[type] || "#6B7280";
};

const getLegIcon = (type: string) => {
  const icons: Record<string, string> = {
    walk: "🚶",
    bus: "🚌",
    train: "🚂",
    tram: "🚋",
    trolley: "🚍",
  };
  return icons[type] || "📍";
};

const modeColors = {
  bus: { bg: "#EFF6FF", bgDark: "#0B2559", text: "#2563EB", textDark: "#60A5FA" },
  train: { bg: "#F0FDF4", bgDark: "#0B3B22", text: "#16A34A", textDark: "#4ADE80" },
  tram: { bg: "#FEFCE8", bgDark: "#3B310B", text: "#CA8A04", textDark: "#FACC15" },
  trolley: { bg: "#FEFCE8", bgDark: "#3B310B", text: "#CA8A04", textDark: "#FACC15" },
  walk: { bg: "#F3F4F6", bgDark: "#1F2430", text: "#6B7280", textDark: "#9CA3AF" },
} as const;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: "flex-start",
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
  inputSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  inputField: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    minHeight: 64,
  },
  inputIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(37,99,235,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  inputContent: { flex: 1 },
  inputLabel: { fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 },
  inputValue: { fontSize: 16, fontWeight: "600" },
  swapBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  planBtn: {
    width: "100%",
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  planBtnText: { fontSize: 16, fontWeight: "700" },
  routesSection: { paddingHorizontal: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  routeCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    backgroundColor: "inherit",
    borderWidth: 1,
    borderColor: "transparent",
  },
  routeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  routeMeta: { flexDirection: "row", alignItems: "center", gap: 10 },
  routeDuration: { fontSize: 20, fontWeight: "800" },
  routeTransfers: { flexDirection: "row", alignItems: "center", gap: 6 },
  directBadge: { fontSize: 11, fontWeight: "700", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  transferCount: { fontSize: 12, fontWeight: "600" },
  routeTimes: { alignItems: "flex-end" },
  routeTime: { fontSize: 13, fontWeight: "600", marginBottom: 1 },
  routeLegs: { gap: 8 },
  legRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  legIcon: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  legInfo: { flex: 1 },
  legLine: { fontSize: 12, fontWeight: "700", marginBottom: 2 },
  legRoute: { fontSize: 13, fontWeight: "500" },
  legTime: { alignItems: "flex-end" },
  legTimeText: { fontSize: 11 },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 100,
  },
  modalSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
    overflow: "hidden",
  },
  modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: "rgba(107,114,128,0.3)", alignSelf: "center", marginTop: 10, marginBottom: 16 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: "800" },
  modalClose: { padding: 8 },
  modalSearch: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 20, marginBottom: 12 },
  modalSearchInput: { flex: 1, fontSize: 16, paddingVertical: 12, color: "inherit" },
  modalStopItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: "rgba(107,114,128,0.1)" },
  modalStopName: { fontSize: 16, fontWeight: "600" },
  modalStopModes: { flexDirection: "row", gap: 4 },
  modalModeBadge: { height: 20, borderRadius: 10, paddingHorizontal: 8, alignItems: "center", justifyContent: "center" },
  modalModeBadgeText: { fontSize: 10, fontWeight: "800", color: "#FFFFFF" },
});