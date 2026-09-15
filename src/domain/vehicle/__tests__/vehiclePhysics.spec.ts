import { describe, expect, it } from "vitest";
import { CAR_PROFILES } from "../carProfiles";
import { createVehicleState, stepVehicle } from "../vehiclePhysics";

describe("vehicle physics", () => {
  it("starts a selected car at its idle RPM in first gear", () => {
    const vehicle = createVehicleState(CAR_PROFILES.brezza);
    expect(vehicle).toMatchObject({ gear: 1, rpm: 800, speedKph: 0 });
  });

  it("accelerates when throttle is applied", () => {
    const vehicle = createVehicleState(CAR_PROFILES.brezza);
    vehicle.throttle = 1;
    stepVehicle(vehicle, 1);
    expect(vehicle.speedKph).toBeGreaterThan(0);
    expect(vehicle.rpm).toBeGreaterThan(vehicle.profile.idleRpm);
  });

  it("never allows a negative speed", () => {
    const vehicle = createVehicleState(CAR_PROFILES.brezza);
    vehicle.brake = 1;
    stepVehicle(vehicle, 1);
    expect(vehicle.speedKph).toBe(0);
  });

  it("uses GPS speed for RPM when gpsSpeedKph is set", () => {
    const vehicle = createVehicleState(CAR_PROFILES.brezza);
    vehicle.gpsSpeedKph = 60;
    vehicle.throttle = 0;
    stepVehicle(vehicle, 0.1);
    // speedKph should not change (GPS is overriding)
    expect(vehicle.speedKph).toBe(0);
    // RPM should reflect GPS speed, not simulation speed
    expect(vehicle.rpm).toBeGreaterThan(vehicle.profile.idleRpm);
  });

  it("caps RPM smoothing to MAX_FRAME_DT_S to prevent large jumps", () => {
    // Large dt (10s) should produce same RPM smoothing as capped dt (0.1s)
    // because cappedDt = Math.min(dt, 0.1) is used in RPM smoothing
    const vehicle = createVehicleState(CAR_PROFILES.brezza);
    vehicle.throttle = 1;
    stepVehicle(vehicle, 10); // large dt — RPM smoothing uses Math.min(10, 0.1)

    const vehicleCapped = createVehicleState(CAR_PROFILES.brezza);
    vehicleCapped.throttle = 1;
    stepVehicle(vehicleCapped, 0.1); // explicit capped dt

    // RPM should be identical because capping is applied in both cases
    expect(vehicle.rpm).toBeCloseTo(vehicleCapped.rpm, 2);
  });
});
