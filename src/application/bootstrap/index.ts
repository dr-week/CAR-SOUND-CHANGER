/**
 * Application Bootstrap
 *
 * Centralises one-time app-startup concerns that sit above infrastructure
 * adapters but below Vue component lifecycle hooks. Nothing here creates
 * Vue reactivity — that belongs in useVehicleSimulator.
 *
 * Responsibilities:
 *   1. Detect and log browser capability gaps (Web Audio, Geolocation, Bluetooth)
 *   2. Apply persisted user preferences (volume, selected profile, GPS toggle)
 *   3. Expose a typed `AppCapabilities` snapshot for the composable to consume
 */

import type { ProfileId } from '../../domain/vehicle/carProfiles';

// ─── Capability detection ───────────────────────────────────────────────────

export interface AppCapabilities {
  /** Web Audio API available */
  audio: boolean;
  /** Geolocation API available */
  geolocation: boolean;
  /** Web Bluetooth API available (Chrome/Edge, HTTPS only) */
  bluetooth: boolean;
  /** Service-worker registration supported */
  serviceWorker: boolean;
}

export function detectCapabilities(): AppCapabilities {
  return {
    audio: typeof AudioContext !== 'undefined' || typeof (window as Window & { webkitAudioContext?: unknown }).webkitAudioContext !== 'undefined',
    geolocation: 'geolocation' in navigator,
    bluetooth: 'bluetooth' in navigator,
    serviceWorker: 'serviceWorker' in navigator,
  };
}

// ─── Persisted preferences ───────────────────────────────────────────────────

const STORAGE_KEY = 'car-sound-mod:prefs';

export interface UserPreferences {
  volume: number;          // 0–100
  profileId: ProfileId;
  gpsEnabled: boolean;
}

const DEFAULTS: UserPreferences = {
  volume: 50,
  profileId: 'brezza',
  gpsEnabled: false,
};

export function loadPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw) as Partial<UserPreferences>;
    return {
      volume: typeof parsed.volume === 'number'
        ? Math.max(0, Math.min(100, parsed.volume))
        : DEFAULTS.volume,
      profileId: typeof parsed.profileId === 'string'
        ? (parsed.profileId as ProfileId)
        : DEFAULTS.profileId,
      gpsEnabled: typeof parsed.gpsEnabled === 'boolean'
        ? parsed.gpsEnabled
        : DEFAULTS.gpsEnabled,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export function savePreferences(prefs: Partial<UserPreferences>): void {
  try {
    const current = loadPreferences();
    const next: UserPreferences = { ...current, ...prefs };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // localStorage may be unavailable in private browsing — fail silently
  }
}

export function clearPreferences(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

// ─── Bootstrap entry point ───────────────────────────────────────────────────

export interface BootstrapResult {
  capabilities: AppCapabilities;
  preferences: UserPreferences;
}

/**
 * Run once before mounting the Vue app.
 * Returns capability flags and persisted preferences.
 */
export function bootstrap(): BootstrapResult {
  const capabilities = detectCapabilities();
  const preferences = loadPreferences();

  if (import.meta.env.DEV) {
    console.info('[bootstrap] capabilities:', capabilities);
    console.info('[bootstrap] preferences:', preferences);
  }

  return { capabilities, preferences };
}
