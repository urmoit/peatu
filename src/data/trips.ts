import type { RecentTrip, RoadmapItem, RouteOption } from "@/types";

export const RECENT_TRIPS: RecentTrip[] = [
  { id: "r1", from: "Viru Keskus", to: "Mustamäe Keskus", duration: "22 min", modes: ["walk", "bus", "walk"] },
  { id: "r2", from: "Balti Jaam", to: "Ülemiste Keskus", duration: "28 min", modes: ["walk", "tram", "walk"] },
  { id: "r3", from: "Tondi", to: "Viru Keskus", duration: "15 min", modes: ["tram"] },
  { id: "r4", from: "Kullo", to: "Vabaduse väljak", duration: "10 min", modes: ["walk", "bus"] },
  { id: "r5", from: "Tallinn Lennujaam", to: "Balti Jaam", duration: "18 min", modes: ["bus", "walk"] },
];

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
  { status: "done", title: "Full Tallinn network map", detail: "All 80 TLT lines with real GTFS route shapes" },
  { status: "next", title: "Live departures", detail: "Real-time countdowns per stop (GTFS-RT)" },
  { status: "next", title: "Trip planner with transfers", detail: "Real routes across bus, tram and train" },
  { status: "next", title: "Train connections", detail: "Full Elron network with stations and schedules" },
  { status: "next", title: "Ferry connections", detail: "Harbour ferries, including Tallinn–Helsinki" },
  { status: "later", title: "Service alerts", detail: "Disruptions, detours and stop closures" },
  { status: "later", title: "More cities", detail: "Tartu, Pärnu and the rest of Estonia" },
];
