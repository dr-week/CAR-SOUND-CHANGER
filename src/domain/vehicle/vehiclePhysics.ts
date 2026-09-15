import type { VehicleProfile, VehicleState } from "./types";
import {
  GEAR_RATIOS,
  MAX_FRAME_DT_S,
  THROTTLE_ACCEL,
  BRAKE_DECEL,
  ROLLING_RESISTANCE,
  ROLLING_RESISTANCE_MIN,
  RPM_SPEED_SCALE,
  THROTTLE_RPM_BOOST,
  RPM_RESPONSE_ACCEL,
  RPM_RESPONSE_COAST,
} from "./constants";

export function createVehicleState(profile: VehicleProfile): VehicleState {
  return {
    profile,
    rpm: profile.idleRpm,
    gear: 1,
    throttle: 0,
    brake: 0,
    speedKph: 0,
    gpsSpeedKph: null,
  };
}

export function stepVehicle(state: VehicleState, dt: number): void {
  const activeSpeed = state.gpsSpeedKph ?? state.speedKph;
  const drag = Math.max(ROLLING_RESISTANCE_MIN, activeSpeed * ROLLING_RESISTANCE);
  const acceleration = state.throttle * THROTTLE_ACCEL - state.brake * BRAKE_DECEL - drag;

  if (state.gpsSpeedKph === null) {
    state.speedKph = Math.max(0, state.speedKph + acceleration * dt);
  }

  const targetRpm = Math.max(
    state.profile.idleRpm,
    Math.max(0, activeSpeed) * RPM_SPEED_SCALE * (GEAR_RATIOS[state.gear] ?? 1) +
      state.throttle * THROTTLE_RPM_BOOST,
  );

  const response = state.throttle > 0 ? RPM_RESPONSE_ACCEL : RPM_RESPONSE_COAST;
  const cappedDt = Math.min(dt, MAX_FRAME_DT_S);
  state.rpm +=
    (Math.min(state.profile.redlineRpm, targetRpm) - state.rpm) *
    Math.min(1, response * cappedDt);
}
