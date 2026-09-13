import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useLanguage } from "@/i18n/LanguageContext";
import { useTheme } from "@/theme/ThemeContext";

export default function NotFound() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  return (
    <View style={[styles.wrap, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>{t("notFound.title")}</Text>
      <Link href="/(tabs)" style={[styles.link, { color: colors.primary }]}>
        {t("notFound.link")}
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 24 },
  title: { fontSize: 18, fontWeight: "700" },
  link: { fontSize: 14, fontWeight: "600" },
});
