import { onBeforeUnmount, onMounted, reactive, ref } from "vue";
import type { TelemetryStatus } from "../../application/ports/TelemetryStatus";
import { createGreenScore } from "../../domain/scoring/greenScore";
import { CAR_PROFILES, isProfileId, type ProfileId } from "../../domain/vehicle/carProfiles";
import type { DriveAction } from "../../domain/vehicle/controls";
import { createVehicleState } from "../../domain/vehicle/vehiclePhysics";
import { createSimulatorRuntime } from "../../composition/createSimulatorRuntime";

export type AudioStatus = "inactive" | "active" | "unsupported" | "blocked";

export function useVehicleSimulator() {
  const vehicle = reactive(createVehicleState(CAR_PROFILES.brezza));
  const greenScore = reactive(createGreenScore());
  const audioEnabled = ref(false);
  const audioStatus = ref<AudioStatus>("inactive");
  const gpsEnabled = ref(false);
  const telemetryStatus = ref<TelemetryStatus>("inactive");
  const { audio, session, gps, keyboard } = createSimulatorRuntime(vehicle, greenScore, (status) => {
    telemetryStatus.value = status;
  });
  let frameId = 0;
  let previous = 0;
  let stopKeyboard: () => void = () => {};
  function setControl(action: DriveAction, active: boolean): void {
    session.setControl(action, active);
  }
  function shift(delta: number): void {
    session.shift(delta);
  }
  function selectProfile(id: string): void {
    if (isProfileId(id)) session.selectProfile(CAR_PROFILES[id as ProfileId]);
  }
  async function enableAudio(): Promise<void> {
    if (!audio.isSupported) {
      audioStatus.value = "unsupported";
      return;
    }
    try {
      await audio.resume();
      audio.setProfile(vehicle.profile);
      audioEnabled.value = true;
      audioStatus.value = "active";
    } catch {
      audioEnabled.value = false;
      audioStatus.value = "blocked";
    }
  }
  function setGps(enabled: boolean): void {
    gpsEnabled.value = enabled;
    if (enabled) gps.start();
    else {
      gps.stop();
      session.clearGpsSpeed();
    }
  }
  function reset(): void {
    session.reset();
    gps.stop();
    gpsEnabled.value = false;
  }
  function frame(now: number): void {
    const dt = Math.min((now - previous) / 1000, 0.1);
    previous = now;
    session.step(dt);
    frameId = requestAnimationFrame(frame);
  }
  onMounted(() => {
    stopKeyboard = keyboard.start();
    previous = performance.now();
    frameId = requestAnimationFrame(frame);
  });
  onBeforeUnmount(() => {
    cancelAnimationFrame(frameId);
    stopKeyboard();
    gps.stop();
  });
  return {
    vehicle,
    greenScore,
    profiles: CAR_PROFILES,
    audioEnabled,
    audioStatus,
    gpsEnabled,
    telemetryStatus,
    setControl,
    shift,
    selectProfile,
    enableAudio,
    setGps,
    reset,
  };
}
