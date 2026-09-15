/**
 * Shared Constants
 *
 * Cross-layer values that multiple modules need.
 * Keep this file lean — domain-specific constants belong in their own module.
 */

/** LocalStorage key for persisted user preferences. */
export const PREFS_STORAGE_KEY = "car-sound-mod:prefs" as const;

/** Default user preferences (used when localStorage has no entry). */
export const DEFAULT_VOLUME = 50;          // 0–100
export const DEFAULT_PROFILE_ID = "brezza" as const;
export const DEFAULT_GPS_ENABLED = false;

/** Max displayable speed (km/h) — used by speedometer gauge. */
export const MAX_DISPLAY_SPEED_KPH = 180;

/** GPS fix stale timeout (ms). */
export const GPS_STALE_AFTER_MS = 5_000;
