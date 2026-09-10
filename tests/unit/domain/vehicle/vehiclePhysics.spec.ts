import { describe, expect, it } from "vitest";
import { CAR_PROFILES } from "../../../../src/domain/vehicle/carProfiles";
import { createVehicleState, stepVehicle } from "../../../../src/domain/vehicle/vehiclePhysics";

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
});
