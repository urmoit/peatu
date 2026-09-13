import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Card from "@/components/Card";
import ModeBadge from "@/components/ModeBadge";
import ScreenHeader from "@/components/ScreenHeader";
import { ROUTE_OPTIONS } from "@/data/trips";
import { useLanguage } from "@/i18n/LanguageContext";
import { useTheme } from "@/theme/ThemeContext";

export default function Planner() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title={t("planner.title")} />

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        <View style={styles.formWrap}>
          <Card padding={12}>
            <View style={styles.formRow}>
              <View style={styles.connectorCol}>
                <View style={[styles.dot, { borderColor: colors.border }]} />
                <View style={[styles.connectorLine, { borderColor: colors.border }]} />
                <View style={[styles.square, { backgroundColor: colors.textFaint }]} />
              </View>
              <View style={styles.inputsCol}>
                <TextInput
                  value={from}
                  onChangeText={setFrom}
                  placeholder={t("planner.from")}
                  placeholderTextColor={colors.textFaint}
                  style={[styles.input, { backgroundColor: colors.surfaceAlt, color: colors.text }]}
                />
                <TextInput
                  value={to}
                  onChangeText={setTo}
                  placeholder={t("planner.to")}
                  placeholderTextColor={colors.textFaint}
                  style={[styles.input, { backgroundColor: colors.surfaceAlt, color: colors.text }]}
                />
              </View>
              <Pressable onPress={swap} style={[styles.swapBtn, { backgroundColor: colors.surfaceAlt }]}>
                <MaterialCommunityIcons name="swap-vertical" size={18} color={colors.textMuted} />
              </Pressable>
            </View>
          </Card>

          <View style={styles.chipRow}>
            <View style={[styles.chip, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
              <MaterialCommunityIcons name="calendar" size={16} color={colors.textFaint} />
              <Text style={[styles.chipText, { color: colors.textMuted }]}>{t("planner.today")}</Text>
            </View>
            <View style={[styles.chip, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
              <MaterialCommunityIcons name="clock-outline" size={16} color={colors.textFaint} />
              <Text style={[styles.chipText, { color: colors.textMuted }]}>{t("planner.now")}</Text>
            </View>
          </View>

          <Pressable style={[styles.planBtn, { backgroundColor: colors.primary }]}>
            <MaterialCommunityIcons name="magnify" size={18} color={colors.primaryText} />
            <Text style={[styles.planBtnText, { color: colors.primaryText }]}>{t("planner.planTrip")}</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
            {t("planner.routeOptions").toUpperCase()}
          </Text>
          <View style={{ gap: 12 }}>
            {ROUTE_OPTIONS.map((r) => (
              <Card key={r.id} onPress={() => router.push(`/route/${r.id}`)}>
                <View style={styles.optionHeader}>
                  <View style={styles.optionHeaderLeft}>
                    <Text style={[styles.optionDuration, { color: colors.text }]}>{r.totalDuration}</Text>
                    <Text style={[styles.optionTime, { color: colors.textFaint }]}>
                      {r.startTime} – {r.endTime}
                    </Text>
                  </View>
                  <Text style={[styles.optionPrice, { color: colors.textMuted }]}>{r.price}</Text>
                </View>

                <View style={styles.legRow}>
                  {r.legs.map((leg, i) => (
                    <View key={leg.id} style={styles.legItem}>
                      <ModeBadge mode={leg.mode} size="sm" />
                      {i < r.legs.length - 1 && <View style={[styles.legDash, { backgroundColor: colors.border }]} />}
                    </View>
                  ))}
                </View>

                <View style={[styles.optionFooter, { borderTopColor: colors.border }]}>
                  <View style={styles.transferInfo}>
                    <MaterialCommunityIcons name="map-marker" size={14} color={colors.textFaint} />
                    <Text style={[styles.transferText, { color: colors.textMuted }]}>
                      {r.transfers === 0
                        ? t("planner.direct")
                        : t(r.transfers > 1 ? "planner.transfers" : "planner.transfer", { count: r.transfers })}
                    </Text>
                  </View>
                  <View style={styles.lineLabels}>
                    {r.legs
                      .filter((l) => l.mode !== "walk")
                      .map((l) => (
                        <Text key={l.id} style={[styles.lineLabel, { color: colors.primary }]}>
                          {l.line}
                        </Text>
                      ))}
                  </View>
                </View>
              </Card>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  formWrap: { paddingHorizontal: 16, paddingTop: 16 },
  formRow: { flexDirection: "row", gap: 12 },
  connectorCol: { alignItems: "center", paddingTop: 14, paddingBottom: 14 },
  dot: { width: 10, height: 10, borderRadius: 5, borderWidth: 2 },
  connectorLine: { flex: 1, width: 0, borderLeftWidth: 1, borderStyle: "dashed", marginVertical: 4 },
  square: { width: 8, height: 8, borderRadius: 2 },
  inputsCol: { flex: 1, gap: 8 },
  input: { height: 44, borderRadius: 12, paddingHorizontal: 12, fontSize: 14, fontWeight: "500" },
  swapBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", marginTop: 4 },
  chipRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  chip: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  chipText: { fontSize: 13, fontWeight: "600" },
  planBtn: {
    height: 50,
    borderRadius: 18,
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  planBtnText: { fontSize: 14, fontWeight: "700" },
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 12, fontWeight: "800", letterSpacing: 0.4, marginBottom: 12 },
  optionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  optionHeaderLeft: { flexDirection: "row", alignItems: "baseline", gap: 8 },
  optionDuration: { fontSize: 18, fontWeight: "800" },
  optionTime: { fontSize: 12 },
  optionPrice: { fontSize: 14, fontWeight: "700" },
  legRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
  legItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legDash: { width: 16, height: 1 },
  optionFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth },
  transferInfo: { flexDirection: "row", alignItems: "center", gap: 6 },
  transferText: { fontSize: 12 },
  lineLabels: { flexDirection: "row", gap: 8 },
  lineLabel: { fontSize: 12, fontWeight: "700" },
});
