// ── Domain: Vehicle ──────────────────────────────────────────────────────────
// Single import point for all vehicle-domain exports.
// Consumers: import { VehicleProfile, CAR_PROFILES, createVehicleState } from '@/domain/vehicle'

export type { VehicleProfile, VehicleState } from "./types";
export type { DriveAction } from "./controls";
export { CAR_PROFILES, isProfileId } from "./carProfiles";
export type { ProfileId } from "./carProfiles";
export { createVehicleState, stepVehicle } from "./vehiclePhysics";
export {
  GEAR_RATIOS,
  MAX_GPS_SPEED_KPH,
  MAX_FRAME_DT_S,
  THROTTLE_ACCEL,
  BRAKE_DECEL,
  ROLLING_RESISTANCE,
  RPM_SPEED_SCALE,
  THROTTLE_RPM_BOOST,
} from "./constants";
