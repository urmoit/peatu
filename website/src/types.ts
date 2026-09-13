export type ThemeMode = "light" | "dark";

export interface Stop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  modes: ("bus" | "train" | "tram" | "trolley")[];
  lines: string[];
}

export interface Departure {
  line: string;
  mode: "bus" | "train" | "tram" | "trolley";
  direction: string;
  etaMin: number;
  scheduled: string;
  realtime: boolean;
}

export interface Trip {
  id: string;
  from: string;
  to: string;
  duration: number;
  transfers: number;
  departure: string;
  arrival: string;
  legs: TripLeg[];
}

export interface TripLeg {
  type: "walk" | "bus" | "train" | "tram" | "trolley";
  from: string;
  to: string;
  line?: string;
  duration: number;
  departure?: string;
  arrival?: string;
}

export interface RouteOption {
  id: string;
  duration: number;
  transfers: number;
  legs: TripLeg[];
  departure: string;
  arrival: string;
}