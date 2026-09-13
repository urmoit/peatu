# Peatu — native Expo app

This is a full rebuild of your Peatu app as a **real native React Native app**, using
[Expo Router](https://docs.expo.dev/router/introduction/) with file-based navigation.

Your original `PeatuMobile.zip` was a single `WebView` (`react-native-webview`) loading one
big bundled HTML/JS file (`assets/peatU-app.html`). It looked like an app but was really a
website in a wrapper — that's why alignment, spacing, and safe-area handling felt off on
real devices (no native safe-area insets, no native touch feedback, no platform-correct
shadows/elevation, etc).

This version is the opposite: every screen is a real `.tsx` file made of native components
(`View`, `Text`, `FlatList`, `Pressable`, ...), styled with `StyleSheet`, laid out with
`react-native-safe-area-context` so content never sits under the notch/home indicator, and
using platform-correct shadows (`shadowOpacity`/`shadowRadius` on iOS, `elevation` on
Android) instead of CSS box-shadow.

## Run it

```bash
npm install
npx expo start
```

Then scan the QR code with **Expo Go** (iOS/Android) or press `i` / `a` for a simulator.

> Native module versions were hand-picked to match Expo SDK 57. If a dependency ever
> complains about a version mismatch, run `npx expo install --fix` to let Expo realign
> everything automatically (this sandbox couldn't reach `api.expo.dev` to verify versions
> for you, so it's worth running once on your machine).

## Project structure

```
app/                       expo-router routes (file path = URL path)
  _layout.tsx               root stack + theme/safe-area providers
  index.tsx                 decides onboarding vs. home on launch
  onboarding.tsx             first-run carousel
  search.tsx                 modal stop search
  planner.tsx                 trip planner + route options
  stop/[id].tsx               stop detail + live-style departures
  route/[id].tsx               route/trip detail timeline
  (tabs)/
    _layout.tsx               bottom tab bar
    index.tsx                 Home
    map.tsx                    Map (react-native-maps)
    saved.tsx                   Saved stops
    settings.tsx                 Settings

src/
  components/                 shared UI: ModeIcon, ModeBadge, LineBadge, Card, StopRow, ...
  data/                        stops / departures / routes / roadmap (ported from the HTML app)
  theme/                       light + dark color palettes, ThemeContext (persisted)
  utils/                       AsyncStorage helpers, geo distance helpers
  types.ts                     shared TypeScript types
```

## What changed for "better UI / alignment on mobile"

- **Real safe areas** — every screen uses `useSafeAreaInsets()` so headers clear the
  status bar/notch and lists clear the home indicator and tab bar, on every device size.
- **Consistent spacing scale** — 16px screen padding, 8/10/12/14px internal rhythm reused
  everywhere instead of ad-hoc CSS values.
- **Native lists** — `FlatList` for stops/results instead of a scrolling `<div>`, so long
  lists stay smooth and don't jank on real devices.
- **Platform-correct elevation** — cards use `shadowColor/shadowOpacity/shadowRadius` on
  iOS and `elevation` on Android, so depth looks right on both.
- **Native gestures & feedback** — `Pressable` press states and Android ripple, instead of
  CSS `:hover`/`:active`, which don't really exist on touch.
- **Persisted state** — theme, saved stops, and map filters are saved with
  `@react-native-async-storage/async-storage`, so preferences survive app restarts (the
  WebView version reset a lot of this on reload).
- **A real interactive map** — the Map tab now uses `react-native-maps` with tappable
  markers instead of the flat SVG placeholder in the original HTML.

## What changed in this update

- **No more Google Maps.** The Map tab and the stop-detail mini map now use a custom
  Leaflet-based map (`src/components/CustomMap.tsx` + `src/utils/leafletHtml.ts`) rendered
  in a small scoped `WebView`, using free OpenStreetMap/CARTO tiles — the same engine your
  original app used, with **no API key, no billing, and no native map SDK config**. This is
  the only WebView left in the app, and it's just for map tiles, not the whole UI. Markers,
  filtering, pan/zoom, and theme switching are all handled without reloading the page.
- **Better onboarding** — a language switch top-right, a soft color glow behind each slide,
  a ringed icon treatment, and a progress dot bar that matches the active slide's accent
  color.
- **English / Estonian language support** — `src/i18n/`. A compact flag toggle appears on
  onboarding; a full dropdown row (`Language`) is the first item in Settings. Persisted via
  AsyncStorage. Nearly all UI chrome (buttons, headers, empty states, settings copy) is
  translated; stop/area names stay as real Estonian place names in both languages, same as
  transit line names would.
- **Much bigger stop dataset** — `src/data/stops.ts` now has 71 stops spanning every
  district (Kesklinn, Kristiine, Põhja-Tallinn, Lasnamäe, Mustamäe, Nõmme, Haabersti,
  Pirita) instead of 18, so Search actually has something to search. Note: these are
  hand-curated, realistically-placed stops, not a full official GTFS import — there's no
  live Tallinn transit data source wired up in this sandbox. If you have access to the
  Estonian GTFS feed (Transportation Administration / peatus.ee), swapping this file for a
  generated one from that feed is the natural next step.

## Notes on the map

- Tiles come from **OpenStreetMap's own tile server** (`tile.openstreetmap.org`) — free,
  keyless, single domain. CARTO's free basemap tiles (which the previous build used)
  started requiring a paid API key partway through this project, so they were dropped
  entirely rather than shipping something that degrades later. Dark mode is done with a
  CSS filter on the tile layer (OSM only serves one light style for free) rather than a
  second tile provider.
- The map sets an explicit `strict-origin-when-cross-origin` referrer policy and gives the
  WebView a real `https://` base URL, both required by OSM's tile usage policy — without
  them some networks/carriers will silently drop the tile requests.
- OSM's tile server is explicitly meant for **light/moderate use**, not high-traffic
  production apps — see `operations.osmfoundation.org/policies/tiles`. That's the right fit
  here; if this app ever gets real production traffic, switching to a paid provider
  (MapTiler, Thunderforest, Stadia, or CARTO with a key) is a five-minute change — just the
  one `TILE_URL` constant in `src/utils/leafletHtml.ts`.
- Marker taps navigate to the stop detail screen; the "locate me" button asks for location
  permission and flies the map to your position with a blue dot. The map also auto-fits its
  initial view to whatever markers are visible, instead of a fixed zoom level.

## Visual pass (onboarding / home / saved)

- Onboarding: dropped the nested-square icon treatment for a single accent-colored icon
  circle with a soft halo ring, added a blurred color glow behind the header (via
  `expo-blur`) that shifts per-slide, and restyled the eyebrow label as a pill instead of
  plain caps text.
- Home & Saved: both now share a `HeaderGlow` component (soft blurred color blob behind the
  header) so the top of each tab doesn't feel like a flat list of text. Stop rows got a
  colored left accent bar (matching the stop's primary transit mode) and the ETA is now a
  pill instead of plain numbers. Recent-trip cards got a proper mini route line (origin dot
  → dashed line → destination square) instead of just stacked labels.

