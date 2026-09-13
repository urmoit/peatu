import type { Stop } from "@/types";

export interface MapMarkerData {
  id: string;
  name: string;
  area: string;
  lat: number;
  lng: number;
  color: string;
  glyph: string;
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

export function buildMapHtml(opts: {
  center: { lat: number; lng: number };
  zoom: number;
  theme: "light" | "dark";
  interactive: boolean;
  markers: MapMarkerData[];
  selectedId?: string;
}) {
  const { center, zoom, theme, interactive } = opts;
  const markersJson = JSON.stringify(opts.markers);
  const selectedId = JSON.stringify(opts.selectedId ?? null);
  const fitToMarkers = opts.markers.length > 1;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="referrer" content="strict-origin-when-cross-origin" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@latest/dist/leaflet.css" />
  <style>
    html, body { height: 100%; margin: 0; padding: 0; }
    #map { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: ${theme === "dark" ? "#0B0F17" : "#EEF0F3"}; }
    /* OSM only serves a light basemap for free — fake a dark map with a CSS
       filter on the tile layer rather than depending on a second, often
       key-gated, tile provider. */
    .leaflet-tile-pane { filter: ${theme === "dark" ? "invert(1) hue-rotate(180deg) brightness(0.95) contrast(0.85) saturate(0.7)" : "none"}; }
    .leaflet-control-attribution { font-size: 9px; }
    .stop-marker { background: transparent; border: none; }
    .user-dot { width: 18px; height: 18px; border-radius: 9px; background: #2563EB; border: 3px solid #fff; box-shadow: 0 0 0 4px rgba(37,99,235,0.25); }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@latest/dist/leaflet.js"></script>
  <script>
    // OpenStreetMap's own tile server: single domain, no API key, free for
    // light/moderate use (see operations.osmfoundation.org/policies/tiles).
    // CARTO's basemaps.cartocdn.com now requires a paid API key as of a
    // recent policy change, and its old lettered {s} subdomains never
    // resolved anyway — both are reasons the map was blank before.
    var TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
    var ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

    var map = L.map('map', {
      zoomControl: false,
      attributionControl: false,
      dragging: ${interactive},
      touchZoom: ${interactive},
      scrollWheelZoom: ${interactive},
      doubleClickZoom: ${interactive},
      boxZoom: ${interactive},
      keyboard: ${interactive}
    }).setView([${center.lat}, ${center.lng}], ${zoom});

    var tileLayer = L.tileLayer(TILE_URL, {
      attribution: ATTRIBUTION,
      maxZoom: 19,
      crossOrigin: true,
      referrerPolicy: 'strict-origin-when-cross-origin'
    }).addTo(map);

    var markerLayer = L.layerGroup().addTo(map);
    var userMarker = null;
    var selectedId = ${selectedId};

    function renderMarkerHtml(m, isSelected) {
      var size = isSelected ? 40 : 30;
      var iconSize = isSelected ? 18 : 14;
      var glyphs = ${JSON.stringify(GLYPH_SVG)};
      var glyph = glyphs[m.glyph] || glyphs.bus;
      return '<div style="width:' + size + 'px;height:' + size + 'px;border-radius:' + (size / 2) + 'px;background:' + m.color + ';display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.4);border:2px solid #fff;">' +
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="' + iconSize + '" height="' + iconSize + '" fill="#fff">' + glyph + '</svg></div>';
    }

    function setMarkers(list) {
      markerLayer.clearLayers();
      list.forEach(function (m) {
        var isSelected = m.id === selectedId;
        var icon = L.divIcon({
          className: 'stop-marker',
          html: renderMarkerHtml(m, isSelected),
          iconSize: [isSelected ? 40 : 30, isSelected ? 40 : 30],
          iconAnchor: [isSelected ? 20 : 15, isSelected ? 20 : 15]
        });
        var marker = L.marker([m.lat, m.lng], { icon: icon, riseOnHover: true });
        if (${interactive}) {
          marker.bindTooltip(m.name + ' · ' + m.area, { direction: 'top', offset: [0, -14] });
          marker.on('click', function () {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'stopPress', id: m.id }));
            }
          });
        }
        marker.addTo(markerLayer);
      });
    }

    function setTheme(theme) {
      var pane = document.querySelector('.leaflet-tile-pane');
      if (pane) {
        pane.style.filter = theme === 'dark' ? 'invert(1) hue-rotate(180deg) brightness(0.95) contrast(0.85) saturate(0.7)' : 'none';
      }
      document.getElementById('map').style.background = theme === 'dark' ? '#0B0F17' : '#EEF0F3';
    }

    function flyTo(lat, lng, zoom) {
      map.flyTo([lat, lng], zoom || map.getZoom(), { duration: 0.6 });
    }

    function setUserLocation(lat, lng) {
      if (userMarker) {
        userMarker.setLatLng([lat, lng]);
      } else {
        userMarker = L.marker([lat, lng], {
          icon: L.divIcon({ className: 'stop-marker', html: '<div class="user-dot"></div>', iconSize: [18, 18], iconAnchor: [9, 9] })
        }).addTo(map);
      }
    }

    window.setMarkers = setMarkers;
    window.setTheme = setTheme;
    window.flyToLocation = flyTo;
    window.setUserLocation = setUserLocation;

    setMarkers(${markersJson});

    // Some Android WebViews report a zero-size container on first layout pass,
    // which throws Leaflet's internal projection off. Re-measure a beat later.
    setTimeout(function () {
      map.invalidateSize();
      ${fitToMarkers ? `try {
        var bounds = L.latLngBounds(${JSON.stringify(opts.markers.map((m) => [m.lat, m.lng]))});
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      } catch (e) {}` : ""}
    }, 150);
  </script>
</body>
</html>`;
}
