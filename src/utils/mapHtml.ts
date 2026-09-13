import type { Stop, TransitLine } from "@/types";
import { lineCoordinates, lineShapePolylines } from "@/data/lines";

export interface MapMarkerData {
  id: string;
  name: string;
  area: string;
  lat: number;
  lng: number;
  color: string;
  glyph: string;
}

export interface MapLineData {
  id: string;
  color: string;
  coordinates: [number, number][]; // [lng, lat] pairs, GeoJSON order
}

const GLYPH_SVG: Record<string, string> = {
  bus: '<path d="M4 16c0 .88.39 1.67 1 2.22V20a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h8v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm9 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM18 11H6V6h12v5z"/>',
  train: '<path d="M12 2c-4 0-7 .5-7 4.5v9c0 2 1.5 3.5 3.5 3.5L7 20.5V21h10v-.5L15.5 19c2 0 3.5-1.5 3.5-3.5v-9C19 2.5 16 2 12 2zM7.5 15A1.5 1.5 0 1 1 7.5 12a1.5 1.5 0 0 1 0 3zm9 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM17 9H7V6.5h10V9z"/>',
  tram: '<path d="M18 16c0 .88-.39 1.67-1 2.22V20a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H8v1a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-1.78A2.98 2.98 0 0 1 4 16V6c0-3.5 3.58-4 8-4s8 .5 8 4v10zM7.5 17a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm9 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM18 11H6V6h12v5z"/>',
  ferry: '<path d="M11 3h2v6h-2V3zM9 10h6v4H9v-4zM3 15h18l-2.2 5.2a1 1 0 0 1-.9.6H6.1a1 1 0 0 1-.9-.6L3 15z"/>',
  walk: '<path d="M13.5 5.5a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5zM9.8 8.9 7 23h2.1l1.8-8 2.1 2v6h2.1v-7.6l-2.1-2 .6-3c1 1.2 2.5 2 4.4 2v-2.1c-1.6 0-3-.9-3.7-2.1l-1-1.7c-.4-.6-1-1-1.7-1-.3 0-.5 0-.8.1L4.5 10.5v4.9h2.1v-3.6l2.1-.9-1.2 5.4L4 23h2.2l3.6-9.6.3-1.3.7-2.2z"/>',
};

export function markerFromStop(stop: Stop, color: string): MapMarkerData {
  return {
    id: stop.id,
    name: stop.name,
    area: stop.area,
    lat: stop.lat,
    lng: stop.lng,
    color,
    glyph: stop.modes[0] === "walk" ? "bus" : stop.modes[0],
  };
}

export function lineToMapLineData(line: TransitLine): MapLineData {
  return {
    id: line.id,
    color: line.color,
    coordinates: lineCoordinates(line).map((c) => [c.lng, c.lat]),
  };
}

/** One MapLineData per shape polyline (usually inbound + outbound share the
 * same id/color, so selection dimming and fitBounds treat them as one line). */
export function lineToMapLineDatas(line: TransitLine): MapLineData[] {
  return lineShapePolylines(line)
    .filter((poly) => poly.length >= 2)
    .map((poly) => ({
      id: line.id,
      color: line.color,
      coordinates: poly.map((c) => [c.lng, c.lat] as [number, number]),
    }));
}

