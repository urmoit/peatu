import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLanguage } from "@/i18n/LanguageContext";
import type { LanguageCode } from "@/i18n/translations";
import { useTheme } from "@/theme/ThemeContext";

const OPTIONS: { code: LanguageCode; flag: string }[] = [
  { code: "en", flag: "🇬🇧" },
  { code: "et", flag: "🇪🇪" },
];

export function LanguageCompactSwitch() {
  const { language, setLanguage, t } = useLanguage();
  const { colors } = useTheme();

  return (
    <View style={[styles.pillWrap, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
      {OPTIONS.map((opt) => {
        const active = language === opt.code;
        return (
          <Pressable
            key={opt.code}
            onPress={() => setLanguage(opt.code)}
            style={[styles.pillOption, active && { backgroundColor: colors.text }]}
          >
            <Text style={styles.pillFlag}>{opt.flag}</Text>
            <Text style={{ color: active ? colors.background : colors.textMuted, fontSize: 12, fontWeight: "700" }}>
              {opt.code.toUpperCase()}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function LanguageDropdownRow() {
  const { language, setLanguage, t } = useLanguage();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);

  const current = OPTIONS.find((o) => o.code === language) ?? OPTIONS[0];
  const currentLabel = current.code === "en" ? t("lang.english") : t("lang.estonian");

  return (
    <>
      <Pressable onPress={() => setOpen(true)} style={styles.row}>
        <View style={[styles.rowIcon, { backgroundColor: colors.surfaceAlt }]}>
          <MaterialCommunityIcons name="translate" size={20} color={colors.textMuted} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.rowTitle, { color: colors.text }]}>{t("settings.language")}</Text>
          <Text style={[styles.rowSubtitle, { color: colors.textFaint }]}>
            {current.flag} {currentLabel}
          </Text>
        </View>
        <MaterialCommunityIcons name="chevron-down" size={20} color={colors.textFaint} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View />
        </Pressable>
        <View style={[styles.sheet, { backgroundColor: colors.surface, paddingBottom: insets.bottom + 16 }]}>
          <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
          <Text style={[styles.sheetTitle, { color: colors.text }]}>{t("lang.title")}</Text>
          <Text style={[styles.sheetSubtitle, { color: colors.textFaint }]}>{t("lang.subtitle")}</Text>
          {OPTIONS.map((opt) => {
            const active = language === opt.code;
            const label = opt.code === "en" ? t("lang.english") : t("lang.estonian");
            return (
              <Pressable
                key={opt.code}
                onPress={() => {
                  setLanguage(opt.code);
                  setOpen(false);
                }}
                style={[
                  styles.optionRow,
                  { backgroundColor: active ? colors.surfaceAlt : "transparent", borderColor: colors.border },
                ]}
              >
                <Text style={styles.optionFlag}>{opt.flag}</Text>
                <Text style={[styles.optionLabel, { color: colors.text }]}>{label}</Text>
                {active && <MaterialCommunityIcons name="check-circle" size={20} color={colors.primary} />}
              </Pressable>
            );
          })}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  pillWrap: {
    flexDirection: "row",
    borderRadius: 20,
    padding: 3,
    gap: 2,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  pillOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    height: 30,
    paddingHorizontal: 10,
    borderRadius: 17,
  },
  pillFlag: { fontSize: 13 },

  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  rowIcon: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  rowTitle: { fontSize: 14, fontWeight: "700" },
  rowSubtitle: { fontSize: 12, marginTop: 2 },

  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 16 },
  sheetTitle: { fontSize: 17, fontWeight: "800" },
  sheetSubtitle: { fontSize: 12, marginTop: 2, marginBottom: 16 },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
  optionFlag: { fontSize: 20 },
  optionLabel: { flex: 1, fontSize: 15, fontWeight: "600" },
});
