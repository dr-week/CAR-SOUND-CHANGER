import { describe, expect, it } from "vitest";
import { createGreenScore, updateGreenScore, getGreenScoreSummary } from "../greenScore";
import { CAR_PROFILES } from "../../vehicle/carProfiles";
import { createVehicleState } from "../../vehicle/vehiclePhysics";

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

  it("deducts points for over-revving", () => {
    const score = createGreenScore();
    const vehicle = createVehicleState(CAR_PROFILES.brezza);
    // Set RPM above shiftRpm + 1200
    vehicle.rpm = CAR_PROFILES.brezza.shiftRpm + 1300;
    updateGreenScore(score, vehicle, 1);
    expect(score.penalties.highRpm).toBeGreaterThan(0);
  });

  it("awards earned points for smooth driving", () => {
    const score = createGreenScore();
    const vehicle = createVehicleState(CAR_PROFILES.brezza);
    vehicle.throttle = 0.3;
    vehicle.brake = 0;
    vehicle.rpm = 1200; // below penalty threshold
    updateGreenScore(score, vehicle, 1);
    expect(score.earned).toBeGreaterThan(0);
  });

  it("getGreenScoreSummary returns a descriptive string", () => {
    const score = createGreenScore();
    score.penalties.harshBrake = 2.5;
    const summary = getGreenScoreSummary(score);
    expect(summary).toContain("2.5");
  });

  it("ignores update when dt is non-positive or non-finite", () => {
    const score = createGreenScore();
    const vehicle = createVehicleState(CAR_PROFILES.brezza);
    vehicle.throttle = 0.5;
    updateGreenScore(score, vehicle, 0);
    expect(score.earned).toBe(0);
    updateGreenScore(score, vehicle, -1);
    expect(score.earned).toBe(0);
    updateGreenScore(score, vehicle, NaN);
    expect(score.earned).toBe(0);
  });
});
