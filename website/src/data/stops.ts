import type { Stop } from "@/types";

export const STOPS: Stop[] = [
  {
    id: "1001",
    name: "Viru keskus",
    lat: 59.4369,
    lng: 24.7611,
    modes: ["tram", "bus"],
    lines: ["1", "2", "3", "4", "20", "20A", "21", "21B"],
  },
  {
    id: "1002",
    name: "Balti jaam",
    lat: 59.4392,
    lng: 24.7447,
    modes: ["train", "tram", "bus"],
    lines: ["1", "2", "4", "20", "20A", "102", "105", "105A", "139", "140"],
  },
  {
    id: "1003",
    name: "Tallinna bussijaam",
    lat: 59.4321,
    lng: 24.7564,
    modes: ["bus"],
    lines: ["176", "176A", "184", "185", "188", "189"],
  },
  {
    id: "1004",
    name: "Vabaduse väljak",
    lat: 59.4338,
    lng: 24.7458,
    modes: ["tram", "bus"],
    lines: ["1", "2", "3", "20", "20A", "21", "21B", "41", "41B"],
  },
  {
    id: "1005",
    name: "Keskturg",
    lat: 59.4375,
    lng: 24.7472,
    modes: ["bus", "trolley"],
    lines: ["2", "3", "4", "17", "17A", "23", "32", "34A", "38", "43"],
  },
  {
    id: "1006",
    name: "Hobujaama",
    lat: 59.4352,
    lng: 24.7498,
    modes: ["tram", "bus"],
    lines: ["1", "2", "3", "4", "20", "20A", "21", "21B", "41", "41B"],
  },
  {
    id: "1007",
    name: "Estonia",
    lat: 59.4345,
    lng: 24.7542,
    modes: ["tram", "bus"],
    lines: ["1", "2", "3", "4", "20", "20A"],
  },
  {
    id: "1008",
    name: "Köismäe",
    lat: 59.4289,
    lng: 24.7241,
    modes: ["bus", "trolley"],
    lines: ["16", "16A", "20", "20A", "34A", "38", "43", "49"],
  },
  {
    id: "1009",
    name: "Sõpruse pst",
    lat: 59.4256,
    lng: 24.7742,
    modes: ["bus", "trolley"],
    lines: ["1", "1A", "2", "3", "4", "5", "8", "10", "10A", "17", "17A", "18", "20", "20A", "21", "21B", "23", "24", "25", "26", "28", "29", "32", "33", "34", "34A", "35", "36", "37", "38", "39", "40", "41", "41B", "42", "43", "44", "45", "46", "47", "48", "49", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "60"],
  },
  {
    id: "1010",
    name: "Mustamäe",
    lat: 59.4156,
    lng: 24.6612,
    modes: ["bus", "trolley"],
    lines: ["11", "11A", "12", "12A", "13", "13A", "14", "14A", "15", "15A", "18", "19", "20", "20A", "21", "21B", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "34A", "35", "36", "37", "38", "39", "40", "41", "41B", "42", "43", "44", "45", "46", "47", "48", "49", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "60"],
  },
  {
    id: "1011",
    name: "Lasnamäe",
    lat: 59.4456,
    lng: 24.8532,
    modes: ["bus"],
    lines: ["14", "14A", "15", "15A", "18", "19", "20", "20A", "21", "21B", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "34A", "35", "36", "37", "38", "39", "40", "41", "41B", "42", "43", "44", "45", "46", "47", "48", "49", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "60", "176", "176A"],
  },
  {
    id: "1012",
    name: "Põhja-Tallinn",
    lat: 59.4567,
    lng: 24.7345,
    modes: ["bus", "tram"],
    lines: ["1", "2", "3", "4", "5", "5A", "6", "6A", "7", "7A", "8", "8A", "9", "9A", "10", "10A", "11", "11A", "12", "12A", "13", "13A", "14", "14A", "15", "15A", "16", "16A", "17", "17A", "18", "19", "20", "20A"],
  },
  {
    id: "1013",
    name: "Kalamaja",
    lat: 59.4456,
    lng: 24.7334,
    modes: ["bus", "tram"],
    lines: ["1", "2", "3", "4", "5", "5A", "6", "6A", "7", "7A", "8", "8A", "9", "9A", "10", "10A"],
  },
  {
    id: "1014",
    name: "Kopli",
    lat: 59.4534,
    lng: 24.6891,
    modes: ["bus", "tram"],
    lines: ["1", "2", "3", "4", "5", "5A", "6", "6A", "7", "7A"],
  },
  {
    id: "1015",
    name: "Rocca al Mare",
    lat: 59.4321,
    lng: 24.6345,
    modes: ["bus"],
    lines: ["16", "16A", "20", "20A", "21", "21B", "38", "43", "49"],
  },
  {
    id: "1016",
    name: "Õismäe",
    lat: 59.4089,
    lng: 24.6456,
    modes: ["bus", "trolley"],
    lines: ["16", "16A", "20", "20A", "34A", "38", "43", "49"],
  },
  {
    id: "1017",
    name: "Sitsi",
    lat: 59.4245,
    lng: 24.6678,
    modes: ["bus", "trolley"],
    lines: ["16", "16A", "20", "20A", "34A", "38", "43", "49"],
  },
  {
    id: "1018",
    name: "Väike-Õismäe",
    lat: 59.4045,
    lng: 24.6234,
    modes: ["bus", "trolley"],
    lines: ["16", "16A", "20", "20A", "34A", "38", "43", "49"],
  },
  {
    id: "1019",
    name: "Astangu",
    lat: 59.3989,
    lng: 24.6012,
    modes: ["bus"],
    lines: ["16", "16A", "20", "20A"],
  },
  {
    id: "1020",
    name: "Kloostrimetsa",
    lat: 59.3945,
    lng: 24.5891,
    modes: ["bus"],
    lines: ["16", "16A", "20", "20A"],
  },
];

export function getStopById(id: string): Stop | undefined {
  return STOPS.find((s) => s.id === id);
}

export function getDeparturesForStop(stopId: string) {
  const stop = getStopById(stopId);
  if (!stop) return [];

  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();

  const modes = stop.modes;
  const lines = stop.lines.slice(0, 5);

  return lines.map((line, i) => {
    const mode = modes[i % modes.length] as "bus" | "train" | "tram" | "trolley";
    const baseEta = 2 + (i * 3) + Math.floor(Math.random() * 4);
    return {
      line,
      mode,
      direction: `${stop.name} → Terminal`,
      etaMin: baseEta,
      scheduled: `${String((hour + Math.floor((minute + baseEta) / 60)) % 24).padStart(2, "0")}:${String((minute + baseEta) % 60).padStart(2, "0")}`,
      realtime: Math.random() > 0.3,
    };
  });
}