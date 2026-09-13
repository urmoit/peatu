import { StyleSheet, Text, View } from "react-native";
import Card from "./Card";
import ModeIcon from "./ModeIcon";
import { useLanguage } from "@/i18n/LanguageContext";
import { useTheme } from "@/theme/ThemeContext";
import type { TransitLine } from "@/types";

export default function LineRow({ line, onPress }: { line: TransitLine; onPress: () => void }) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  return (
    <Card onPress={onPress} padding={0} style={styles.card}>
      <View style={[styles.accentBar, { backgroundColor: line.color }]} />
      <View style={styles.row}>
        <View style={[styles.numberChip, { backgroundColor: `${line.color}22` }]}>
          <Text style={[styles.numberText, { color: line.color }]}>{line.number}</Text>
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {line.name}
          </Text>
          <View style={styles.metaRow}>
            <ModeIcon mode={line.mode} size={12} color={colors.textFaint} />
            <Text style={[styles.meta, { color: colors.textFaint }]}>
              {t("search.resultsCount", { count: line.stopIds.length })}
            </Text>
          </View>
        </View>
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
  numberChip: {
    minWidth: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  numberText: {
    fontSize: 16,
    fontWeight: "800",
  },
  info: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  meta: {
    fontSize: 12,
  },
});
