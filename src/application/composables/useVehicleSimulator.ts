import { onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { createGreenScore, updateGreenScore } from "../../domain/scoring/greenScore";
import { CAR_PROFILES } from "../../domain/vehicle/carProfiles";
import { createVehicleState, stepVehicle } from "../../domain/vehicle/vehiclePhysics";
import type { VehicleProfile } from "../../domain/vehicle/types";
import { WebAudioEngine } from "../../infrastructure/audio/WebAudioEngine";
import { KeyboardInput, type DriveAction } from "../../infrastructure/input/KeyboardInput";
import { BrowserGeolocation } from "../../infrastructure/telemetry/BrowserGeolocation";

export function useVehicleSimulator() {
  const vehicle = reactive(createVehicleState(CAR_PROFILES.brezza));
  const greenScore = reactive(createGreenScore());
  const audioEnabled = ref(false); const gpsEnabled = ref(false);
  const audio = new WebAudioEngine(); const gps = new BrowserGeolocation(speed => { vehicle.gpsSpeedKph = speed; vehicle.speedKph = speed; });
  let frameId = 0; let previous = 0; let stopKeyboard: () => void = () => {}; const pressed = new Set<DriveAction>();
  function setControl(action: DriveAction, active: boolean): void { if (active) pressed.add(action); else pressed.delete(action); }
  function shift(delta: number): void { vehicle.gear = Math.max(1, Math.min(vehicle.profile.gears, vehicle.gear + delta)); }
  function selectProfile(profile: VehicleProfile): void { vehicle.profile = profile; vehicle.gear = 1; vehicle.rpm = profile.idleRpm; audio.setProfile(profile); }
  async function enableAudio(): Promise<void> { await audio.resume(); audio.setProfile(vehicle.profile); audioEnabled.value = true; }
  function setGps(enabled: boolean): void { gpsEnabled.value = enabled; if (enabled) gps.start(); else { gps.stop(); vehicle.gpsSpeedKph = null; } }
  function frame(now: number): void { const dt = Math.min((now - previous) / 1000, 0.1); previous = now; vehicle.throttle = pressed.has("accelerate") ? 1 : 0; vehicle.brake = pressed.has("brake") ? 1 : 0; stepVehicle(vehicle, dt); updateGreenScore(greenScore, vehicle, dt); audio.update(vehicle); frameId = requestAnimationFrame(frame); }
  onMounted(() => { stopKeyboard = new KeyboardInput(setControl, shift).start(); previous = performance.now(); frameId = requestAnimationFrame(frame); });
  onBeforeUnmount(() => { cancelAnimationFrame(frameId); stopKeyboard(); gps.stop(); });
  return { vehicle, greenScore, profiles: CAR_PROFILES, audioEnabled, gpsEnabled, setControl, shift, selectProfile, enableAudio, setGps };
}
