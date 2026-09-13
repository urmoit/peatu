import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, View, Pressable, Text, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { STOPS } from "@/data/stops";
import { StorageKeys, getJSON, setJSON } from "@/utils/storage";
import type { TranslationKey } from "@/i18n/translations";

const TALLINN_CENTER = { lat: 59.437, lng: 24.7536 };

const MODE_FILTERS: { key: "all" | "bus" | "train" | "tram" | "trolley"; labelKey: TranslationKey }[] = [
  { key: "all", labelKey: "map.filter.all" },
  { key: "bus", labelKey: "map.filter.bus" },
  { key: "train", labelKey: "map.filter.train" },
  { key: "tram", labelKey: "map.filter.tram" },
  { key: "trolley", labelKey: "map.filter.trolley" },
];

export default function MapTab() {
  const { colors, mode } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [showStops, setShowStops] = useState(true);
  const [filter, setFilter] = useState<"all" | "bus" | "train" | "tram" | "trolley">("all");
  const [locating, setLocating] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    (async () => {
      const stored = await getJSON(StorageKeys.showStopsByDefault, true);
      setShowStops(stored);
      const storedFilter = await getJSON<"all" | "bus" | "train" | "tram" | "trolley">(StorageKeys.mapFilter, "all");
      setFilter(storedFilter);
    })();
  }, []);

  const toggleStops = () => {
    const next = !showStops;
    setShowStops(next);
    setJSON(StorageKeys.showStopsByDefault, next);
    updateMarkers();
  };

  const loadGoogleMaps = async () => {
    if (typeof window === "undefined") return;
    if ((window as any).google?.maps) {
      initMap();
      return;
    }

    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "";
    if (!apiKey) {
      console.warn("Google Maps API key not set");
      setMapReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker`;
    script.async = true;
    script.defer = true;
    script.onload = initMap;
    document.head.appendChild(script);
  };

  const initMap = () => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new (window as any).google.maps.Map(mapContainerRef.current, {
      center: TALLINN_CENTER,
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: Platform.OS !== "web",
      zoomControl: true,
      mapId: "peatu-map",
      styles: mode === "dark" ? darkMapStyle : lightMapStyle,
    });

    mapRef.current = map;
    setMapReady(true);
    updateMarkers();
  };

  const updateMarkers = () => {
    if (!mapRef.current) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    if (!showStops) return;

    const visibleStops = STOPS.filter((s) => (filter === "all" ? true : s.modes.includes(filter)));

    visibleStops.forEach((stop) => {
      const primaryMode = stop.modes[0];
      const color = getModeColor(primaryMode);
      const marker = new (window as any).google.maps.marker.AdvancedMarkerElement({
        map: mapRef.current,
        position: { lat: stop.lat, lng: stop.lng },
        title: stop.name,
        content: createMarkerElement(primaryMode, color),
        gmpClickable: true,
      });

      marker.addListener("click", () => {
        window.location.href = `/stop/${stop.id}`;
      });

      markersRef.current.push(marker);
    });
  };

  const createMarkerElement = (mode: string, color: string) => {
    const el = document.createElement("div");
    el.style.width = "28px";
    el.style.height = "28px";
    el.style.borderRadius = "50%";
    el.style.backgroundColor = color;
    el.style.border = "3px solid white";
    el.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
    el.style.display = "flex";
    el.style.alignItems = "center";
    el.style.justifyContent = "center";
    el.style.cursor = "pointer";
    el.style.transition = "transform 0.15s ease";

    const icon = document.createElement("span");
    icon.innerHTML = getModeIcon(mode);
    icon.style.fontSize = "12px";
    icon.style.color = "white";
    el.appendChild(icon);

    el.addEventListener("mouseenter", () => (el.style.transform = "scale(1.2)"));
    el.addEventListener("mouseleave", () => (el.style.transform = "scale(1)"));

    return el;
  };

  const getModeColor = (mode: string) => {
    const colors: Record<string, string> = {
      bus: "#2563EB",
      train: "#16A34A",
      tram: "#CA8A04",
      trolley: "#CA8A04",
    };
    return colors[mode] || "#2563EB";
  };

  const getModeIcon = (mode: string) => {
    const icons: Record<string, string> = {
      bus: "🚌",
      train: "🚂",
      tram: "🚋",
      trolley: "🚍",
    };
    return icons[mode] || "📍";
  };

  const goToMyLocation = async () => {
    if (typeof navigator === "undefined") return;
    try {
      setLocating(true);
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 });
      });
      if (mapRef.current) {
        mapRef.current.setCenter({ lat: position.coords.latitude, lng: position.coords.longitude });
        mapRef.current.setZoom(15);
      }
    } catch {
      // ignore
    } finally {
      setLocating(false);
    }
  };

  useEffect(() => {
    loadGoogleMaps();
    return () => {
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
    };
  }, []);

  useEffect(() => {
    updateMarkers();
  }, [showStops, filter]);

  if (!mapReady) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted, marginTop: 12 }]}>Loading map...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.mapWrapper} ref={mapContainerRef} />

      <View style={[styles.topBar, { paddingTop: insets.top + (Platform.OS === "web" ? 16 : 8) }]} pointerEvents="box-none">
        <View style={[styles.filterScroll, { backgroundColor: colors.surface, boxShadow: `0 4px 10px ${colors.shadow}` }]}>
          {MODE_FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => {
                  setFilter(f.key);
                  setJSON(StorageKeys.mapFilter, f.key);
                }}
                style={[
                  styles.filterChip,
                  active && { backgroundColor: colors.text, boxShadow: `0 2px 6px ${colors.shadow}` },
                ]}
                aria-pressed={active}
              >
                <Text style={{ color: active ? colors.background : colors.textMuted, fontSize: 12, fontWeight: "700" }}>
                  {t(f.labelKey)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={[styles.actionsCol, { bottom: insets.bottom + (Platform.OS === "web" ? 24 : 24) }]} pointerEvents="box-none">
        <Pressable onPress={toggleStops} style={[styles.fab, { backgroundColor: colors.surface, boxShadow: `0 3px 8px ${colors.shadow}` }]} aria-label={showStops ? "Hide stops" : "Show stops"}>
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={showStops ? colors.primary : colors.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </Pressable>
        <Pressable onPress={goToMyLocation} style={[styles.fab, { backgroundColor: colors.surface, boxShadow: `0 3px 8px ${colors.shadow}` }]} aria-label="Go to my location">
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={locating ? colors.primary : colors.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
          </svg>
        </Pressable>
      </View>

      <View style={[styles.attribution, { bottom: insets.bottom + 6 }]} pointerEvents="none">
        <Text style={styles.attributionText}>© OpenStreetMap · Google Maps</Text>
      </View>
    </View>
  );
}

const lightMapStyle: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#F9FAFB" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#6B7280" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#FFFFFF" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#E5E7EB" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#D1D5DB" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9CA3AF" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#E0F2FE" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#6B7280" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#E5E7EB" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#F3F4F6" }] },
];

const darkMapStyle: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#030712" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#9CA3AF" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#030712" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1F2937" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#374151" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9CA3AF" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0B2559" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#6B7280" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#1F2937" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#111827" }] },
];

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapWrapper: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: { fontSize: 14 },
  topBar: {
    position: "absolute",
    left: 16,
    right: 16,
    top: 0,
    zIndex: 10,
  },
  filterScroll: {
    flexDirection: "row",
    borderRadius: 20,
    padding: 4,
    gap: 4,
  },
  filterChip: {
    flex: 1,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 70,
  },
  actionsCol: {
    position: "absolute",
    right: 16,
    gap: 10,
    zIndex: 10,
  },
  fab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  attribution: {
    position: "absolute",
    left: 12,
    zIndex: 10,
  },
  attributionText: {
    fontSize: 10,
    color: "rgba(107,114,128,0.9)",
  },
});