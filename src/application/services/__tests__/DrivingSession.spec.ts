import { describe, expect, it, vi } from "vitest";
import { DrivingSession } from "../DrivingSession";
import type { EngineSoundOutput } from "../../ports/EngineSoundOutput";
import { createGreenScore } from "../../../domain/scoring/greenScore";
import { CAR_PROFILES } from "../../../domain/vehicle/carProfiles";
import { createVehicleState } from "../../../domain/vehicle/vehiclePhysics";

function createSoundOutput(): EngineSoundOutput {
  return { setProfile: vi.fn(), update: vi.fn() };
}

describe("DrivingSession", () => {
  it("prioritizes braking and resets sound history with the drive", () => {
    const vehicle = createVehicleState(CAR_PROFILES.supra);
    const sound = createSoundOutput();
    const session = new DrivingSession(vehicle, createGreenScore(), sound);
    session.setControl("accelerate", true);
    session.setControl("brake", true);
    session.step(0.1);
    expect(vehicle.throttle).toBe(0);
    session.reset();
    expect(sound.setProfile).toHaveBeenCalledWith(vehicle.profile);
  });
  it("clears old speed and held controls when choosing another car", () => {
    const vehicle = createVehicleState(CAR_PROFILES.supra);
    const session = new DrivingSession(vehicle, createGreenScore(), createSoundOutput());
    vehicle.speedKph = 100;
    session.setControl("accelerate", true);
    session.selectProfile(CAR_PROFILES.brezza);
    session.step(0.1);
    expect(vehicle.speedKph).toBe(0);
    expect(vehicle.throttle).toBe(0);
  });
  it.each([NaN, Infinity, -1, 451])("rejects invalid GPS speed %s", (speed) => {
    const vehicle = createVehicleState(CAR_PROFILES.brezza);
    const session = new DrivingSession(vehicle, createGreenScore(), createSoundOutput());
    session.setGpsSpeed(speed);
    expect(vehicle.gpsSpeedKph).toBeNull();
    expect(vehicle.speedKph).toBe(0);
  });

  it("ignores invalid time steps and shift commands", () => {
    const vehicle = createVehicleState(CAR_PROFILES.brezza);
    const sound = createSoundOutput();
    const session = new DrivingSession(vehicle, createGreenScore(), sound);
    session.step(NaN);
    session.step(-1);
    session.shift(0.5);
    expect(vehicle.gear).toBe(1);
    expect(sound.update).not.toHaveBeenCalled();
  });

  it("keeps UI-independent driving controls and sound output coordinated", () => {
    const vehicle = createVehicleState(CAR_PROFILES.brezza);
    const sound = createSoundOutput();
    const session = new DrivingSession(vehicle, createGreenScore(), sound);
    session.setControl("accelerate", true);
    session.step(1);
    expect(vehicle.throttle).toBe(1);
    expect(vehicle.speedKph).toBeGreaterThan(0);
    expect(sound.update).toHaveBeenCalledWith(vehicle);
  });

  it("resets the drivetrain when a vehicle profile changes", () => {
    const vehicle = createVehicleState(CAR_PROFILES.brezza);
    const sound = createSoundOutput();
    const session = new DrivingSession(vehicle, createGreenScore(), sound);
    vehicle.gear = 4;
    session.selectProfile(CAR_PROFILES.f1);
    expect(vehicle).toMatchObject({ gear: 1, rpm: CAR_PROFILES.f1.idleRpm, profile: CAR_PROFILES.f1 });
    expect(sound.setProfile).toHaveBeenCalledWith(CAR_PROFILES.f1);
  });

  it("resets controls, telemetry state, and score to a clean drive", () => {
    const vehicle = createVehicleState(CAR_PROFILES.brezza);
    const score = createGreenScore();
    const session = new DrivingSession(vehicle, score, createSoundOutput());
    session.setControl("accelerate", true);
    session.setGpsSpeed(35);
    vehicle.gear = 3;
    score.points = 67;
    score.penalties.highRpm = 12;

    session.reset();

    expect(vehicle).toMatchObject({
      rpm: 800,
      gear: 1,
      throttle: 0,
      brake: 0,
      speedKph: 0,
      gpsSpeedKph: null,
    });
    expect(score).toMatchObject({
      points: 100,
      earned: 0,
      previousThrottle: 0,
      penalties: { harshBrake: 0, highRpm: 0, harshThrottle: 0 },
    });
  });

  it("clamps gear shifts to profile max gears", () => {
    const vehicle = createVehicleState(CAR_PROFILES.brezza);
    const session = new DrivingSession(vehicle, createGreenScore(), createSoundOutput());
    vehicle.gear = CAR_PROFILES.brezza.gears;
    session.shift(1); // try to go above max
    expect(vehicle.gear).toBe(CAR_PROFILES.brezza.gears);
    vehicle.gear = 1;
    session.shift(-1); // try to go below 1
    expect(vehicle.gear).toBe(1);
  });

  it("infers throttle under positive GPS acceleration and auto-shifts gear", () => {
    const vehicle = createVehicleState(CAR_PROFILES.brezza);
    const sound = createSoundOutput();
    const session = new DrivingSession(vehicle, createGreenScore(), sound);

    // Initial fix at 10 km/h
    session.setGpsSpeed(10, 1000);
    session.step(0.1);

    // Speed increases to 40 km/h after 1 second (+30 km/h/s acceleration)
    session.setGpsSpeed(40, 2000);
    session.step(0.1);

    expect(vehicle.throttle).toBeGreaterThan(0.2);
    expect(vehicle.brake).toBe(0);
    expect(vehicle.gear).toBeGreaterThanOrEqual(2);
  });

  it("infers braking under sharp GPS deceleration", () => {
    const vehicle = createVehicleState(CAR_PROFILES.brezza);
    const sound = createSoundOutput();
    const session = new DrivingSession(vehicle, createGreenScore(), sound);

    session.setGpsSpeed(60, 1000);
    session.step(0.1);

    // Speed drops to 20 km/h after 1 second (-40 km/h/s deceleration)
    session.setGpsSpeed(20, 2000);
    session.step(0.1);

    expect(vehicle.brake).toBeGreaterThan(0.2);
    expect(vehicle.throttle).toBe(0);
  });

  it("permits manual gear shift override during GPS mode", () => {
    const vehicle = createVehicleState(CAR_PROFILES.brezza);
    const session = new DrivingSession(vehicle, createGreenScore(), createSoundOutput());

    session.setGpsSpeed(50, 1000);
    session.step(0.1);
    expect(vehicle.gear).toBeGreaterThanOrEqual(2);

    // Driver explicitly shifts into gear 1
    session.shift(-1);
    const manualGear = vehicle.gear;
    session.step(0.1);
    // Gear should stay at manual choice
    expect(vehicle.gear).toBe(manualGear);
  });
});

