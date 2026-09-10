import type { VehicleProfile, VehicleState } from "./types";
const GEAR_RATIOS = [0, 3.6, 2.15, 1.45, 1.1, 0.9, 0.76, 0.64, 0.55];

export function createVehicleState(profile: VehicleProfile): VehicleState {
  return { profile, rpm: profile.idleRpm, gear: 1, throttle: 0, brake: 0, speedKph: 0, gpsSpeedKph: null };
}
export function stepVehicle(state: VehicleState, dt: number): void {
  const activeSpeed = state.gpsSpeedKph ?? state.speedKph;
  const acceleration = state.throttle * 14 - state.brake * 24 - Math.max(0.4, activeSpeed * 0.025);
  if (state.gpsSpeedKph === null) state.speedKph = Math.max(0, state.speedKph + acceleration * dt);
  const targetRpm = Math.max(
    state.profile.idleRpm,
    Math.max(0, activeSpeed) * 29 * (GEAR_RATIOS[state.gear] ?? 1) + state.throttle * 900,
  );
  const response = state.throttle > 0 ? 6 : 3;
  state.rpm += (Math.min(state.profile.redlineRpm, targetRpm) - state.rpm) * Math.min(1, response * dt);
}
