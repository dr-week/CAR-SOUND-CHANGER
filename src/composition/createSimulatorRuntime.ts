import { DrivingSession } from "../application/services/DrivingSession";
import type { GreenScore } from "../domain/scoring/greenScore";
import type { VehicleState } from "../domain/vehicle/types";
import { WebAudioEngine } from "../infrastructure/audio/WebAudioEngine";
import { KeyboardInput } from "../infrastructure/input/KeyboardInput";
import { BrowserGeolocation } from "../infrastructure/telemetry/BrowserGeolocation";

/** The only layer that connects browser adapters to application use cases. */
export function createSimulatorRuntime(
  vehicle: VehicleState,
  greenScore: GreenScore,
  onTelemetryStatus: ConstructorParameters<typeof BrowserGeolocation>[1],
) {
  const audio = new WebAudioEngine();
  const session = new DrivingSession(vehicle, greenScore, audio);
  const gps = new BrowserGeolocation((speed) => session.setGpsSpeed(speed), onTelemetryStatus);
  const keyboard = new KeyboardInput(
    (action, active) => session.setControl(action, active),
    (delta) => session.shift(delta),
  );
  return { audio, session, gps, keyboard };
}
