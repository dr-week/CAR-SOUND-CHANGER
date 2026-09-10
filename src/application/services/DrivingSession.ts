import type { EngineSoundOutput } from "../ports/EngineSoundOutput";
import { updateGreenScore, type GreenScore } from "../../domain/scoring/greenScore";
import { stepVehicle } from "../../domain/vehicle/vehiclePhysics";
import type { VehicleProfile, VehicleState } from "../../domain/vehicle/types";
import type { DriveAction } from "../../infrastructure/input/KeyboardInput";

/** Coordinates one driving session without knowing about Vue, DOM, GPS, or Web Audio. */
export class DrivingSession {
  private readonly activeControls = new Set<DriveAction>();

  constructor(
    private readonly vehicle: VehicleState,
    private readonly greenScore: GreenScore,
    private readonly soundOutput: EngineSoundOutput
  ) {}

  setControl(action: DriveAction, active: boolean): void {
    if (active) this.activeControls.add(action);
    else this.activeControls.delete(action);
  }

  shift(delta: number): void {
    this.vehicle.gear = Math.max(1, Math.min(this.vehicle.profile.gears, this.vehicle.gear + delta));
  }

  selectProfile(profile: VehicleProfile): void {
    this.vehicle.profile = profile;
    this.vehicle.gear = 1;
    this.vehicle.rpm = profile.idleRpm;
    this.soundOutput.setProfile(profile);
  }

  setGpsSpeed(speedKph: number): void {
    this.vehicle.gpsSpeedKph = speedKph;
    this.vehicle.speedKph = speedKph;
  }

  clearGpsSpeed(): void { this.vehicle.gpsSpeedKph = null; }

  step(dt: number): void {
    this.vehicle.throttle = this.activeControls.has("accelerate") ? 1 : 0;
    this.vehicle.brake = this.activeControls.has("brake") ? 1 : 0;
    stepVehicle(this.vehicle, dt);
    updateGreenScore(this.greenScore, this.vehicle, dt);
    this.soundOutput.update(this.vehicle);
  }
}
