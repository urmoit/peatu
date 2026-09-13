import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Card from "@/components/Card";
import { LanguageDropdownRow } from "@/components/LanguageSwitcher";
import ToggleSwitch from "@/components/ToggleSwitch";
import { ROADMAP } from "@/data/trips";
import { useLanguage } from "@/i18n/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";
import { useTheme } from "@/theme/ThemeContext";
import type { RoadmapItem } from "@/types";
import { StorageKeys, getJSON, setJSON } from "@/utils/storage";

const MAP_FILTERS = [
  { key: "all", labelKey: "map.filter.all" as TranslationKey },
  { key: "frequent", labelKey: "map.filter.bus" as TranslationKey },
  { key: "regular", labelKey: "map.filter.train" as TranslationKey },
  { key: "local", labelKey: "map.filter.tram" as TranslationKey },
  { key: "trolley", labelKey: "map.filter.trolley" as TranslationKey },
];

const ROADMAP_KEYS: { titleKey: TranslationKey; detailKey: TranslationKey }[] = [
  { titleKey: "roadmap.item1.title", detailKey: "roadmap.item1.detail" },
  { titleKey: "roadmap.item2.title", detailKey: "roadmap.item2.detail" },
  { titleKey: "roadmap.item3.title", detailKey: "roadmap.item3.detail" },
  { titleKey: "roadmap.item4.title", detailKey: "roadmap.item4.detail" },
  { titleKey: "roadmap.item5.title", detailKey: "roadmap.item5.detail" },
];

function RoadmapBadge({ status }: { status: RoadmapItem["status"] }) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  if (status === "done") {
    return (
      <View style={[styles.roadmapBadge, { backgroundColor: `${colors.accentGreen}22` }]}>
        <MaterialCommunityIcons name="check" size={12} color={colors.accentGreen} />
        <Text style={[styles.roadmapBadgeText, { color: colors.accentGreen }]}>{t("roadmap.done")}</Text>
      </View>
    );
  }
  if (status === "next") {
    return (
      <View style={[styles.roadmapBadge, { backgroundColor: `${colors.primary}22` }]}>
        <MaterialCommunityIcons name="rocket-launch-outline" size={12} color={colors.primary} />
        <Text style={[styles.roadmapBadgeText, { color: colors.primary }]}>{t("roadmap.next")}</Text>
      </View>
    );
  }
  return (
    <View style={[styles.roadmapBadge, { backgroundColor: colors.surfaceAlt }]}>
      <MaterialCommunityIcons name="circle-outline" size={12} color={colors.textFaint} />
      <Text style={[styles.roadmapBadgeText, { color: colors.textFaint }]}>{t("roadmap.later")}</Text>
    </View>
  );
}

function SettingsRow({
  icon,
  title,
  subtitle,
  right,
  isLast,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  title: string;
  subtitle: string;
  right?: React.ReactNode;
  isLast?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.row, !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
      <View style={[styles.rowIcon, { backgroundColor: colors.surfaceAlt }]}>
        <MaterialCommunityIcons name={icon} size={20} color={colors.textMuted} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.rowSubtitle, { color: colors.textFaint }]}>{subtitle}</Text>
      </View>
      {right}
    </View>
  );
}

