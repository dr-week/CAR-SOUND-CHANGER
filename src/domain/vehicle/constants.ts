/**
 * Vehicle Physics Constants
 *
 * Pure numeric constants used by vehiclePhysics.ts.
 * Extracted here so they can be tested and referenced independently.
 */

/** Gear ratio for each gear index (index 0 unused). Up to 8-speed gearbox. */
export const GEAR_RATIOS = [0, 3.6, 2.15, 1.45, 1.1, 0.9, 0.76, 0.64, 0.55] as const;

/** Maximum allowed GPS speed before fix is rejected (km/h). */
export const MAX_GPS_SPEED_KPH = 450;

/** Physics tick cap: maximum dt accepted per frame (seconds). */
export const MAX_FRAME_DT_S = 0.1;

/** Maximum acceleration force (full throttle, m/s²-equivalent). */
export const THROTTLE_ACCEL = 14;

/** Maximum deceleration force (full brake, m/s²-equivalent). */
export const BRAKE_DECEL = 24;

/** Rolling resistance base constant. */
export const ROLLING_RESISTANCE = 0.025;

/** Minimum rolling resistance floor. */
export const ROLLING_RESISTANCE_MIN = 0.4;

/** RPM-from-speed scale factor. */
export const RPM_SPEED_SCALE = 29;

/** Additional RPM contribution from throttle input. */
export const THROTTLE_RPM_BOOST = 900;

/** Engine RPM response rate when accelerating (exponential smoothing). */
export const RPM_RESPONSE_ACCEL = 6;

/** Engine RPM response rate when coasting / braking. */
export const RPM_RESPONSE_COAST = 3;
