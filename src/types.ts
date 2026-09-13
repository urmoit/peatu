export type TransitMode = "bus" | "train" | "tram" | "trolley" | "walk";

export interface Stop {
  id: string;
  name: string;
  area: string;
  distance: string;
  modes: TransitMode[];
  lat: number;
  lng: number;
}

export interface RecentTrip {
  id: string;
  from: string;
  to: string;
  duration: string;
  modes: TransitMode[];
}

export interface Departure {
  id: string;
  line: string;
  mode: TransitMode;
  destination: string;
  etaMin: number;
}

export interface RouteLeg {
  id: string;
  mode: TransitMode;
  line?: string;
  fromStop: string;
  toStop: string;
  startTime: string;
  endTime: string;
  duration: string;
  stops?: number;
}

export interface RouteOption {
  id: string;
  totalDuration: string;
  transfers: number;
  startTime: string;
  endTime: string;
  price: string;
  legs: RouteLeg[];
}

export interface RoadmapItem {
  status: "done" | "next" | "later";
  title: string;
  detail: string;
}

export type ThemeMode = "light" | "dark";
