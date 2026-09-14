import { DESTS, STOP_TIMETABLES, STOP_TIMETABLE_ALIAS, type TimeSpec } from "@/data/timetables";
import type { Departure } from "@/types";

// The bundled GTFS feed uses three global service patterns (no exceptions):
// Mon–Fri, Saturday, Sunday.
function dayKey(date: Date): "w" | "s" | "u" {
  const d = date.getDay();
  return d === 0 ? "u" : d === 6 ? "s" : "w";
}

/** Expand compressed times (singles + [start,end,step] runs) at/after fromMin. */
function collectAfter(specs: TimeSpec[], fromMin: number, out: number[]) {
  for (const s of specs) {
    if (typeof s === "number") {
      if (s >= fromMin) out.push(s);
    } else {
      const start = s[0];
      const end = s[1];
      const step = s[2];
      if (end < fromMin || step <= 0) continue;
      let t = start;
      if (t < fromMin) t += Math.ceil((fromMin - t) / step) * step;
      for (; t <= end; t += step) out.push(t);
    }
  }
}

/**
 * Real scheduled departures for a stop, derived from the bundled GTFS
 * timetable and evaluated against the device clock. Hand-anchor stops
 * transparently merge the timetables of their nearby real platforms.
 * Late-night trips past 24:00 belong to the same service day; when today
 * runs out, the first trips of tomorrow fill the list.
 */
export function getDeparturesForStop(
  stopId: string | undefined | null,
  limit = 20,
  now = new Date()
): Departure[] {
  if (!stopId) return [];
  const ids = STOP_TIMETABLE_ALIAS[stopId] ?? [stopId];
  const nowMin = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  const today = dayKey(now);
  const tomorrow = dayKey(new Date(now.getTime() + 24 * 3600 * 1000));

  const hits: { t: number; n: string; m: (typeof STOP_TIMETABLES[string][number])["m"]; g: number }[] = [];
  for (const id of ids) {
    const lines = STOP_TIMETABLES[id];
    if (!lines) continue;
    for (const e of lines) {
      const todayTimes: number[] = [];
      collectAfter(e[today], nowMin, todayTimes);
      for (const t of todayTimes) hits.push({ t, n: e.n, m: e.m, g: e.g });
      const nextTimes: number[] = [];
      collectAfter(e[tomorrow], 0, nextTimes);
      for (const t of nextTimes.slice(0, 3)) hits.push({ t: t + 1440, n: e.n, m: e.m, g: e.g });
    }
  }
  hits.sort((a, b) => a.t - b.t);

  // Collapse near-duplicates: hub anchors merge several platforms, so the
  // same vehicle can appear minutes apart under one line + destination.
  const merged: typeof hits = [];
  for (const h of hits) {
    const dup = merged.some((k) => k.n === h.n && k.g === h.g && Math.abs(k.t - h.t) <= 2);
    if (!dup) merged.push(h);
    if (merged.length >= limit) break;
  }

  return merged.map((h, i) => ({
    id: `${stopId}-${i}`,
    line: h.n,
    mode: h.m,
    destination: DESTS[h.g] ?? "",
    etaMin: Math.max(0, Math.round(h.t - nowMin)),
  }));
}
