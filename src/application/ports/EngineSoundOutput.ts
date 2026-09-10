import type { VehicleProfile, VehicleState } from "../../domain/vehicle/types";

/** Application-owned contract implemented by browser audio or a future native output. */
export interface EngineSoundOutput {
  setProfile(profile: VehicleProfile): void;
  update(state: VehicleState): void;
}
