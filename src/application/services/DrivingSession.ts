import type { EngineSoundOutput } from "../ports/EngineSoundOutput";
import { updateGreenScore, type GreenScore } from "../../domain/scoring/greenScore";
import { stepVehicle } from "../../domain/vehicle/vehiclePhysics";
import type { VehicleProfile, VehicleState } from "../../domain/vehicle/types";
import type { DriveAction } from "../../domain/vehicle/controls";

/** Coordinates one driving session without knowing about Vue, DOM, GPS, or Web Audio. */
export class DrivingSession {
  private readonly activeControls = new Set<DriveAction>();

  constructor(
    private readonly vehicle: VehicleState,
    private readonly greenScore: GreenScore,
    private readonly soundOutput: EngineSoundOutput,
  ) {}

  setControl(action: DriveAction, active: boolean): void {
    if (active) this.activeControls.add(action);
    else this.activeControls.delete(action);
  }

  shift(delta: number): void {
    if (delta !== 1 && delta !== -1) return;
    this.vehicle.gear = Math.max(1, Math.min(this.vehicle.profile.gears, this.vehicle.gear + delta));
  }

  selectProfile(profile: VehicleProfile): void {
    this.vehicle.profile = profile;
    this.reset();
  }

  setGpsSpeed(speedKph: number): void {
    if (!Number.isFinite(speedKph) || speedKph < 0 || speedKph > 450) return;
    this.vehicle.gpsSpeedKph = speedKph;
    this.vehicle.speedKph = speedKph;
  }

  clearGpsSpeed(): void {
    this.vehicle.gpsSpeedKph = null;
  }

  reset(): void {
    this.activeControls.clear();
    this.vehicle.rpm = this.vehicle.profile.idleRpm;
    this.vehicle.gear = 1;
    this.vehicle.throttle = 0;
    this.vehicle.brake = 0;
    this.vehicle.speedKph = 0;
    this.vehicle.gpsSpeedKph = null;
    this.greenScore.points = 100;
    this.greenScore.earned = 0;
    this.greenScore.penalties.harshBrake = 0;
    this.greenScore.penalties.highRpm = 0;
    this.greenScore.penalties.harshThrottle = 0;
    this.greenScore.previousThrottle = 0;
    this.soundOutput.setProfile(this.vehicle.profile);
  }

  step(dt: number): void {
    if (!Number.isFinite(dt) || dt <= 0) return;
    dt = Math.min(dt, 0.1);
    this.vehicle.brake = this.activeControls.has("brake") ? 1 : 0;
    this.vehicle.throttle = this.activeControls.has("accelerate") && !this.vehicle.brake ? 1 : 0;
    stepVehicle(this.vehicle, dt);
    updateGreenScore(this.greenScore, this.vehicle, dt);
    this.soundOutput.update(this.vehicle);
  }
}
