import { onBeforeUnmount, onMounted, reactive, ref } from "vue";
import type { TelemetryStatus } from "../../application/ports/TelemetryStatus";
import { createGreenScore } from "../../domain/scoring/greenScore";
import { CAR_PROFILES, isProfileId, type ProfileId } from "../../domain/vehicle/carProfiles";
import type { DriveAction } from "../../domain/vehicle/controls";
import { createVehicleState } from "../../domain/vehicle/vehiclePhysics";
import { createSimulatorRuntime } from "../../composition/createSimulatorRuntime";

import type { BluetoothStatus } from "../../infrastructure/bluetooth/BluetoothManager";

export type AudioStatus = "inactive" | "active" | "unsupported" | "blocked";

export function useVehicleSimulator() {
  const vehicle = reactive(createVehicleState(CAR_PROFILES.brezza));
  const greenScore = reactive(createGreenScore());
  const audioEnabled = ref(false);
  const audioPending = ref(false);
  const volume = ref(50);
  const audioStatus = ref<AudioStatus>("inactive");
  const gpsEnabled = ref(false);
  const telemetryStatus = ref<TelemetryStatus>("inactive");
  const accelerating = ref(false);
  const braking = ref(false);

  const { audio, session, gps, keyboard, bluetooth } = createSimulatorRuntime(
    vehicle,
    greenScore,
    (status) => {
      telemetryStatus.value = status;
    },
    (action, active) => {
      if (action === "accelerate") accelerating.value = active;
      if (action === "brake") braking.value = active;
    },
  );

  const bluetoothStatus = ref<BluetoothStatus>(bluetooth.status);
  const bluetoothDeviceName = ref<string | null>(bluetooth.deviceName);
  const isBluetoothSupported = bluetooth.isSupported;
  const stopBluetooth = bluetooth.onStatusChange((status) => {
    bluetoothStatus.value = status;
    bluetoothDeviceName.value = bluetooth.deviceName;
  });

  let frameId = 0;
  let previous = 0;
  let stopKeyboard: () => void = () => {};

  function setControl(action: DriveAction, active: boolean): void {
    if (action === "accelerate") accelerating.value = active;
    if (action === "brake") braking.value = active;
    session.setControl(action, active);
  }
  function shift(delta: number): void {
    session.shift(delta);
  }
  function selectProfile(id: string): void {
    if (!isProfileId(id)) return;
    setGps(false);
    session.selectProfile(CAR_PROFILES[id as ProfileId]);
  }
  async function connectBluetooth(): Promise<void> {
    await bluetooth.requestDevice();
  }
  function disconnectBluetooth(): void {
    bluetooth.disconnect();
  }
  async function enableAudio(): Promise<void> {
    if (audioPending.value) return;
    if (!audio.isSupported) {
      audioStatus.value = "unsupported";
      return;
    }
    audioPending.value = true;
    try {
      if (audioEnabled.value) {
        await audio.suspend();
        audioEnabled.value = false;
        audioStatus.value = "inactive";
        return;
      }
      await audio.resume();
      audio.setProfile(vehicle.profile);
      audioEnabled.value = true;
      audioStatus.value = "active";
    } catch {
      audioEnabled.value = false;
      audioStatus.value = "blocked";
    } finally {
      audioPending.value = false;
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
  function setVolume(value: number): void {
    if (!Number.isFinite(value)) return;
    volume.value = Math.max(0, Math.min(100, value));
    audio.setVolume(volume.value / 100);
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
    stopBluetooth();
    gps.stop();
    void audio.dispose();
  });
  return {
    vehicle,
    greenScore,
    profiles: CAR_PROFILES,
    audioEnabled,
    audioPending,
    audioStatus,
    gpsEnabled,
    telemetryStatus,
    accelerating,
    braking,
    bluetoothStatus,
    bluetoothDeviceName,
    isBluetoothSupported,
    connectBluetooth,
    disconnectBluetooth,
    setControl,
    shift,
    selectProfile,
    enableAudio,
    setGps,
    reset,
    volume,
    setVolume,
  };
}
