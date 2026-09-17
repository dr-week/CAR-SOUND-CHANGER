import { describe, expect, it } from "vitest";
import { TurboEnvelope } from "../TurboEnvelope";
import { engineSoundParameters } from "../engineSound";
import { CAR_PROFILES } from "../../vehicle/carProfiles";
import { createVehicleState } from "../../vehicle/vehiclePhysics";

describe("turbo sound envelope", () => {
  it.each([NaN, Infinity, -1, 0])("does not release charged boost on invalid dt %s", (dt) => {
    const envelope = new TurboEnvelope();
    const state = createVehicleState(CAR_PROFILES.supra);
    state.rpm = 3500;
    state.throttle = 1;
    for (let i = 0; i < 10; i++) envelope.update(state, 0.1);
    state.throttle = 0;
    expect(envelope.update(state, dt)).toEqual({ boost: 1, release: 0 });
  });
  it("releases boost during a shift even with the accelerator held", () => {
    const envelope = new TurboEnvelope();
    const state = createVehicleState(CAR_PROFILES.supra);
    state.rpm = 3500;
    state.throttle = 1;
    for (let i = 0; i < 10; i++) envelope.update(state, 0.1);
    const shifted = envelope.update(state, 0.1, true);
    expect(shifted.release).toBe(1);
    expect(shifted.boost).toBeLessThan(1);
  });
  it("spools under load and releases briefly after lifting, without repeating", () => {
    const envelope = new TurboEnvelope();
    const state = createVehicleState(CAR_PROFILES.supra);
    state.rpm = 3500;
    state.throttle = 1;
    for (let i = 0; i < 10; i++) envelope.update(state, 0.1);
    const loaded = envelope.update(state, 0.1);
    expect(loaded.boost).toBe(1);
    expect(loaded.release).toBe(0);
    state.throttle = 0;
    const lift = envelope.update(state, 0.016);
    expect(lift.release).toBe(1);
    expect(engineSoundParameters(state, false, lift).turboGain).toBeGreaterThan(0);
    for (let i = 0; i < 5; i++) envelope.update(state, 0.1);
    expect(envelope.update(state, 0.1)).toEqual({ boost: 0, release: 0 });
  });
  it("does not blow off at idle, after reset, or on naturally aspirated profiles", () => {
    const envelope = new TurboEnvelope();
    const state = createVehicleState(CAR_PROFILES.golf);
    state.throttle = 1;
    for (let i = 0; i < 10; i++) envelope.update(state, 0.1);
    state.throttle = 0;
    expect(envelope.update(state, 0.1).release).toBe(0);
    state.rpm = 3500;
    state.throttle = 1;
    envelope.update(state, 0.1);
    envelope.reset();
    state.throttle = 0;
    expect(envelope.update(state, 0.1)).toEqual({ boost: 0, release: 0 });
    state.profile = CAR_PROFILES.mustang;
    state.throttle = 1;
    expect(envelope.update(state, 0.1)).toEqual({ boost: 0, release: 0 });
    expect(engineSoundParameters(state, false, { boost: 1, release: 1 }).turboGain).toBe(0);
  });
  it.each([NaN, Infinity, -1])("ignores invalid elapsed time %s", (dt) => {
    const state = createVehicleState(CAR_PROFILES.supra);
    state.rpm = 3500;
    state.throttle = 1;
    expect(new TurboEnvelope().update(state, dt)).toEqual({ boost: 0, release: 0 });
  });
});
