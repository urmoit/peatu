import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Card from "@/components/Card";
import { LanguageDropdownRow } from "@/components/LanguageSwitcher";
import ToggleSwitch from "@/components/ToggleSwitch";
import { SAVED_STOP_IDS_DEFAULT } from "@/data/stops";
import { ROADMAP } from "@/data/trips";
import { useLanguage } from "@/i18n/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";
import { useTheme } from "@/theme/ThemeContext";
import type { RoadmapItem } from "@/types";
import { StorageKeys, getJSON, setJSON } from "@/utils/storage";

const MAP_FILTERS = [
  { key: "all", labelKey: "map.filter.all" as TranslationKey },
  { key: "bus", labelKey: "map.filter.bus" as TranslationKey },
  { key: "train", labelKey: "map.filter.train" as TranslationKey },
  { key: "tram", labelKey: "map.filter.tram" as TranslationKey },
  { key: "ferry", labelKey: "map.filter.ferry" as TranslationKey },
];

const ROADMAP_KEYS: { titleKey: TranslationKey; detailKey: TranslationKey }[] = [
  { titleKey: "roadmap.item1.title", detailKey: "roadmap.item1.detail" },
  { titleKey: "roadmap.item2.title", detailKey: "roadmap.item2.detail" },
  { titleKey: "roadmap.item3.title", detailKey: "roadmap.item3.detail" },
  { titleKey: "roadmap.item4.title", detailKey: "roadmap.item4.detail" },
  { titleKey: "roadmap.item5.title", detailKey: "roadmap.item5.detail" },
  { titleKey: "roadmap.item6.title", detailKey: "roadmap.item6.detail" },
  { titleKey: "roadmap.item7.title", detailKey: "roadmap.item7.detail" },
];

function RoadmapIcon({ status }: { status: RoadmapItem["status"] }) {
  const { colors } = useTheme();
  const bg =
    status === "done"
      ? `${colors.accentGreen}22`
      : status === "next"
        ? `${colors.primary}22`
        : colors.surfaceAlt;
  const color = status === "done" ? colors.accentGreen : status === "next" ? colors.primary : colors.textFaint;
  const icon = status === "done" ? "check" : status === "next" ? "rocket-launch-outline" : "clock-outline";
  return (
    <View style={[styles.roadmapIcon, { backgroundColor: bg }]}>
      <MaterialCommunityIcons name={icon} size={18} color={color} />
    </View>
  );
}

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
  const [savedStopCount, setSavedStopCount] = useState(0);
  const [savedLineCount, setSavedLineCount] = useState(0);

  useEffect(() => {
    (async () => {
      setNotifications(await getJSON(StorageKeys.notificationsEnabled, true));
      setShowStops(await getJSON(StorageKeys.showStopsByDefault, true));
      const rawMapFilter = await getJSON<string>(StorageKeys.mapFilter, "all");
      // "trolley" was folded into "bus" — migrate old stored values.
      setMapFilter(rawMapFilter === "trolley" ? "bus" : rawMapFilter);
    })();
  }, []);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const stopIds = await getJSON(StorageKeys.savedStops, SAVED_STOP_IDS_DEFAULT);
        setSavedStopCount(stopIds.length);
        const lineIds = await getJSON<string[]>(StorageKeys.savedLines, []);
        setSavedLineCount(lineIds.length);
      })();
    }, [])
  );

  const clearSavedData = () => {
    Alert.alert(t("settings.clearData"), t("settings.clearData.confirm"), [
      { text: t("settings.cancel"), style: "cancel" },
      {
        text: t("settings.clearData.action"),
        style: "destructive",
        onPress: async () => {
          await setJSON(StorageKeys.savedStops, []);
          await setJSON(StorageKeys.savedLines, []);
          setSavedStopCount(0);
          setSavedLineCount(0);
        },
      },
    ]);
  };

  const replayOnboarding = () => {
    Alert.alert(t("settings.replayOnboarding"), t("settings.replayOnboarding.confirm"), [
      { text: t("settings.cancel"), style: "cancel" },
      {
        text: t("onboarding.continue"),
        onPress: async () => {
          await setJSON(StorageKeys.hasOnboarded, false);
          router.replace("/onboarding");
        },
      },
    ]);
  };

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
        <Text style={[styles.sectionLabel, { color: colors.textFaint }]}>{t("settings.data").toUpperCase()}</Text>
        <Card padding={0}>
          <Pressable onPress={() => router.push("/(tabs)/saved")}>
            <SettingsRow
              icon="bookmark-multiple-outline"
              title={t("settings.savedItems")}
              subtitle={t("settings.savedItems.sub", { stops: savedStopCount, lines: savedLineCount })}
              right={<MaterialCommunityIcons name="chevron-right" size={20} color={colors.textFaint} />}
            />
          </Pressable>
          <Pressable onPress={replayOnboarding}>
            <SettingsRow
              icon="restart"
              title={t("settings.replayOnboarding")}
              subtitle={t("settings.replayOnboarding.sub")}
            />
          </Pressable>
          <Pressable onPress={clearSavedData}>
            <SettingsRow
              icon="trash-can-outline"
              title={t("settings.clearData")}
              subtitle={t("settings.clearData.sub")}
              isLast
            />
          </Pressable>
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
        <View style={styles.roadmapProgressRow}>
          <Text style={[styles.roadmapProgressText, { color: colors.textMuted }]}>
            {t("settings.roadmapProgress", {
              done: ROADMAP.filter((item) => item.status === "done").length,
              total: ROADMAP.length,
            })}
          </Text>
          <View style={[styles.roadmapProgressTrack, { backgroundColor: colors.surfaceAlt }]}>
            <View
              style={[
                styles.roadmapProgressFill,
                {
                  backgroundColor: colors.accentGreen,
                  width: `${(ROADMAP.filter((item) => item.status === "done").length / ROADMAP.length) * 100}%`,
                },
              ]}
            />
          </View>
        </View>
        <Card padding={0}>
          {ROADMAP.map((item, i) => (
            <View
              key={ROADMAP_KEYS[i].titleKey}
              style={[
                styles.roadmapRow,
                i < ROADMAP.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <RoadmapIcon status={item.status} />
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
          <SettingsRow icon="shield-check-outline" title={t("settings.privacy")} subtitle={t("settings.privacy.sub")} isLast />
          <View style={styles.aboutBody}>
            <View style={styles.aboutModes}>
              <MaterialCommunityIcons name="bus" size={16} color="#2563EB" />
              <MaterialCommunityIcons name="tram" size={16} color="#16A34A" />
              <MaterialCommunityIcons name="ferry" size={16} color="#0891B2" />
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
  roadmapIcon: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  roadmapProgressRow: { marginBottom: 12, gap: 8 },
  roadmapProgressText: { fontSize: 12, fontWeight: "700" },
  roadmapProgressTrack: { height: 8, borderRadius: 4, overflow: "hidden" },
  roadmapProgressFill: { height: 8, borderRadius: 4 },
  roadmapBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  roadmapBadgeText: { fontSize: 10, fontWeight: "800" },
  aboutBody: { paddingHorizontal: 16, paddingBottom: 16 },
  aboutModes: { flexDirection: "row", gap: 8, marginBottom: 8 },
  aboutText: { fontSize: 12, lineHeight: 18 },
});
