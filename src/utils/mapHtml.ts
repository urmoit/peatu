import type { TransitLine } from "@/types";
import type { Stop } from "@/types";
import { lineCoordinates } from "@/data/lines";

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

// OpenFreeMap: free, keyless, unlimited vector tile hosting (openfreemap.org).
// "dark" is a maintained fork of the openmaptiles dark-matter style — the same
// family of style the reference screenshot uses. "liberty" is OpenFreeMap's
// most polished, actively-maintained light style.
const STYLE_URLS = {
  light: "https://tiles.openfreemap.org/styles/liberty",
  dark: "https://tiles.openfreemap.org/styles/dark",
};

export function buildMapHtml(opts: {
  center: { lat: number; lng: number };
  zoom: number;
  theme: "light" | "dark";
  interactive: boolean;
  markers: MapMarkerData[];
  lines?: MapLineData[];
  selectedId?: string;
  selectedLineId?: string;
}) {
  const { center, zoom, theme, interactive } = opts;
  const markersJson = JSON.stringify(opts.markers);
  const linesJson = JSON.stringify(opts.lines ?? []);
  const selectedId = JSON.stringify(opts.selectedId ?? null);
  const selectedLineId = JSON.stringify(opts.selectedLineId ?? null);
  const fitToMarkers = opts.markers.length > 1 && !opts.selectedLineId;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="referrer" content="strict-origin-when-cross-origin" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/maplibre-gl@latest/dist/maplibre-gl.css" />
  <style>
    html, body { height: 100%; margin: 0; padding: 0; background: ${theme === "dark" ? "#0B0F17" : "#EEF0F3"}; }
    #map { position: absolute; top: 0; left: 0; right: 0; bottom: 0; }
    .maplibregl-ctrl { display: none !important; }
    .stop-marker-el { width: 0; height: 0; }
    .user-dot { width: 18px; height: 18px; border-radius: 9px; background: #2563EB; border: 3px solid #fff; box-shadow: 0 0 0 4px rgba(37,99,235,0.25); }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/maplibre-gl@latest/dist/maplibre-gl.js"></script>
  <script>
    var STYLE_URLS = ${JSON.stringify(STYLE_URLS)};
    var glyphs = ${JSON.stringify(GLYPH_SVG)};
    var selectedId = ${selectedId};
    var selectedLineId = ${selectedLineId};
    var markerObjs = [];
    var userMarker = null;

    var map = new maplibregl.Map({
      container: 'map',
      style: STYLE_URLS['${theme}'],
      center: [${center.lng}, ${center.lat}],
      zoom: ${zoom},
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
      interactive: ${interactive}
    });

    function markerEl(m, isSelected) {
      var size = isSelected ? 40 : 30;
      var iconSize = isSelected ? 18 : 14;
      var glyph = glyphs[m.glyph] || glyphs.bus;
      var el = document.createElement('div');
      el.style.width = size + 'px';
      el.style.height = size + 'px';
      el.style.borderRadius = (size / 2) + 'px';
      el.style.background = m.color;
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.4)';
      el.style.border = '2px solid #fff';
      el.style.cursor = 'pointer';
      el.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="' + iconSize + '" height="' + iconSize + '" fill="#fff">' + glyph + '</svg>';
      return el;
    }

    function clearMarkers() {
      markerObjs.forEach(function (mk) { mk.remove(); });
      markerObjs = [];
    }

    function setMarkers(list) {
      clearMarkers();
      list.forEach(function (m) {
        var isSelected = m.id === selectedId;
        var el = markerEl(m, isSelected);
        if (${interactive}) {
          el.addEventListener('click', function () {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'stopPress', id: m.id }));
            }
          });
        }
        var marker = new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat([m.lng, m.lat]).addTo(map);
        markerObjs.push(marker);
      });
    }

    function addLineLayers(lines) {
      lines.forEach(function (line, i) {
        var sourceId = 'line-src-' + i;
        var layerId = 'line-layer-' + i;
        if (map.getLayer(layerId)) map.removeLayer(layerId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
        if (!line.coordinates || line.coordinates.length < 2) return;
        var isDimmed = selectedLineId && line.id !== selectedLineId;
        var isSelected = selectedLineId && line.id === selectedLineId;
        map.addSource(sourceId, {
          type: 'geojson',
          data: { type: 'Feature', geometry: { type: 'LineString', coordinates: line.coordinates }, properties: {} }
        });
        map.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': line.color,
            'line-width': isSelected ? 5 : 3.5,
            'line-opacity': isDimmed ? 0.25 : 0.95
          }
        });
      });
    }

    function setLines(lines) {
      window.__pendingLines = lines;
      if (map.isStyleLoaded()) {
        addLineLayers(lines);
      }
    }

    function setTheme(theme) {
      var currentMarkers = window.__lastMarkers || [];
      var currentLines = window.__pendingLines || [];
      map.setStyle(STYLE_URLS[theme]);
      map.once('styledata', function () {
        addLineLayers(currentLines);
      });
    }

    function flyTo(lat, lng, zoom) {
      map.flyTo({ center: [lng, lat], zoom: zoom || map.getZoom(), duration: 600 });
    }

    function setUserLocation(lat, lng) {
      if (userMarker) {
        userMarker.setLngLat([lng, lat]);
      } else {
        var el = document.createElement('div');
        el.className = 'user-dot';
        userMarker = new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat([lng, lat]).addTo(map);
      }
    }

    window.setMarkers = function (list) {
      window.__lastMarkers = list;
      setMarkers(list);
    };
    window.setLines = setLines;
    window.setTheme = setTheme;
    window.flyToLocation = flyTo;
    window.setUserLocation = setUserLocation;

    map.on('load', function () {
      window.setMarkers(${markersJson});
      setLines(${linesJson});
      map.resize();
      ${fitToMarkers ? `try {
        var pts = ${JSON.stringify(opts.markers.map((m) => [m.lng, m.lat]))};
        var bounds = pts.reduce(function (b, p) { return b.extend(p); }, new maplibregl.LngLatBounds(pts[0], pts[0]));
        map.fitBounds(bounds, { padding: 48, maxZoom: 15, duration: 0 });
      } catch (e) {}` : ""}
      ${
        opts.selectedLineId
          ? `try {
        var linePts = ${JSON.stringify((opts.lines?.find((l) => l.id === opts.selectedLineId)?.coordinates) ?? [])};
        if (linePts.length > 1) {
          var lb = linePts.reduce(function (b, p) { return b.extend(p); }, new maplibregl.LngLatBounds(linePts[0], linePts[0]));
          map.fitBounds(lb, { padding: 56, maxZoom: 15, duration: 0 });
        }
      } catch (e) {}`
          : ""
      }
    });
  </script>
</body>
</html>`;
}