export default function Settings() {
  const { colors, mode, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState(true);
  const [showStops, setShowStops] = useState(true);
  const [mapFilter, setMapFilter] = useState("all");

  useEffect(() => {
    (async () => {
      setNotifications(await getJSON(StorageKeys.notificationsEnabled, true));
      setShowStops(await getJSON(StorageKeys.showStopsByDefault, true));
      setMapFilter(await getJSON(StorageKeys.mapFilter, "all"));
    })();
  }, []);

  const updateNotifications = (next: boolean) => {
    setNotifications(next);
    setJSON(StorageKeys.notificationsEnabled, next);
  };

  const updateShowStops = (next: boolean) => {
    setShowStops(next);
    setJSON(StorageKeys.showStopsByDefault, next);
  };

  const updateMapFilter = (key: string) => {
    setMapFilter(key);
    setJSON(StorageKeys.mapFilter, key);
  };

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.title, { color: colors.text }]}>{t("settings.title")}</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.textFaint }]}>{t("lang.title").toUpperCase()}</Text>
        <Card padding={0}>
          <LanguageDropdownRow />
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.textFaint }]}>{t("settings.appearance").toUpperCase()}</Text>
        <Card padding={0}>
          <Pressable onPress={toggleTheme}>
            <SettingsRow
              icon={mode === "dark" ? "weather-night" : "weather-sunny"}
              title={t("settings.darkMode")}
              subtitle={mode === "dark" ? t("settings.on") : t("settings.off")}
              right={<ToggleSwitch value={mode === "dark"} onValueChange={toggleTheme} />}
              isLast
            />
          </Pressable>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.textFaint }]}>{t("settings.map").toUpperCase()}</Text>
        <Card padding={0}>
          <SettingsRow
            icon="map-marker"
            title={t("settings.showStopsDefault")}
            subtitle={t("settings.showStopsDefault.sub")}
            right={<ToggleSwitch value={showStops} onValueChange={updateShowStops} />}
          />
          <View style={styles.mapFilterWrap}>
            <View style={styles.mapFilterHeader}>
              <View style={[styles.rowIcon, { backgroundColor: colors.surfaceAlt }]}>
                <MaterialCommunityIcons name="layers-outline" size={20} color={colors.textMuted} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: colors.text }]}>{t("settings.defaultMapView")}</Text>
                <Text style={[styles.rowSubtitle, { color: colors.textFaint }]}>{t("settings.defaultMapView.sub")}</Text>
              </View>
            </View>
            <View style={styles.filterChips}>
              {MAP_FILTERS.map((f) => {
                const active = mapFilter === f.key;
                return (
                  <Pressable
                    key={f.key}
                    onPress={() => updateMapFilter(f.key)}
                    style={[styles.filterChip, { backgroundColor: active ? colors.text : colors.surfaceAlt }]}
                  >
                    <Text style={{ color: active ? colors.background : colors.textMuted, fontSize: 12, fontWeight: "700" }}>
                      {t(f.labelKey)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.textFaint }]}>{t("settings.notifications").toUpperCase()}</Text>
        <Card padding={0}>
          <SettingsRow
            icon="bell-outline"
            title={t("settings.departureAlerts")}
            subtitle={t("settings.departureAlerts.sub")}
            right={<ToggleSwitch value={notifications} onValueChange={updateNotifications} />}
            isLast
          />
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.textFaint }]}>{t("settings.networkData").toUpperCase()}</Text>
        <Card padding={0}>
          <SettingsRow icon="bus" title={t("settings.coverage")} subtitle={t("settings.coverage.sub")} />
          <SettingsRow icon="calendar-month-outline" title={t("settings.timetableData")} subtitle={t("settings.timetableData.sub")} />
          <SettingsRow icon="database-outline" title={t("settings.sources")} subtitle={t("settings.sources.sub")} isLast />
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.textFaint }]}>{t("settings.roadmap").toUpperCase()}</Text>
        <Card padding={0}>
          {ROADMAP.map((item, i) => (
            <View
              key={ROADMAP_KEYS[i].titleKey}
              style={[
                styles.roadmapRow,
                i < ROADMAP.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: colors.text }]}>{t(ROADMAP_KEYS[i].titleKey)}</Text>
                <Text style={[styles.rowSubtitle, { color: colors.textFaint }]}>{t(ROADMAP_KEYS[i].detailKey)}</Text>
              </View>
              <RoadmapBadge status={item.status} />
            </View>
          ))}
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.textFaint }]}>{t("settings.about").toUpperCase()}</Text>
        <Card padding={0}>
          <SettingsRow icon="information-outline" title={t("settings.aboutPeatu")} subtitle={t("settings.version")} />
          <View style={styles.aboutBody}>
            <View style={styles.aboutModes}>
              <MaterialCommunityIcons name="bus" size={16} color="#2563EB" />
              <MaterialCommunityIcons name="tram" size={16} color="#16A34A" />
              <MaterialCommunityIcons name="tram" size={16} color="#CA8A04" />
            </View>
            <Text style={[styles.aboutText, { color: colors.textFaint }]}>{t("settings.aboutText")}</Text>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: "800" },
  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionLabel: { fontSize: 12, fontWeight: "800", letterSpacing: 0.4, marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  rowIcon: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  rowTitle: { fontSize: 14, fontWeight: "700" },
  rowSubtitle: { fontSize: 12, marginTop: 2 },
  mapFilterWrap: { padding: 16 },
  mapFilterHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  filterChips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  filterChip: { height: 32, paddingHorizontal: 12, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  roadmapRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  roadmapBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  roadmapBadgeText: { fontSize: 10, fontWeight: "800" },
  aboutBody: { paddingHorizontal: 16, paddingBottom: 16 },
  aboutModes: { flexDirection: "row", gap: 8, marginBottom: 8 },
  aboutText: { fontSize: 12, lineHeight: 18 },
});
