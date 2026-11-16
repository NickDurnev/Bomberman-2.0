import { useSyncExternalStore } from "react";
import {
  addToLocalStorage,
  getDataFromLocalStorage,
} from "@/utils/local_storage";

export type PlayerSettings = {
  screenShake: boolean;
  fuseWarning: boolean;
  particles: boolean;
  glow: boolean;
};

export const SETTINGS_STORAGE_KEY = "player_settings";

type Listener = (settings: PlayerSettings) => void;

const listeners = new Set<Listener>();

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const readStored = (): Record<string, unknown> => {
  const stored = getDataFromLocalStorage(SETTINGS_STORAGE_KEY);
  return stored && typeof stored === "object" && !Array.isArray(stored)
    ? (stored as Record<string, unknown>)
    : {};
};

const readBoolean = (stored: Record<string, unknown>, key: string) =>
  typeof stored[key] === "boolean" ? (stored[key] as boolean) : undefined;

// Cached snapshot: useSyncExternalStore needs a stable reference while the
// stored value does not change.
let cache: {
  raw: string | null;
  reduced: boolean;
  value: PlayerSettings;
} | null = null;

const readRaw = () => {
  try {
    return localStorage.getItem(SETTINGS_STORAGE_KEY);
  } catch {
    return null;
  }
};

export function getSettings(): PlayerSettings {
  const raw = readRaw();
  const reduced = prefersReducedMotion();
  if (cache && cache.raw === raw && cache.reduced === reduced) {
    return cache.value;
  }
  const stored = readStored();
  const value: PlayerSettings = {
    screenShake: readBoolean(stored, "screenShake") ?? !reduced,
    fuseWarning: readBoolean(stored, "fuseWarning") ?? true,
    particles: readBoolean(stored, "particles") ?? true,
    glow: readBoolean(stored, "glow") ?? true,
  };
  cache = { raw, reduced, value };
  return value;
}

export function setSetting<K extends keyof PlayerSettings>(
  key: K,
  value: PlayerSettings[K],
): void {
  // Store only valid booleans: keep a key that was never set unset.
  const stored = readStored();
  const next: Record<string, boolean> = {};
  for (const [k, v] of Object.entries(stored)) {
    if (typeof v === "boolean") {
      next[k] = v;
    }
  }
  next[key] = value;
  addToLocalStorage({ key: SETTINGS_STORAGE_KEY, value: next });
  const settings = getSettings();
  for (const listener of listeners) {
    listener(settings);
  }
}

export function subscribeSettings(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const subscribe = (onChange: () => void) => subscribeSettings(onChange);

export function usePlayerSettings(): PlayerSettings {
  return useSyncExternalStore(subscribe, getSettings, getSettings);
}
