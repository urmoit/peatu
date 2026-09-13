import AsyncStorage from "@react-native-async-storage/async-storage";

export async function getJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function setJSON<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // best-effort persistence, ignore failures
  }
}

export const StorageKeys = {
  savedStops: "peatu:saved-stops",
  notificationsEnabled: "peatu:notifications-enabled",
  showStopsByDefault: "peatu:map-show-stops",
  mapFilter: "peatu:map-filter",
  hasOnboarded: "peatu:has-onboarded",
} as const;
