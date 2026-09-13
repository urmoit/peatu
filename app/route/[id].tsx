import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Card from "@/components/Card";
import LineBadge from "@/components/LineBadge";
import ModeIcon from "@/components/ModeIcon";
import ScreenHeader from "@/components/ScreenHeader";
import { getRouteById } from "@/data/trips";
import { useLanguage } from "@/i18n/LanguageContext";
import { modeColors } from "@/theme/colors";
import { useTheme } from "@/theme/ThemeContext";

export default function RouteDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, mode: themeMode } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const route = getRouteById(id);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader
        title={t("route.title")}
        subtitle={`${route.startTime} – ${route.endTime} · ${route.totalDuration}`}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
        <View style={styles.summaryWrap}>
          <Card>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: colors.textFaint }]}>{t("route.duration")}</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>{route.totalDuration}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: colors.textFaint }]}>{t("route.transfers")}</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>{route.transfers}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: colors.textFaint }]}>{t("route.price")}</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>{route.price}</Text>
              </View>
            </View>
          </Card>
        </View>

        <View style={styles.timeline}>
          {route.legs.map((leg, i) => {
            const isWalk = leg.mode === "walk";
            const isFirst = i === 0;
            const isLast = i === route.legs.length - 1;
            const c = modeColors[leg.mode];
            const lineColor = themeMode === "dark" ? c.textDark : c.text;

            return (
              <View key={leg.id} style={styles.legRow}>
                <View style={styles.connectorCol}>
                  {isFirst ? (
                    <MaterialCommunityIcons name="circle" size={12} color={colors.textFaint} />
                  ) : (
                    <View
                      style={[
                        styles.node,
                        isWalk
                          ? { borderWidth: 2, borderColor: colors.border, borderStyle: "dashed", backgroundColor: "transparent" }
                          : { backgroundColor: lineColor },
                      ]}
                    />
                  )}
                  {!isLast && (
                    <View
                      style={[
                        styles.connectorLine,
                        isWalk
                          ? { borderLeftWidth: 2, borderStyle: "dashed", borderColor: colors.border }
                          : { backgroundColor: lineColor, width: 3, borderLeftWidth: 0 },
                      ]}
                    />
                  )}
                  {isLast && <MaterialCommunityIcons name="square" size={10} color={colors.textFaint} />}
                </View>

                <View style={styles.legContent}>
                  <View style={styles.legHeader}>
                    {isWalk ? (
                      <View style={[styles.walkIcon, { backgroundColor: colors.surfaceAlt }]}>
                        <ModeIcon mode="walk" size={14} color={colors.textFaint} />
                      </View>
                    ) : (
                      <LineBadge line={leg.line ?? ""} mode={leg.mode} size="sm" />
                    )}
                    <Text style={[styles.legTime, { color: colors.textMuted }]}>
                      {leg.startTime} – {leg.endTime} · {leg.duration}
                    </Text>
                  </View>
                  <Text style={[styles.stopText, { color: colors.text }]}>{leg.fromStop}</Text>
                  <Text style={[styles.legMeta, { color: colors.textFaint }]}>
                    {isWalk ? t("route.walk") : `${leg.mode.charAt(0).toUpperCase()}${leg.mode.slice(1)} ${leg.line ?? ""}`}
                    {leg.stops ? ` · ${leg.stops} stops` : ""}
                  </Text>
                  <Text style={[styles.stopText, { color: colors.text }]}>{leg.toStop}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { backgroundColor: colors.surface, borderTopColor: colors.border, paddingBottom: insets.bottom + 16 },
        ]}
      >
        <Pressable style={[styles.startBtn, { backgroundColor: colors.primary }]}>
          <MaterialCommunityIcons name="navigation-variant" size={20} color={colors.primaryText} />
          <Text style={[styles.startBtnText, { color: colors.primaryText }]}>{t("route.startTrip")}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryWrap: { paddingHorizontal: 16, paddingTop: 16 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryItem: {},
  summaryLabel: { fontSize: 11 },
  summaryValue: { fontSize: 22, fontWeight: "800", marginTop: 2 },
  timeline: { paddingHorizontal: 16, marginTop: 20 },
  legRow: { flexDirection: "row", gap: 14 },
  connectorCol: { width: 20, alignItems: "center" },
  node: { width: 12, height: 12, borderRadius: 6 },
  connectorLine: { flex: 1, minHeight: 44, marginVertical: 2 },
  legContent: { flex: 1, paddingBottom: 22 },
  legHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  walkIcon: { width: 28, height: 28, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  legTime: { fontSize: 12, fontWeight: "500" },
  stopText: { fontSize: 15, fontWeight: "700" },
  legMeta: { fontSize: 12, marginVertical: 3 },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  startBtn: {
    height: 52,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  startBtnText: { fontSize: 16, fontWeight: "700" },
});