export function buildMapHtml(opts: {
  center: { lat: number; lng: number };
  zoom: number;
  theme: "light" | "dark";
  interactive: boolean;
  markers: MapMarkerData[];
  lines?: MapLineData[];
  selectedId?: string;
  selectedLineId?: string;
  /** Stops stay hidden until the map is zoomed to at least this level, so a
   * city-wide view shows just route lines instead of dozens of overlapping
   * pins. Pass `alwaysShowMarkers` to bypass this (e.g. a single-stop preview). */
  minMarkerZoom?: number;
  alwaysShowMarkers?: boolean;
}) {
  const { center, zoom, theme, interactive } = opts;
  const markersJson = JSON.stringify(opts.markers);
  const linesJson = JSON.stringify(opts.lines ?? []);
  const selectedId = JSON.stringify(opts.selectedId ?? null);
  const selectedLineId = JSON.stringify(opts.selectedLineId ?? null);
  const minMarkerZoom = opts.alwaysShowMarkers ? -Infinity : opts.minMarkerZoom ?? 14;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="referrer" content="strict-origin-when-cross-origin" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <style>
    html, body { height: 100%; margin: 0; padding: 0; background: ${theme === "dark" ? "#0B0F17" : "#EEF0F3"}; }
    #map { position: absolute; top: 0; left: 0; right: 0; bottom: 0; }
    .maplibregl-ctrl, .leaflet-control-attribution, .leaflet-control-zoom { display: none !important; }
    .leaflet-tile-pane { filter: ${theme === "dark" ? "invert(1) hue-rotate(180deg) brightness(0.95) contrast(0.85) saturate(0.7)" : "none"}; }
    .user-dot { width: 18px; height: 18px; border-radius: 9px; background: #2563EB; border: 3px solid #fff; box-shadow: 0 0 0 4px rgba(37,99,235,0.25); }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    // ---------------------------------------------------------------------
    // Two map engines, one shared window.* API (setMarkers/setLines/setTheme/
    // flyToLocation/setUserLocation) so the RN side never needs to know which
    // one is active:
    //
    //  1. MapLibre GL + OpenFreeMap vector styles (nice, theme-native look) —
    //     needs WebGL, which some Android WebViews don't expose even though
    //     the device's browser does.
    //  2. Leaflet + OpenStreetMap raster tiles (CSS-filtered for dark mode) —
    //     plain <img> tiles, works everywhere, so it's the guaranteed fallback
    //     if WebGL is missing, the MapLibre CDN fails, or the style doesn't
    //     finish loading within a few seconds.
    // ---------------------------------------------------------------------
    var GLYPHS = ${JSON.stringify(GLYPH_SVG)};
    // Mutable, not a frozen constant: if the app's theme resolves (e.g. from
    // AsyncStorage) to something different shortly after this page is first
    // built, window.setTheme() below updates this immediately regardless of
    // whether either map engine has finished booting yet. Both boot paths
    // read this at init time rather than closing over the original value, so
    // a "dark" that arrives mid-boot isn't silently dropped.
    var pendingTheme = '${theme}';
    var INTERACTIVE = ${interactive};
    var CENTER = { lat: ${center.lat}, lng: ${center.lng} };
    var ZOOM = ${zoom};
    var SELECTED_ID = ${selectedId};
    var SELECTED_LINE_ID = ${selectedLineId};
    var MIN_MARKER_ZOOM = ${minMarkerZoom};
    var markersShown = false;
    var state = { markers: ${markersJson}, lines: ${linesJson} };
    var engine = null; // 'maplibre' | 'leaflet'

    function loadScript(src, onLoad, onError) {
      var el = document.createElement('script');
      el.src = src;
      el.onload = onLoad;
      el.onerror = onError;
      document.head.appendChild(el);
    }
    function loadCss(href) {
      var el = document.createElement('link');
      el.rel = 'stylesheet';
      el.href = href;
      document.head.appendChild(el);
    }
    function hasWebGL() {
      try {
        var c = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
      } catch (e) {
        return false;
      }
    }
    function markerHtml(m, isSelected) {
      var size = isSelected ? 40 : 30;
      var iconSize = isSelected ? 18 : 14;
      var glyph = GLYPHS[m.glyph] || GLYPHS.bus;
      return '<div style="width:' + size + 'px;height:' + size + 'px;border-radius:' + (size / 2) + 'px;background:' + m.color + ';display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.4);border:2px solid #fff;">' +
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="' + iconSize + '" height="' + iconSize + '" fill="#fff">' + glyph + '</svg></div>';
    }
    function notifyStopPress(id) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'stopPress', id: id }));
      }
    }
    function notifyMarkersVisibility(visible) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'markersVisibility', visible: visible }));
      }
    }

    // ============================= MapLibre =============================
    var ml = { map: null, markers: [], userMarker: null, ready: false };

    function mlClearMarkers() {
      ml.markers.forEach(function (mk) { mk.remove(); });
      ml.markers = [];
    }
    function mlSetMarkers(list) {
      if (!ml.map) return;
      mlClearMarkers();
      list.forEach(function (m) {
        var el = document.createElement('div');
        el.innerHTML = markerHtml(m, m.id === SELECTED_ID);
        el.firstChild.style.cursor = 'pointer';
        if (INTERACTIVE) el.addEventListener('click', function () { notifyStopPress(m.id); });
        var marker = new maplibregl.Marker({ element: el.firstChild, anchor: 'center' }).setLngLat([m.lng, m.lat]).addTo(ml.map);
        ml.markers.push(marker);
      });
    }
    function mlAddLineLayers(lines) {
      if (!ml.map) return;
      (ml.map.getStyle().layers || []).forEach(function (layer) {
        if (layer.id.indexOf('line-layer-') === 0) {
          if (ml.map.getLayer(layer.id)) ml.map.removeLayer(layer.id);
        }
      });
      lines.forEach(function (line, i) {
        var sourceId = 'line-src-' + i;
        var layerId = 'line-layer-' + i;
        if (ml.map.getSource(sourceId)) ml.map.removeSource(sourceId);
        if (!line.coordinates || line.coordinates.length < 2) return;
        var isDimmed = SELECTED_LINE_ID && line.id !== SELECTED_LINE_ID;
        var isSelected = SELECTED_LINE_ID && line.id === SELECTED_LINE_ID;
        ml.map.addSource(sourceId, { type: 'geojson', data: { type: 'Feature', geometry: { type: 'LineString', coordinates: line.coordinates }, properties: {} } });
        ml.map.addLayer({
          id: layerId, type: 'line', source: sourceId,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': line.color, 'line-width': isSelected ? 5 : 3.5, 'line-opacity': isDimmed ? 0.25 : 0.95 }
        });
      });
    }
    function mlSetLines(lines) {
      state.lines = lines;
      if (ml.map && ml.map.isStyleLoaded()) mlAddLineLayers(lines);
    }
    function mlRefreshMarkerVisibility() {
      if (!ml.map) return;
      var shouldShow = ml.map.getZoom() >= MIN_MARKER_ZOOM;
      if (shouldShow === markersShown) return;
      markersShown = shouldShow;
      if (shouldShow) mlSetMarkers(state.markers);
      else mlClearMarkers();
      notifyMarkersVisibility(shouldShow);
    }
    function mlSetTheme(theme) {
      if (!ml.map) return;
      ml.map.setStyle(theme === 'dark' ? 'https://tiles.openfreemap.org/styles/dark' : 'https://tiles.openfreemap.org/styles/liberty');
      ml.map.once('styledata', function () { mlAddLineLayers(state.lines); });
    }
    function mlFlyTo(lat, lng, zoom) {
      if (ml.map) ml.map.flyTo({ center: [lng, lat], zoom: zoom || ml.map.getZoom(), duration: 600 });
    }
    function mlSetUserLocation(lat, lng) {
      if (!ml.map) return;
      if (ml.userMarker) {
        ml.userMarker.setLngLat([lng, lat]);
      } else {
        var el = document.createElement('div');
        el.className = 'user-dot';
        ml.userMarker = new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat([lng, lat]).addTo(ml.map);
      }
    }
    function mlFitInitial() {
      if (!ml.map) return;
      try {
        if (SELECTED_LINE_ID) {
          var line = state.lines.filter(function (l) { return l.id === SELECTED_LINE_ID; })[0];
          if (line && line.coordinates.length > 1) {
            var lb = line.coordinates.reduce(function (b, p) { return b.extend(p); }, new maplibregl.LngLatBounds(line.coordinates[0], line.coordinates[0]));
            ml.map.fitBounds(lb, { padding: 56, maxZoom: 15, duration: 0 });
            return;
          }
        }
        if (state.markers.length > 1) {
          var pts = state.markers.map(function (m) { return [m.lng, m.lat]; });
          var bounds = pts.reduce(function (b, p) { return b.extend(p); }, new maplibregl.LngLatBounds(pts[0], pts[0]));
          ml.map.fitBounds(bounds, { padding: 48, maxZoom: 15, duration: 0 });
        }
      } catch (e) {}
    }
    function initMapLibre(onReady, onFail) {
      try {
        ml.map = new maplibregl.Map({
          container: 'map',
          style: pendingTheme === 'dark' ? 'https://tiles.openfreemap.org/styles/dark' : 'https://tiles.openfreemap.org/styles/liberty',
          center: [CENTER.lng, CENTER.lat],
          zoom: ZOOM,
          attributionControl: false,
          dragRotate: false,
          pitchWithRotate: false,
          touchPitch: false,
          interactive: INTERACTIVE
        });
        ml.map.on('error', function () { onFail(); });
        ml.map.on('zoomend', mlRefreshMarkerVisibility);
        ml.map.on('load', function () {
          ml.ready = true;
          onReady();
        });
      } catch (e) {
        onFail();
      }
    }

    // ============================= Leaflet =============================
    var ll = { map: null, tileLayer: null, markerLayer: null, userMarker: null };

    function llRenderMarkers(list) {
      ll.markerLayer.clearLayers();
      list.forEach(function (m) {
        var isSelected = m.id === SELECTED_ID;
        var icon = L.divIcon({ className: 'stop-marker', html: markerHtml(m, isSelected), iconSize: [isSelected ? 40 : 30, isSelected ? 40 : 30], iconAnchor: [isSelected ? 20 : 15, isSelected ? 20 : 15] });
        var marker = L.marker([m.lat, m.lng], { icon: icon });
        if (INTERACTIVE) marker.on('click', function () { notifyStopPress(m.id); });
        marker.addTo(ll.markerLayer);
      });
    }
    function llSetMarkers(list) {
      if (ll.map) llRenderMarkers(list);
    }
    var llLineLayers = [];
    function llRenderLines(lines) {
      llLineLayers.forEach(function (layer) { ll.map.removeLayer(layer); });
      llLineLayers = [];
      lines.forEach(function (line) {
        if (!line.coordinates || line.coordinates.length < 2) return;
        var isDimmed = SELECTED_LINE_ID && line.id !== SELECTED_LINE_ID;
        var isSelected = SELECTED_LINE_ID && line.id === SELECTED_LINE_ID;
        var latlngs = line.coordinates.map(function (c) { return [c[1], c[0]]; });
        var poly = L.polyline(latlngs, { color: line.color, weight: isSelected ? 5 : 3.5, opacity: isDimmed ? 0.25 : 0.95 }).addTo(ll.map);
        llLineLayers.push(poly);
      });
    }
    function llSetLines(lines) {
      state.lines = lines;
      if (ll.map) llRenderLines(lines);
    }
    function llRefreshMarkerVisibility() {
      if (!ll.map) return;
      var shouldShow = ll.map.getZoom() >= MIN_MARKER_ZOOM;
      if (shouldShow === markersShown) return;
      markersShown = shouldShow;
      if (shouldShow) llRenderMarkers(state.markers);
      else ll.markerLayer.clearLayers();
      notifyMarkersVisibility(shouldShow);
    }
    function llSetTheme(theme) {
      var pane = document.querySelector('.leaflet-tile-pane');
      if (pane) pane.style.filter = theme === 'dark' ? 'invert(1) hue-rotate(180deg) brightness(0.95) contrast(0.85) saturate(0.7)' : 'none';
      document.getElementById('map').style.background = theme === 'dark' ? '#0B0F17' : '#EEF0F3';
    }
    function llFlyTo(lat, lng, zoom) {
      if (ll.map) ll.map.flyTo([lat, lng], zoom || ll.map.getZoom(), { duration: 0.6 });
    }
    function llSetUserLocation(lat, lng) {
      if (!ll.map) return;
      if (ll.userMarker) {
        ll.userMarker.setLatLng([lat, lng]);
      } else {
        ll.userMarker = L.marker([lat, lng], { icon: L.divIcon({ className: 'stop-marker', html: '<div class="user-dot"></div>', iconSize: [18, 18], iconAnchor: [9, 9] }) }).addTo(ll.map);
      }
    }
    function llFitInitial() {
      try {
        if (SELECTED_LINE_ID) {
          var line = state.lines.filter(function (l) { return l.id === SELECTED_LINE_ID; })[0];
          if (line && line.coordinates.length > 1) {
            var latlngs = line.coordinates.map(function (c) { return [c[1], c[0]]; });
            ll.map.fitBounds(latlngs, { padding: [56, 56], maxZoom: 15 });
            return;
          }
        }
        if (state.markers.length > 1) {
          var pts = state.markers.map(function (m) { return [m.lat, m.lng]; });
          ll.map.fitBounds(pts, { padding: [40, 40], maxZoom: 15 });
        }
      } catch (e) {}
    }
    function initLeaflet() {
      ll.map = L.map('map', {
        zoomControl: false,
        attributionControl: false,
        dragging: INTERACTIVE,
        touchZoom: INTERACTIVE,
        scrollWheelZoom: INTERACTIVE,
        doubleClickZoom: INTERACTIVE,
        boxZoom: INTERACTIVE,
        keyboard: INTERACTIVE
      }).setView([CENTER.lat, CENTER.lng], ZOOM);
      ll.tileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
        crossOrigin: true,
        referrerPolicy: 'strict-origin-when-cross-origin'
      }).addTo(ll.map);
      ll.markerLayer = L.layerGroup().addTo(ll.map);
      llSetTheme(pendingTheme);
      llRenderLines(state.lines);
      ll.map.on('zoomend', llRefreshMarkerVisibility);
      setTimeout(function () {
        ll.map.invalidateSize();
        llFitInitial();
        llRefreshMarkerVisibility();
      }, 150);
    }

    // ============================= Boot =============================
    function bootLeaflet() {
      if (engine === 'leaflet') return;
      loadCss('https://unpkg.com/leaflet@latest/dist/leaflet.css');
      loadScript('https://unpkg.com/leaflet@latest/dist/leaflet.js', function () {
        document.getElementById('map').innerHTML = '';
        initLeaflet();
        engine = 'leaflet';
      }, function () {
        // Both engines failed to load at all (e.g. no network reaching either
        // CDN) — nothing more we can do client-side.
      });
    }

    function bootMapLibre() {
      loadCss('https://unpkg.com/maplibre-gl@latest/dist/maplibre-gl.css');
      loadScript('https://unpkg.com/maplibre-gl@latest/dist/maplibre-gl.js', function () {
        var fellBack = false;
        var timer = setTimeout(function () {
          fellBack = true;
          bootLeaflet();
        }, 4000);
        initMapLibre(
          function onReady() {
            if (fellBack) return;
            clearTimeout(timer);
            engine = 'maplibre';
            mlAddLineLayers(state.lines);
            mlFitInitial();
            mlRefreshMarkerVisibility();
          },
          function onFail() {
            if (fellBack) return;
            fellBack = true;
            clearTimeout(timer);
            bootLeaflet();
          }
        );
      }, function () {
        bootLeaflet();
      });
    }

    window.setMarkers = function (list) {
      state.markers = list;
      if (!markersShown) return; // stays hidden until zoomed in enough
      if (engine === 'maplibre') mlSetMarkers(list);
      else if (engine === 'leaflet') llSetMarkers(list);
    };
    window.setLines = function (lines) {
      if (engine === 'maplibre') mlSetLines(lines);
      else if (engine === 'leaflet') llSetLines(lines);
      else state.lines = lines;
    };
    window.setTheme = function (theme) {
      pendingTheme = theme;
      if (engine === 'maplibre') mlSetTheme(theme);
      else if (engine === 'leaflet') llSetTheme(theme);
      // If neither engine is ready yet, pendingTheme is picked up by
      // whichever one boots (see initMapLibre/initLeaflet above).
    };
    window.flyToLocation = function (lat, lng, zoom) {
      if (engine === 'maplibre') mlFlyTo(lat, lng, zoom);
      else if (engine === 'leaflet') llFlyTo(lat, lng, zoom);
    };
    window.setUserLocation = function (lat, lng) {
      if (engine === 'maplibre') mlSetUserLocation(lat, lng);
      else if (engine === 'leaflet') llSetUserLocation(lat, lng);
    };

    if (hasWebGL()) {
      bootMapLibre();
    } else {
      bootLeaflet();
    }
  </script>
</body>
</html>`;
}
