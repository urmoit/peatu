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
  Leaflet-based map (`src/components/CustomMap.tsx` + `src/utils/mapHtml.ts`) rendered
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

- **The map now has an automatic fallback.** MapLibre GL (vector, WebGL-based) is tried
  first for the nicer OpenFreeMap styling. But WebGL support inside Android's WebView is
  inconsistent across devices/OEMs even when the device's own browser supports it fine —
  on a WebGL-less device, MapLibre would previously fail to render *anything at all*
  (worse than the old raster-tile bug, which at least drew markers). Now, if WebGL isn't
  detected, or MapLibre's `load` event doesn't fire within 4 seconds (CDN unreachable,
  style failed, etc.), the map transparently falls back to Leaflet + plain OpenStreetMap
  raster tiles — same `<img>`-tag approach that works in every WebView regardless of GPU
  support. Both engines are driven through the same `window.setMarkers/setLines/setTheme/…`
  API, so the React Native side (`CustomMap.tsx`) doesn't need to know or care which one is
  actually active.
- Tiles/styles: MapLibre path uses [OpenFreeMap](https://openfreemap.org) (`liberty` for
  light, `dark` for dark — the same Dark Matter style family as most "dark transit map"
  apps). Fallback path uses `tile.openstreetmap.org` (free, keyless, single domain) with a
  CSS filter for dark mode, since OSM only serves one light style for free.
- The map auto-fits to whatever's visible (all stops, or a single selected line + its
  route), and both engines re-measure after mount to dodge WebView container sizing races.

## Stops now hide until you zoom in

A city-wide view with 70+ overlapping stop pins was unreadable — you couldn't see the route
lines under them, and finding a specific stop meant hunting through a pile of icons. Stops
now stay hidden until the map is zoomed to street level (zoom 14+); route lines are always
visible at any zoom. A small "Zoom in to see stops" pill appears while they're hidden. This
applies to both map engines and to manual pan/zoom, filter changes, and line selection
(selecting a line zooms in far enough that its stops appear automatically). The stop-detail
mini-map is exempt — it's always just the one relevant stop, not clutter.

## Fixed: map ignoring dark mode on launch

If you'd explicitly chosen dark mode before (saved to AsyncStorage) but your system theme
is light, the app's very first render briefly reports "light" (`useColorScheme()` resolves
synchronously; the saved preference loads a moment later via an async `AsyncStorage.getItem`
call). That's normally invisible, but the map's WebView used to bake in whatever theme was
current at that first instant, and the follow-up "switch to dark" message could arrive
*before* the Leaflet/MapLibre CDN scripts finished downloading — a bridge call with nothing
on the other end yet to receive it, silently dropped. Net effect: dark app chrome around a
map that stayed in light colors. Both engines now read a live, mutable theme value at the
moment they actually finish booting rather than one frozen at page-creation time, so a
theme change that arrives mid-boot is picked up instead of lost.

## Saved tab (redesigned)

- Now has two segments — **Stops** and **Lines** — instead of one flat list plus a generic
  "transit modes" info grid (dropped; it didn't relate to what's actually saved).
- Each saved item has a one-tap remove action instead of needing to go find it elsewhere to
  unsave it.
- Lines can now be bookmarked from three places: the search results list, the stop detail
  screen's "Lines" section, and the Map tab's line-selected pill — all writing to the same
  `peatu:saved-lines` AsyncStorage key so they stay in sync.

## Settings additions

- **Data section**: a "Saved items" row (tap → jumps to the Saved tab), "Show onboarding
  again" (replays the welcome flow), and "Clear saved stops & lines" (with a confirmation
  dialog before it touches anything).
- **Privacy row** under About, stating plainly that everything is stored locally on-device
  via AsyncStorage — no account, no analytics, no backend — because that's genuinely all
  this app does right now.

## Transit lines (new)

- `src/data/lines.ts` adds a small, hand-picked set of **illustrative** route shapes (a few
  trams, trolleybuses, and buses) connecting real stops from `src/data/stops.ts`, rendered
  as colored lines on the map — similar to the route line in the reference screenshot.
- **This is not the full official network.** Tallinn has roughly 80 real lines; there's no
  live GTFS shapes feed wired into this app, so fabricating all of them with accurate paths
  isn't possible here. The 10 sample lines exist to show the feature working end-to-end
  (map rendering, search, tap-to-highlight) — swapping in real shapes later just means
  replacing the contents of that one file with parsed GTFS `shapes.txt` data.
- Search now has a **Lines** section above **Stops** — matches by line number or route
  name. Tapping a line jumps to the Map tab, fits the view to that line, and dims every
  other line so it stands out.

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

