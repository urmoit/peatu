import type { Trip, TripLeg, RouteOption } from "@/types";

export const RECENT_TRIPS: Trip[] = [
  {
    id: "trip-1",
    from: "Viru keskus",
    to: "Balti jaam",
    duration: 8,
    transfers: 0,
    departure: "08:15",
    arrival: "08:23",
    legs: [
      { type: "tram", from: "Viru keskus", to: "Balti jaam", line: "2", duration: 8, departure: "08:15", arrival: "08:23" },
    ],
  },
  {
    id: "trip-2",
    from: "Tallinna bussijaam",
    to: "Mustamäe",
    duration: 25,
    transfers: 1,
    departure: "07:30",
    arrival: "07:55",
    legs: [
      { type: "bus", from: "Tallinna bussijaam", to: "Vabaduse väljak", line: "176", duration: 12, departure: "07:30", arrival: "07:42" },
      { type: "walk", from: "Vabaduse väljak", to: "Vabaduse väljak", duration: 3 },
      { type: "bus", from: "Vabaduse väljak", to: "Mustamäe", line: "21", duration: 10, departure: "07:45", arrival: "07:55" },
    ],
  },
  {
    id: "trip-3",
    from: "Keskturg",
    to: "Lasnamäe",
    duration: 35,
    transfers: 1,
    departure: "12:00",
    arrival: "12:35",
    legs: [
      { type: "trolley", from: "Keskturg", to: "Sõpruse pst", line: "2", duration: 15, departure: "12:00", arrival: "12:15" },
      { type: "walk", from: "Sõpruse pst", to: "Sõpruse pst", duration: 2 },
      { type: "bus", from: "Sõpruse pst", to: "Lasnamäe", line: "14", duration: 18, departure: "12:17", arrival: "12:35" },
    ],
  },
];

export const ROUTE_OPTIONS: RouteOption[] = [
  {
    id: "route-1",
    duration: 8,
    transfers: 0,
    departure: "08:15",
    arrival: "08:23",
    legs: [
      { type: "tram", from: "Viru keskus", to: "Balti jaam", line: "2", duration: 8, departure: "08:15", arrival: "08:23" },
    ],
  },
  {
    id: "route-2",
    duration: 12,
    transfers: 0,
    departure: "08:18",
    arrival: "08:30",
    legs: [
      { type: "bus", from: "Viru keskus", to: "Balti jaam", line: "20", duration: 12, departure: "08:18", arrival: "08:30" },
    ],
  },
  {
    id: "route-3",
    duration: 18,
    transfers: 1,
    departure: "08:20",
    arrival: "08:38",
    legs: [
      { type: "walk", from: "Viru keskus", to: "Viru keskus", duration: 3 },
      { type: "tram", from: "Viru keskus", to: "Hobujaama", line: "1", duration: 5, departure: "08:23", arrival: "08:28" },
      { type: "walk", from: "Hobujaama", to: "Hobujaama", duration: 2 },
      { type: "bus", from: "Hobujaama", to: "Balti jaam", line: "41", duration: 8, departure: "08:30", arrival: "08:38" },
    ],
  },
];

export function getDeparturesForStop(stopId: string) {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();

  const mockLines = ["1", "2", "3", "4", "20", "20A", "21", "21B", "176", "176A"];
  const mockModes = ["tram", "bus", "tram", "bus", "bus", "bus", "bus", "bus", "bus", "bus"] as const;

  return mockLines.map((line, i) => {
    const mode = mockModes[i];
    const baseEta = 2 + (i * 3) + Math.floor(Math.random() * 4);
    return {
      line,
      mode,
      direction: `${line} → Terminal`,
      etaMin: baseEta,
      scheduled: `${String((hour + Math.floor((minute + baseEta) / 60)) % 24).padStart(2, "0")}:${String((minute + baseEta) % 60).padStart(2, "0")}`,
      realtime: Math.random() > 0.3,
    };
  });
}