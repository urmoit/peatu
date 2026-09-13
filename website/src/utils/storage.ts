export async function getJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    if (typeof window === "undefined") return fallback;
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function setJSON<T>(key: string, value: T): Promise<void> {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // best-effort persistence, ignore failures
  }
}

export const StorageKeys = {
  savedStops: "peatu-web:saved-stops",
  notificationsEnabled: "peatu-web:notifications-enabled",
  showStopsByDefault: "peatu-web:map-show-stops",
  mapFilter: "peatu-web:map-filter",
  hasOnboarded: "peatu-web:has-onboarded",
} as const;