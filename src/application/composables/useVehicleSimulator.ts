import { onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { createGreenScore } from "../../domain/scoring/greenScore";
import { CAR_PROFILES } from "../../domain/vehicle/carProfiles";
import { createVehicleState } from "../../domain/vehicle/vehiclePhysics";
import { WebAudioEngine } from "../../infrastructure/audio/WebAudioEngine";
import { KeyboardInput, type DriveAction } from "../../infrastructure/input/KeyboardInput";
import { BrowserGeolocation } from "../../infrastructure/telemetry/BrowserGeolocation";
import { DrivingSession } from "../services/DrivingSession";

export function useVehicleSimulator() {
  const vehicle = reactive(createVehicleState(CAR_PROFILES.brezza));
  const greenScore = reactive(createGreenScore());
  const audioEnabled = ref(false); const gpsEnabled = ref(false); const audio = new WebAudioEngine();
  const session = new DrivingSession(vehicle, greenScore, audio);
  const gps = new BrowserGeolocation(speed => session.setGpsSpeed(speed));
  let frameId = 0; let previous = 0; let stopKeyboard: () => void = () => {};
  function setControl(action: DriveAction, active: boolean): void { session.setControl(action, active); }
  function shift(delta: number): void { session.shift(delta); }
  function selectProfile(id: string): void { session.selectProfile(CAR_PROFILES[id]); }
  async function enableAudio(): Promise<void> { await audio.resume(); audio.setProfile(vehicle.profile); audioEnabled.value = true; }
  function setGps(enabled: boolean): void { gpsEnabled.value = enabled; if (enabled) gps.start(); else { gps.stop(); session.clearGpsSpeed(); } }
  function frame(now: number): void { const dt = Math.min((now - previous) / 1000, 0.1); previous = now; session.step(dt); frameId = requestAnimationFrame(frame); }
  onMounted(() => { stopKeyboard = new KeyboardInput(setControl, shift).start(); previous = performance.now(); frameId = requestAnimationFrame(frame); });
  onBeforeUnmount(() => { cancelAnimationFrame(frameId); stopKeyboard(); gps.stop(); });
  return { vehicle, greenScore, profiles: CAR_PROFILES, audioEnabled, gpsEnabled, setControl, shift, selectProfile, enableAudio, setGps };
}
