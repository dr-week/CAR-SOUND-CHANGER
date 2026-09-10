import { describe, expect, it } from "vitest";
import { createGreenScore, updateGreenScore } from "../../../../src/domain/scoring/greenScore";
import { CAR_PROFILES } from "../../../../src/domain/vehicle/carProfiles";
import { createVehicleState } from "../../../../src/domain/vehicle/vehiclePhysics";

describe("green score", () => {
  it("keeps a smooth driving score within the 0–100 range", () => {
    const score = createGreenScore();
    const vehicle = createVehicleState(CAR_PROFILES.brezza);
    vehicle.throttle = 0.3;
    updateGreenScore(score, vehicle, 0.1);
    expect(score.points).toBeGreaterThanOrEqual(0);
    expect(score.points).toBeLessThanOrEqual(100);
  });

  it("deducts points for a harsh brake at speed", () => {
    const score = createGreenScore();
    const vehicle = createVehicleState(CAR_PROFILES.brezza);
    vehicle.speedKph = 45;
    vehicle.brake = 1;
    updateGreenScore(score, vehicle, 1);
    expect(score.penalties.harshBrake).toBeGreaterThan(0);
    expect(score.points).toBeLessThan(100);
  });
});
