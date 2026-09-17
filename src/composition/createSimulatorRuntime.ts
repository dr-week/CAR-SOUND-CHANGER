import { DrivingSession } from "../application/services/DrivingSession";
import type { GreenScore } from "../domain/scoring/greenScore";
import type { VehicleState } from "../domain/vehicle/types";
import { WebAudioEngine } from "../infrastructure/audio/WebAudioEngine";
import { KeyboardInput } from "../infrastructure/input/KeyboardInput";
import { BrowserGeolocation } from "../infrastructure/telemetry/BrowserGeolocation";

import { BluetoothManager } from "../infrastructure/bluetooth/BluetoothManager";

import type { DriveAction } from "../domain/vehicle/controls";

/** The only layer that connects browser adapters to application use cases. */
export function createSimulatorRuntime(
  vehicle: VehicleState,
  greenScore: GreenScore,
  onTelemetryStatus: ConstructorParameters<typeof BrowserGeolocation>[1],
  onControl?: (action: DriveAction, active: boolean) => void,
) {
  const audio = new WebAudioEngine();
  const session = new DrivingSession(vehicle, greenScore, audio);
  const bluetooth = new BluetoothManager();
  const gps = new BrowserGeolocation((speed) => session.setGpsSpeed(speed), (status) => {
    if (status !== "active") session.clearGpsSpeed();
    onTelemetryStatus(status);
  });
  const keyboard = new KeyboardInput(
    (action, active) => {
      session.setControl(action, active);
      onControl?.(action, active);
    },
    (delta) => session.shift(delta),
  );
  return { audio, session, gps, keyboard, bluetooth };
}

