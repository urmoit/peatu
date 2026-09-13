import React, { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import { StyleSheet, View } from "react-native";
import WebView, { type WebViewMessageEvent } from "react-native-webview";
import { STOPS } from "@/data/stops";
import { modeColors } from "@/theme/colors";
import { useTheme } from "@/theme/ThemeContext";
import type { Stop } from "@/types";
import { buildMapHtml, markerFromStop, type MapMarkerData } from "@/utils/leafletHtml";

export interface CustomMapHandle {
  flyTo: (lat: number, lng: number, zoom?: number) => void;
  setUserLocation: (lat: number, lng: number) => void;
}

interface CustomMapProps {
  stops?: Stop[];
  center: { lat: number; lng: number };
  zoom?: number;
  interactive?: boolean;
  selectedStopId?: string;
  onStopPress?: (id: string) => void;
  style?: object;
}

function colorForStop(stop: Stop, themeMode: "light" | "dark") {
  const c = modeColors[stop.modes[0]];
  return themeMode === "dark" ? c.textDark : c.text;
}

const CustomMap = forwardRef<CustomMapHandle, CustomMapProps>(function CustomMap(
  { stops = STOPS, center, zoom = 13, interactive = true, selectedStopId, onStopPress, style },
  ref
) {
  const { mode: themeMode } = useTheme();
  const webviewRef = useRef<WebView>(null);

  const markers: MapMarkerData[] = useMemo(
    () => stops.map((s) => markerFromStop(s, colorForStop(s, themeMode))),
    [stops, themeMode]
  );

  useImperativeHandle(ref, () => ({
    flyTo: (lat, lng, flyZoom) => {
      webviewRef.current?.injectJavaScript(
        `window.flyToLocation && window.flyToLocation(${lat}, ${lng}, ${flyZoom ?? ""}); true;`
      );
    },
    setUserLocation: (lat, lng) => {
      webviewRef.current?.injectJavaScript(`window.setUserLocation && window.setUserLocation(${lat}, ${lng}); true;`);
    },
  }));

  // Push marker updates without a full reload so pan/zoom position is preserved.
  const markersRef = useRef<string>("");
  const nextMarkersJson = JSON.stringify(markers);
  if (markersRef.current && markersRef.current !== nextMarkersJson) {
    webviewRef.current?.injectJavaScript(`window.setMarkers && window.setMarkers(${nextMarkersJson}); true;`);
  }
  markersRef.current = nextMarkersJson;

  const prevTheme = useRef(themeMode);
  if (prevTheme.current !== themeMode) {
    webviewRef.current?.injectJavaScript(`window.setTheme && window.setTheme('${themeMode}'); true;`);
    prevTheme.current = themeMode;
  }

  const html = useMemo(
    () =>
      buildMapHtml({
        center,
        zoom,
        theme: themeMode,
        interactive,
        markers,
        selectedId: selectedStopId,
      }),
    // Only rebuild the whole document on first mount / interactivity or center changes;
    // marker + theme updates go through injectJavaScript above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [interactive]
  );

  const onMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "stopPress" && data.id) {
        onStopPress?.(data.id);
      }
    } catch {
      // ignore malformed messages
    }
  };

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webviewRef}
        originWhitelist={["*"]}
        source={{ html, baseUrl: "https://peatu.app/" }}
        onMessage={onMessage}
        style={styles.webview}
        pointerEvents={interactive ? "auto" : "none"}
        javaScriptEnabled
        domStorageEnabled
        overScrollMode="never"
        setSupportMultipleWindows={false}
      />
    </View>
  );
});

export default CustomMap;

const styles = StyleSheet.create({
  container: { flex: 1, overflow: "hidden" },
  webview: { flex: 1, backgroundColor: "transparent" },
});
