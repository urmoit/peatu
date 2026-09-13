import type { Departure, RecentTrip, RoadmapItem, RouteOption } from "@/types";

export const RECENT_TRIPS: RecentTrip[] = [
  { id: "r1", from: "Viru Keskus", to: "Mustamäe Keskus", duration: "22 min", modes: ["walk", "bus", "walk"] },
  { id: "r2", from: "Balti Jaam", to: "Ülemiste Keskus", duration: "28 min", modes: ["walk", "tram", "walk"] },
  { id: "r3", from: "Tondi", to: "Viru Keskus", duration: "15 min", modes: ["tram"] },
  { id: "r4", from: "Kullo", to: "Vabaduse väljak", duration: "10 min", modes: ["walk", "bus"] },
  { id: "r5", from: "Tallinn Lennujaam", to: "Balti Jaam", duration: "18 min", modes: ["bus", "walk"] },
];

const DEPARTURES_BY_STOP: Record<string, Departure[]> = {
  s1: [
    { id: "d1", line: "3", mode: "bus", destination: "Mustamäe Keskus", etaMin: 4 },
    { id: "d2", line: "1", mode: "tram", destination: "Kadaka", etaMin: 7 },
    { id: "d3", line: "5", mode: "bus", destination: "Haabersti", etaMin: 12 },
    { id: "d4", line: "2", mode: "tram", destination: "Suur-Paala", etaMin: 15 },
    { id: "d5", line: "36", mode: "bus", destination: "Pelguranna", etaMin: 18 },
    { id: "d6", line: "67", mode: "bus", destination: "Rocca al Mare", etaMin: 22 },
    { id: "d7", line: "4", mode: "tram", destination: "Tondi", etaMin: 25 },
  ],
  s2: [
    { id: "d1", line: "P1", mode: "train", destination: "Nõmme Keskus", etaMin: 3 },
    { id: "d2", line: "8", mode: "bus", destination: "Vana-Pääsküla", etaMin: 8 },
    { id: "d3", line: "1", mode: "tram", destination: "Kadaka", etaMin: 11 },
    { id: "d4", line: "P2", mode: "train", destination: "Laagri", etaMin: 14 },
    { id: "d5", line: "40", mode: "bus", destination: "Pelguranna", etaMin: 17 },
  ],
  s4: [
    { id: "d1", line: "7", mode: "bus", destination: "Balti Jaam", etaMin: 5 },
    { id: "d2", line: "4", mode: "trolley", destination: "Mustamäe Keskus", etaMin: 9 },
    { id: "d3", line: "T2", mode: "trolley", destination: "Vabaduse väljak", etaMin: 13 },
    { id: "d4", line: "12", mode: "bus", destination: "Viru Keskus", etaMin: 16 },
  ],
  s9: [
    { id: "d1", line: "5", mode: "bus", destination: "Mustamäe Keskus", etaMin: 2 },
    { id: "d2", line: "T1", mode: "trolley", destination: "Haabersti", etaMin: 6 },
    { id: "d3", line: "3", mode: "tram", destination: "Tondi", etaMin: 10 },
    { id: "d4", line: "20", mode: "bus", destination: "Pelguranna", etaMin: 14 },
  ],
  default: [
    { id: "d1", line: "5", mode: "bus", destination: "Viru Keskus", etaMin: 6 },
    { id: "d2", line: "1", mode: "tram", destination: "Kadaka", etaMin: 11 },
    { id: "d3", line: "3", mode: "bus", destination: "Mustamäe Keskus", etaMin: 14 },
    { id: "d4", line: "67", mode: "bus", destination: "Rocca al Mare", etaMin: 19 },
    { id: "d5", line: "P1", mode: "train", destination: "Nõmme Keskus", etaMin: 24 },
  ],
};

export function getDeparturesForStop(stopId: string): Departure[] {
  return DEPARTURES_BY_STOP[stopId] ?? DEPARTURES_BY_STOP.default;
}

export const ROUTE_OPTIONS: RouteOption[] = [
  {
    id: "ro1",
    totalDuration: "28 min",
    transfers: 1,
    startTime: "14:32",
    endTime: "15:00",
    price: "€2.20",
    legs: [
      { id: "l1", mode: "walk", fromStop: "Your location", toStop: "Viru Keskus", startTime: "14:32", endTime: "14:38", duration: "6 min" },
      { id: "l2", mode: "bus", line: "3", fromStop: "Viru Keskus", toStop: "Mustamäe Keskus", startTime: "14:38", endTime: "14:55", duration: "17 min", stops: 9 },
      { id: "l3", mode: "walk", fromStop: "Mustamäe Keskus", toStop: "Destination", startTime: "14:55", endTime: "15:00", duration: "5 min" },
    ],
  },
  {
    id: "ro2",
    totalDuration: "35 min",
    transfers: 2,
    startTime: "14:40",
    endTime: "15:15",
    price: "€3.40",
    legs: [
      { id: "l1", mode: "walk", fromStop: "Your location", toStop: "Vabaduse väljak", startTime: "14:40", endTime: "14:48", duration: "8 min" },
      { id: "l2", mode: "tram", line: "1", fromStop: "Vabaduse väljak", toStop: "Tondi", startTime: "14:48", endTime: "15:02", duration: "14 min", stops: 7 },
      { id: "l3", mode: "bus", line: "12", fromStop: "Tondi", toStop: "Mustamäe Keskus", startTime: "15:02", endTime: "15:10", duration: "8 min", stops: 4 },
      { id: "l4", mode: "walk", fromStop: "Mustamäe Keskus", toStop: "Destination", startTime: "15:10", endTime: "15:15", duration: "5 min" },
    ],
  },
  {
    id: "ro3",
    totalDuration: "22 min",
    transfers: 0,
    startTime: "14:45",
    endTime: "15:07",
    price: "€2.20",
    legs: [
      { id: "l1", mode: "walk", fromStop: "Your location", toStop: "Pärnu mnt", startTime: "14:45", endTime: "14:50", duration: "5 min" },
      { id: "l2", mode: "bus", line: "5", fromStop: "Pärnu mnt", toStop: "Mustamäe Keskus", startTime: "14:50", endTime: "15:05", duration: "15 min", stops: 8 },
      { id: "l3", mode: "walk", fromStop: "Mustamäe Keskus", toStop: "Destination", startTime: "15:05", endTime: "15:07", duration: "2 min" },
    ],
  },
];

export function getRouteById(id: string | undefined | null): RouteOption {
  return ROUTE_OPTIONS.find((r) => r.id === id) ?? ROUTE_OPTIONS[0];
}

export const ROADMAP: RoadmapItem[] = [
  { status: "next", title: "Full Tallinn network map", detail: "All ~80 lines with real GTFS route shapes (currently a small sample set)" },
  { status: "next", title: "Live departures", detail: "Real-time countdowns per stop (GTFS-RT)" },
  { status: "next", title: "Trip planner with transfers", detail: "Real routes across bus, tram and trolley" },
  { status: "later", title: "Service alerts", detail: "Disruptions, detours and stop closures" },
  { status: "later", title: "More cities", detail: "Tartu, Pärnu and the rest of Estonia" },
];
