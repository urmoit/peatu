import { StyleSheet, Text, View } from "react-native";
import Card from "./Card";
import ModeIcon from "./ModeIcon";
import { useLanguage } from "@/i18n/LanguageContext";
import { modeColors } from "@/theme/colors";
import { useTheme } from "@/theme/ThemeContext";
import type { RecentTrip } from "@/types";

export default function TripCard({ trip, onPress }: { trip: RecentTrip; onPress: () => void }) {
  const { colors, mode: themeMode } = useTheme();
  const { t } = useLanguage();
  const transitMode = trip.modes.find((m) => m !== "walk") ?? trip.modes[0];
  const c = modeColors[transitMode];
  const accent = themeMode === "dark" ? c.textDark : c.text;
  const chipBg = themeMode === "dark" ? c.bgDark : c.bg;

  return (
    <Card onPress={onPress} padding={14} style={styles.card}>
      <View style={styles.topRow}>
        <View style={[styles.iconChip, { backgroundColor: chipBg }]}>
          <ModeIcon mode={transitMode} size={16} color={accent} />
        </View>
        <View style={[styles.durationPill, { backgroundColor: colors.surfaceAlt }]}>
          <Text style={[styles.duration, { color: colors.textMuted }]}>{trip.duration}</Text>
        </View>
      </View>

      <View style={styles.routeRow}>
        <View style={styles.connectorCol}>
          <View style={[styles.originDot, { borderColor: accent }]} />
          <View style={[styles.connectorLine, { backgroundColor: colors.border }]} />
          <View style={[styles.destSquare, { backgroundColor: accent }]} />
        </View>
        <View style={styles.stopsCol}>
          <Text style={[styles.value, { color: colors.text }]} numberOfLines={1}>
            {trip.from}
          </Text>
          <Text style={[styles.value, { color: colors.text }]} numberOfLines={1}>
            {trip.to}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 208,
    marginRight: 12,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  iconChip: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  durationPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  duration: {
    fontSize: 11,
    fontWeight: "700",
  },
  routeRow: {
    flexDirection: "row",
    gap: 10,
  },
  connectorCol: {
    alignItems: "center",
    paddingTop: 4,
    paddingBottom: 4,
  },
  originDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    borderWidth: 2,
    backgroundColor: "transparent",
  },
  connectorLine: {
    width: 2,
    flex: 1,
    marginVertical: 5,
    minHeight: 16,
    borderRadius: 1,
  },
  destSquare: {
    width: 7,
    height: 7,
    borderRadius: 2,
  },
  stopsCol: {
    flex: 1,
    justifyContent: "space-between",
    gap: 20,
  },
  value: {
    fontSize: 14,
    fontWeight: "700",
  },
});
