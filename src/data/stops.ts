import type { Stop } from "@/types";

// A broad, hand-curated set of real Tallinn stop/area names across every district,
// with realistic (not survey-exact) coordinates. Not the full official GTFS feed —
// see README for notes on going further with a live data source.
export const STOPS: Stop[] = [
  // Kesklinn (city centre)
  { id: "s1", name: "Viru Keskus", area: "Kesklinn", distance: "120 m", modes: ["bus", "tram"], lat: 59.43667, lng: 24.75665 },
  { id: "s2", name: "Balti Jaam", area: "Kesklinn", distance: "450 m", modes: ["train", "bus", "tram"], lat: 59.44064, lng: 24.73856 },
  { id: "s6", name: "Kullo", area: "Kesklinn", distance: "300 m", modes: ["bus"], lat: 59.4301, lng: 24.7561 },
  { id: "s7", name: "Vana-Lõuna", area: "Kesklinn", distance: "550 m", modes: ["tram", "bus"], lat: 59.42189, lng: 24.74464 },
  { id: "s9", name: "Pärnu mnt", area: "Kesklinn", distance: "200 m", modes: ["bus", "tram"], lat: 59.4326, lng: 24.7497 },
  { id: "s13", name: "Tatari", area: "Kesklinn", distance: "350 m", modes: ["bus", "tram"], lat: 59.4348, lng: 24.7517 },
  { id: "s14", name: "Vabaduse väljak", area: "Kesklinn", distance: "400 m", modes: ["tram", "bus"], lat: 59.43294, lng: 24.74501 },
  { id: "s15", name: "Tallinna Ülikool", area: "Kesklinn", distance: "600 m", modes: ["bus", "tram"], lat: 59.43846, lng: 24.77135 },
  { id: "s19", name: "Hobujaama", area: "Kesklinn", distance: "280 m", modes: ["bus", "tram"], lat: 59.43740, lng: 24.75799 },
  { id: "s20", name: "Kaubamaja", area: "Kesklinn", distance: "150 m", modes: ["bus", "tram"], lat: 59.43478, lng: 24.75572 },
  { id: "s21", name: "A. Laikmaa", area: "Kesklinn", distance: "500 m", modes: ["bus"], lat: 59.43591, lng: 24.75750 },
  { id: "s22", name: "Estonia teater", area: "Kesklinn", distance: "620 m", modes: ["bus", "tram"], lat: 59.43391, lng: 24.75196 },
  { id: "s23", name: "Tammsaare park", area: "Kesklinn", distance: "700 m", modes: ["bus"], lat: 59.4308, lng: 24.7481 },
  { id: "s24", name: "Kivisilla", area: "Kesklinn", distance: "800 m", modes: ["bus"], lat: 59.4363, lng: 24.7295 },
  { id: "s25", name: "Raua", area: "Kesklinn", distance: "900 m", modes: ["bus"], lat: 59.43633, lng: 24.76465 },
  { id: "s26", name: "Kadriorg", area: "Kesklinn", distance: "1.1 km", modes: ["bus", "tram"], lat: 59.43864, lng: 24.78426 },
  { id: "s27", name: "Kentmanni", area: "Kesklinn", distance: "650 m", modes: ["bus"], lat: 59.4326, lng: 24.7548 },

  // Kristiine
  { id: "s3", name: "Tondi", area: "Kristiine", distance: "800 m", modes: ["bus", "tram"], lat: 59.41102, lng: 24.73317 },
  { id: "s28", name: "Kristiine Keskus", area: "Kristiine", distance: "1.2 km", modes: ["bus"], lat: 59.4232, lng: 24.7266 },
  { id: "s29", name: "Järve", area: "Kristiine", distance: "1.5 km", modes: ["bus", "train"], lat: 59.4197, lng: 24.7213 },
  { id: "s30", name: "Veerenni", area: "Kristiine", distance: "1.0 km", modes: ["bus"], lat: 59.42513, lng: 24.74855 },
  { id: "s31", name: "Tehnika", area: "Kristiine", distance: "1.1 km", modes: ["bus"], lat: 59.43416, lng: 24.72482 },

  // Põhja-Tallinn (Kalamaja / Kopli / Pelguranna / Paljassaare)
  { id: "s18", name: "Pelguranna", area: "Põhja-Tallinn", distance: "1.5 km", modes: ["bus"], lat: 59.4477, lng: 24.7276 },
  { id: "s32", name: "Kalamaja", area: "Põhja-Tallinn", distance: "1.0 km", modes: ["bus", "tram"], lat: 59.44535, lng: 24.73767 },
  { id: "s33", name: "Kopli", area: "Põhja-Tallinn", distance: "2.2 km", modes: ["bus", "tram"], lat: 59.4557, lng: 24.7204 },
  { id: "s34", name: "Sõle", area: "Põhja-Tallinn", distance: "1.7 km", modes: ["bus"], lat: 59.4482, lng: 24.7195 },
  { id: "s35", name: "Paljassaare", area: "Põhja-Tallinn", distance: "3.0 km", modes: ["bus"], lat: 59.46003, lng: 24.70386 },
  { id: "s36", name: "Stroomi", area: "Põhja-Tallinn", distance: "2.4 km", modes: ["bus"], lat: 59.454, lng: 24.7101 },
  { id: "s37", name: "Vanasadam", area: "Põhja-Tallinn", distance: "900 m", modes: ["bus", "tram", "ferry"], lat: 59.44420, lng: 24.75942 },
  { id: "s72", name: "Lennusadam", area: "Põhja-Tallinn", distance: "1.3 km", modes: ["ferry"], lat: 59.45008, lng: 24.73713 },

  // Lasnamäe
  { id: "s4", name: "Ülemiste Keskus", area: "Lasnamäe", distance: "1.1 km", modes: ["bus"], lat: 59.42334, lng: 24.79545 },
  { id: "s38", name: "Lasnamäe Keskus", area: "Lasnamäe", distance: "3.6 km", modes: ["bus"], lat: 59.4358, lng: 24.8092 },
  { id: "s39", name: "Mustakivi", area: "Lasnamäe", distance: "4.4 km", modes: ["bus"], lat: 59.4395, lng: 24.8345 },
  { id: "s40", name: "Pae", area: "Lasnamäe", distance: "3.2 km", modes: ["bus"], lat: 59.42616, lng: 24.80029 },
  { id: "s41", name: "Priisle", area: "Lasnamäe", distance: "5.5 km", modes: ["bus"], lat: 59.4419, lng: 24.8583 },
  { id: "s42", name: "Laagna", area: "Lasnamäe", distance: "4.0 km", modes: ["bus"], lat: 59.44021, lng: 24.84401 },
  { id: "s43", name: "Katleri", area: "Lasnamäe", distance: "3.8 km", modes: ["bus"], lat: 59.4321, lng: 24.7942 },
  { id: "s44", name: "Majaka", area: "Lasnamäe", distance: "3.0 km", modes: ["bus"], lat: 59.42962, lng: 24.78705 },
  { id: "s45", name: "Suur-Sõjamäe", area: "Lasnamäe", distance: "2.5 km", modes: ["bus"], lat: 59.4213, lng: 24.7852 },
  { id: "s46", name: "Peterburi tee", area: "Lasnamäe", distance: "2.0 km", modes: ["bus"], lat: 59.42470, lng: 24.78662 },
  { id: "s47", name: "Tondiraba", area: "Lasnamäe", distance: "4.6 km", modes: ["bus"], lat: 59.4468, lng: 24.7914 },
  { id: "s48", name: "Seli", area: "Lasnamäe", distance: "3.4 km", modes: ["bus"], lat: 59.4406, lng: 24.7897 },

  // Mustamäe
  { id: "s5", name: "Mustamäe Keskus", area: "Mustamäe", distance: "1.4 km", modes: ["bus"], lat: 59.40028, lng: 24.65938 },
  { id: "s10", name: "Kadaka", area: "Mustamäe", distance: "900 m", modes: ["bus"], lat: 59.40428, lng: 24.65602 },
  { id: "s49", name: "Sõpruse pst", area: "Mustamäe", distance: "1.9 km", modes: ["bus"], lat: 59.4087, lng: 24.6812 },
  { id: "s50", name: "Mustika", area: "Mustamäe", distance: "1.6 km", modes: ["bus"], lat: 59.4021, lng: 24.674 },
  { id: "s51", name: "Sütiste tee", area: "Mustamäe", distance: "2.1 km", modes: ["bus"], lat: 59.3931, lng: 24.6541 },
  { id: "s52", name: "Akadeemia tee", area: "Mustamäe", distance: "2.3 km", modes: ["bus"], lat: 59.40153, lng: 24.66029 },
  { id: "s53", name: "Mustjõe", area: "Mustamäe", distance: "1.8 km", modes: ["bus"], lat: 59.4056, lng: 24.6659 },

  // Nõmme
  { id: "s16", name: "Nõmme Keskus", area: "Nõmme", distance: "3.2 km", modes: ["train", "bus"], lat: 59.38729, lng: 24.68540 },
  { id: "s54", name: "Hiiu", area: "Nõmme", distance: "2.8 km", modes: ["train", "bus"], lat: 59.38308, lng: 24.67061 },
  { id: "s55", name: "Rahumäe", area: "Nõmme", distance: "2.5 km", modes: ["train", "bus"], lat: 59.38882, lng: 24.70328 },
  { id: "s56", name: "Valdeku", area: "Nõmme", distance: "3.6 km", modes: ["bus"], lat: 59.38057, lng: 24.69973 },
  { id: "s57", name: "Vana-Mustamäe", area: "Nõmme", distance: "2.6 km", modes: ["bus"], lat: 59.3924, lng: 24.6835 },
  { id: "s58", name: "Kivimäe", area: "Nõmme", distance: "3.9 km", modes: ["bus"], lat: 59.37718, lng: 24.65686 },
  { id: "s59", name: "Männiku", area: "Nõmme", distance: "5.0 km", modes: ["bus"], lat: 59.36644, lng: 24.71778 },

  // Haabersti (incl. Õismäe, Rocca al Mare, Kakumäe)
  { id: "s11", name: "Haabersti", area: "Haabersti", distance: "1.8 km", modes: ["bus"], lat: 59.42437, lng: 24.65001 },
  { id: "s12", name: "Rocca al Mare", area: "Haabersti", distance: "2.0 km", modes: ["bus"], lat: 59.43102, lng: 24.63794 },
  { id: "s60", name: "Väike-Õismäe", area: "Haabersti", distance: "2.7 km", modes: ["bus"], lat: 59.41256, lng: 24.63879 },
  { id: "s61", name: "Õismäe tee", area: "Haabersti", distance: "2.4 km", modes: ["bus"], lat: 59.4232, lng: 24.6398 },
  { id: "s62", name: "Ehitajate tee", area: "Haabersti", distance: "1.9 km", modes: ["bus"], lat: 59.4258, lng: 24.6538 },
  { id: "s63", name: "Astangu", area: "Haabersti", distance: "3.5 km", modes: ["bus"], lat: 59.4247, lng: 24.6172 },
  { id: "s64", name: "Vabaõhumuuseum", area: "Haabersti", distance: "3.1 km", modes: ["bus"], lat: 59.4459, lng: 24.6089 },
  { id: "s65", name: "Merimetsa", area: "Haabersti", distance: "2.6 km", modes: ["bus"], lat: 59.4295, lng: 24.6892 },
  { id: "s66", name: "Kakumäe", area: "Haabersti", distance: "5.8 km", modes: ["bus"], lat: 59.44255, lng: 24.59473 },
  { id: "s67", name: "Tiskre", area: "Haabersti", distance: "7.2 km", modes: ["bus"], lat: 59.43271, lng: 24.56258 },

  // Pirita
  { id: "s8", name: "Tallinn Lennujaam", area: "Lasnamäe", distance: "2.3 km", modes: ["bus"], lat: 59.4133, lng: 24.8322 },
  { id: "s68", name: "Pirita tee", area: "Pirita", distance: "4.5 km", modes: ["bus"], lat: 59.4553, lng: 24.7981 },
  { id: "s69", name: "Kose", area: "Pirita", distance: "5.2 km", modes: ["bus"], lat: 59.4658, lng: 24.7994 },
  { id: "s70", name: "Merivälja", area: "Pirita", distance: "7.0 km", modes: ["bus"], lat: 59.4735, lng: 24.8362 },
  { id: "s71", name: "Kloostrimetsa", area: "Pirita", distance: "6.1 km", modes: ["bus"], lat: 59.4667, lng: 24.8203 },

  // Outskirts / edge
  { id: "s17", name: "Laagri", area: "Nõmme", distance: "5.1 km", modes: ["train"], lat: 59.35466, lng: 24.62771 },
];

export function getStopById(id: string | undefined | null): Stop {
  return STOPS.find((s) => s.id === id) ?? STOPS[0];
}

export const SAVED_STOP_IDS_DEFAULT = ["s1", "s2", "s4", "s9"];
