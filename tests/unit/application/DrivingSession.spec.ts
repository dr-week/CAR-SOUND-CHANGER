import { describe, expect, it, vi } from "vitest";
import { DrivingSession } from "../../../src/application/services/DrivingSession";
import type { EngineSoundOutput } from "../../../src/application/ports/EngineSoundOutput";
import { createGreenScore } from "../../../src/domain/scoring/greenScore";
import { CAR_PROFILES } from "../../../src/domain/vehicle/carProfiles";
import { createVehicleState } from "../../../src/domain/vehicle/vehiclePhysics";

function createSoundOutput(): EngineSoundOutput { return { setProfile: vi.fn(), update: vi.fn() }; }

describe("DrivingSession", () => {
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
});
