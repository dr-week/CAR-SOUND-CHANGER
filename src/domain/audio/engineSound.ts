import type { VehicleState } from "../vehicle/types";

/** Stylized deep-exhaust signatures, not measured vehicle recordings. */
export function engineTimbre(cylinders: number): number[] {
  if (cylinders === 8) return [0, 1, 0.32, 0.12, 0.04, 0.015];
  if (cylinders === 6) return [0, 1, 0.25, 0.15, 0.04, 0.01];
  if (cylinders === 12) return [0, 1, 0.2, 0.08, 0.025, 0.01];
  if (cylinders === 10) return [0, 1, 0.23, 0.13, 0.035, 0.012];
  return [0, 1, 0.28, 0.1, 0.035, 0.01];
}

export function bodyTimbre(cylinders: number): number[] {
  if (cylinders === 8) return [0, 1, 0.62, 0.12, 0.2, 0.06];
  if (cylinders === 6) return [0, 1, 0.22, 0.4, 0.08, 0.03];
  if (cylinders >= 10) return [0, 1, 0.3, 0.15, 0.05, 0.01];
  return [0, 1, 0.48, 0.24, 0.07, 0.02];
}

function bounded(value: number, min: number, max: number): number {
  return Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : min;
}

export function engineSoundParameters(state: VehicleState, shifting = false, turbo = { boost: 0, release: 0 }) {
  const idleRpm = Math.max(100, state.profile.idleRpm);
  const redlineRpm = Math.max(idleRpm + 100, state.profile.redlineRpm);
  const rpm = bounded(state.rpm, idleRpm, redlineRpm);
  const load = bounded(state.throttle, 0, 1) * (1 - bounded(state.brake, 0, 1));
  const normalized = rpm / redlineRpm;
  const revSpan = redlineRpm - idleRpm;
  const revRange = revSpan > 0 ? (rpm - idleRpm) / revSpan : 0;
  const cylinders = Math.max(1, state.profile.cylinders);
  const firingHz = (rpm * cylinders) / 120;
  const cut = shifting ? 0.4 : 1;
  return {
    firingHz,
    // Deliberately compressed bass pitch: audible idle instead of 12–14 Hz
    // sub-bass, and no high-RPM whistle. This is a sports-exhaust effect.
    bodyHz: (state.profile.cylinders === 8 ? 38 : 44) + revRange * 52,
    exhaustGain: (0.13 + load * 0.17) * cut,
    bodyGain: (0.23 + load * 0.06) * cut,
    intakeGain: (0.006 + load * 0.008) * cut,
    // Retain deep body sound without filtering out the firing fundamental.
    cutoffHz: Math.max(firingHz * 1.2, 260 + normalized * 180 + load * 200),
    turboGain:
      state.profile.induction === "turbo"
        ? 0.022 * bounded(turbo.boost, 0, 1) + 0.06 * bounded(turbo.release, 0, 1)
        : 0,
    turboCutoffHz: 700 + 800 * bounded(turbo.boost, 0, 1),
  };
}
