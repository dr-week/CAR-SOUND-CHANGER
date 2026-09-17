import type { EngineSoundOutput } from "../ports/EngineSoundOutput";
import { updateGreenScore, type GreenScore } from "../../domain/scoring/greenScore";
import { computeAutoGear, stepVehicle } from "../../domain/vehicle/vehiclePhysics";
import type { VehicleProfile, VehicleState } from "../../domain/vehicle/types";
import type { DriveAction } from "../../domain/vehicle/controls";

/** Coordinates one driving session without knowing about Vue, DOM, GPS, or Web Audio. */
export class DrivingSession {
  private readonly activeControls = new Set<DriveAction>();
  private lastGpsSpeed: number | null = null;
  private lastGpsTime: number | null = null;
  private gpsThrottle = 0;
  private gpsBrake = 0;
  private autoShift = true;

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
    this.autoShift = false;
    this.vehicle.gear = Math.max(1, Math.min(this.vehicle.profile.gears, this.vehicle.gear + delta));
  }

  setAutoShift(enabled: boolean): void {
    this.autoShift = enabled;
  }

  selectProfile(profile: VehicleProfile): void {
    this.vehicle.profile = profile;
    this.reset();
  }

  setGpsSpeed(speedKph: number, timestampMs = performance.now()): void {
    if (!Number.isFinite(speedKph) || speedKph < 0 || speedKph > 450) return;
    if (this.lastGpsSpeed !== null && this.lastGpsTime !== null) {
      const dtSeconds = (timestampMs - this.lastGpsTime) / 1000;
      if (dtSeconds > 0.05 && dtSeconds < 10) {
        const accelKphS = (speedKph - this.lastGpsSpeed) / dtSeconds;
        if (accelKphS > 0.8) {
          // Accelerating: map 0.8..8.0 km/h/s to throttle 0.2..1.0
          this.gpsThrottle = Math.min(1, 0.2 + (accelKphS - 0.8) * 0.11);
          this.gpsBrake = 0;
        } else if (accelKphS < -2.0) {
          // Braking: map -2.0..-12.0 km/h/s to brake 0.2..1.0
          this.gpsBrake = Math.min(1, 0.2 + Math.abs(accelKphS + 2.0) * 0.08);
          this.gpsThrottle = 0;
        } else {
          // Cruising / coasting load
          this.gpsThrottle = speedKph > 5 ? 0.12 : 0;
          this.gpsBrake = 0;
        }
      }
    }
    this.lastGpsSpeed = speedKph;
    this.lastGpsTime = timestampMs;
    this.vehicle.gpsSpeedKph = speedKph;
    this.vehicle.speedKph = speedKph;
  }

  clearGpsSpeed(): void {
    this.vehicle.gpsSpeedKph = null;
    this.lastGpsSpeed = null;
    this.lastGpsTime = null;
    this.gpsThrottle = 0;
    this.gpsBrake = 0;
  }

  reset(): void {
    this.activeControls.clear();
    this.autoShift = true;
    this.lastGpsSpeed = null;
    this.lastGpsTime = null;
    this.gpsThrottle = 0;
    this.gpsBrake = 0;
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
    const manualBrake = this.activeControls.has("brake") ? 1 : 0;
    const manualThrottle = this.activeControls.has("accelerate") && !manualBrake ? 1 : 0;

    if (this.vehicle.gpsSpeedKph !== null) {
      this.vehicle.brake = Math.max(manualBrake, this.gpsBrake);
      this.vehicle.throttle = Math.max(manualThrottle, this.gpsThrottle);
      if (this.autoShift) {
        this.vehicle.gear = computeAutoGear(this.vehicle.gpsSpeedKph, this.vehicle.profile);
      }
    } else {
      this.vehicle.brake = manualBrake;
      this.vehicle.throttle = manualThrottle;
    }

    stepVehicle(this.vehicle, dt);
    updateGreenScore(this.greenScore, this.vehicle, dt);
    this.soundOutput.update(this.vehicle);
  }
}

