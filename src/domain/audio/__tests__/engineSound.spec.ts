import { describe, expect, it } from "vitest";
import { engineSoundParameters, engineTimbre } from "../engineSound";
import { CAR_PROFILES } from "../../vehicle/carProfiles";
import { createVehicleState } from "../../vehicle/vehiclePhysics";

describe("engine sound model", () => {
  it.each(Object.values(CAR_PROFILES))("keeps $id deep without hiding the firing fundamental", (profile) => {
    const state = createVehicleState(profile);
    const idle = engineSoundParameters(state);
    state.rpm = profile.redlineRpm;
    state.throttle = 1;
    const loaded = engineSoundParameters(state);
    expect(idle.bodyHz).toBeGreaterThanOrEqual(38);
    expect(loaded.bodyHz).toBeGreaterThan(idle.bodyHz);
    expect(loaded.bodyHz).toBeLessThanOrEqual(100);
    expect(loaded.bodyGain).toBeGreaterThan(0.2);
    expect(loaded.bodyGain).toBeLessThan(loaded.exhaustGain);
    expect(loaded.cutoffHz).toBeGreaterThanOrEqual(loaded.firingHz);
    expect(loaded.intakeGain).toBeLessThan(0.02);
    expect(loaded.bodyGain + loaded.exhaustGain + loaded.intakeGain).toBeLessThan(0.7);
  });
  it.each(Object.values(CAR_PROFILES))("uses four-stroke firing frequency for $id", (profile) => {
    const state = createVehicleState(profile);
    state.rpm = 3000;
    expect(engineSoundParameters(state).firingHz).toBe(25 * profile.cylinders);
  });
  it("changes load color without changing RPM-derived pitch", () => {
    const state = createVehicleState(CAR_PROFILES.brezza);
    const coast = engineSoundParameters(state);
    state.throttle = 1;
    const load = engineSoundParameters(state);
    expect(load.firingHz).toBe(coast.firingHz);
    expect(load.exhaustGain).toBeGreaterThan(coast.exhaustGain);
    expect(load.cutoffHz).toBeGreaterThan(coast.cutoffHz);
    expect(engineSoundParameters(state, true).exhaustGain).toBeLessThan(load.exhaustGain);
  });
  it.each([NaN, Infinity, -100, 1e9])("bounds invalid/extreme input %s", (value) => {
    const state = createVehicleState(CAR_PROFILES.f1);
    state.rpm = state.throttle = state.brake = value;
    const sound = engineSoundParameters(state);
    expect(Object.values(sound).every(Number.isFinite)).toBe(true);
    expect(sound.firingHz).toBeLessThanOrEqual(1200);
    expect(sound.exhaustGain + sound.bodyGain + sound.intakeGain).toBeLessThan(0.7);
  });
  it("gives cylinder families distinct normalized-wave coefficients with no DC term", () => {
    const waves = [4, 6, 8, 12].map(engineTimbre);
    expect(new Set(waves.map((wave) => JSON.stringify(wave))).size).toBe(4);
    waves.forEach((wave) => expect(wave[0]).toBe(0));
  });
});
