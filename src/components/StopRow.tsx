import { StyleSheet, Text, View } from "react-native";
import Card from "./Card";
import ModeBadge from "./ModeBadge";
import { useLanguage } from "@/i18n/LanguageContext";
import { modeColors } from "@/theme/colors";
import { useTheme } from "@/theme/ThemeContext";
import type { Stop } from "@/types";

export default function StopRow({
  stop,
  onPress,
  distanceLabel,
  etaLabel,
  trailing,
}: {
  stop: Stop;
  onPress: () => void;
  distanceLabel?: string;
  etaLabel?: string;
  trailing?: React.ReactNode;
}) {
  const { colors, mode: themeMode } = useTheme();
  const { t } = useLanguage();
  const primaryMode = stop.modes[0];
  const accent = themeMode === "dark" ? modeColors[primaryMode].textDark : modeColors[primaryMode].text;
  const isSoon = etaLabel !== undefined && Number(etaLabel) <= 5;

  return (
    <Card onPress={onPress} padding={0} style={styles.card}>
      <View style={[styles.accentBar, { backgroundColor: accent }]} />
      <View style={styles.row}>
        <ModeBadge mode={primaryMode} size="md" />
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {stop.name}
          </Text>
          <Text style={[styles.meta, { color: colors.textFaint }]} numberOfLines={1}>
            {stop.area} · {distanceLabel ?? stop.distance}
          </Text>
          {stop.modes.length > 1 && (
            <View style={styles.modesRow}>
              {stop.modes.map((m) => (
                <ModeBadge key={m} mode={m} size="sm" />
              ))}
            </View>
          )}
        </View>
        {trailing ??
          (etaLabel ? (
            <View
              style={[
                styles.etaPill,
                { backgroundColor: isSoon ? `${colors.primary}1F` : colors.surfaceAlt },
              ]}
            >
              <Text style={[styles.etaValue, { color: isSoon ? colors.primary : colors.text }]}>{etaLabel}</Text>
              <Text style={[styles.etaUnit, { color: isSoon ? colors.primary : colors.textFaint }]}>
                {t("stop.min")}
              </Text>
            </View>
          ) : null)}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
    flexDirection: "row",
    overflow: "hidden",
  },
  accentBar: {
    width: 4,
  },
  row: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
  },
  meta: {
    fontSize: 12,
  },
  modesRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 6,
  },
  etaPill: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 48,
  },
  etaValue: {
    fontSize: 16,
    fontWeight: "800",
  },
  etaUnit: {
    fontSize: 9,
    fontWeight: "600",
    marginTop: -1,
  },
});
