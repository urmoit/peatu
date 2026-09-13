import { getStopById } from "./stops";
import type { TransitLine } from "@/types";

// A small, hand-picked set of illustrative route shapes connecting real stops
// from src/data/stops.ts — NOT the full official Tallinn network (~80 lines).
// There's no live GTFS shapes feed wired into this app, so these exist to
// show what route lines on the map look like rather than to be a routing
// source of truth. See README for notes on wiring up the real feed.
export const TRANSIT_LINES: TransitLine[] = [
  {
    id: "line-tram-1",
    number: "1",
    mode: "tram",
    name: "Kopli – Kadriorg",
    color: "#EF4444",
    stopIds: ["s33", "s32", "s2", "s1", "s19", "s26"],
  },
  {
    id: "line-tram-2",
    number: "2",
    mode: "tram",
    name: "Kopli – Tondi",
    color: "#F97316",
    stopIds: ["s33", "s34", "s2", "s14", "s3"],
  },
  {
    id: "line-tram-3",
    number: "3",
    mode: "tram",
    name: "Tondi – Kadriorg",
    color: "#14B8A6",
    stopIds: ["s3", "s7", "s1", "s26"],
  },
  {
    id: "line-tram-4",
    number: "4",
    mode: "tram",
    name: "Tondi – Kopli",
    color: "#A855F7",
    stopIds: ["s3", "s7", "s2", "s33"],
  },
  {
    id: "line-trolley-1",
    number: "1",
    mode: "trolley",
    name: "Vabaduse väljak – Mustamäe Keskus",
    color: "#F59E0B",
    stopIds: ["s14", "s27", "s31", "s49", "s10", "s5"],
  },
  {
    id: "line-trolley-3",
    number: "3",
    mode: "trolley",
    name: "Vabaduse väljak – Lasnamäe Keskus",
    color: "#EC4899",
    stopIds: ["s14", "s20", "s46", "s43", "s40", "s38"],
  },
  {
    id: "line-bus-17",
    number: "17",
    mode: "bus",
    name: "Väike-Õismäe – Ülemiste Keskus",
    color: "#3B82F6",
    stopIds: ["s60", "s61", "s11", "s28", "s3", "s4"],
  },
  {
    id: "line-bus-8",
    number: "8",
    mode: "bus",
    name: "Balti Jaam – Nõmme Keskus",
    color: "#06B6D4",
    stopIds: ["s2", "s55", "s54", "s16"],
  },
  {
    id: "line-bus-34",
    number: "34",
    mode: "bus",
    name: "Rocca al Mare – Lasnamäe Keskus",
    color: "#84CC16",
    stopIds: ["s12", "s11", "s14", "s1", "s38"],
  },
  {
    id: "line-bus-40",
    number: "40",
    mode: "bus",
    name: "Pelguranna – Priisle",
    color: "#6366F1",
    stopIds: ["s18", "s32", "s1", "s4", "s41"],
  },
];

export function getLineById(id: string | undefined | null): TransitLine | undefined {
  return TRANSIT_LINES.find((l) => l.id === id);
}

export function lineCoordinates(line: TransitLine): { lat: number; lng: number }[] {
  return line.stopIds.map((id) => {
    const stop = getStopById(id);
    return { lat: stop.lat, lng: stop.lng };
  });
}
