<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from "vue";
import { useVehicleSimulator } from "../application/composables/useVehicleSimulator";
import { BluetoothManager } from "../infrastructure/bluetooth/BluetoothManager";
import type { BluetoothStatus } from "../infrastructure/bluetooth/BluetoothManager";
import DriveControls from "../presentation/components/DriveControls.vue";
import GearDisplay from "../presentation/components/GearDisplay.vue";
import SpeedometerGauge from "../presentation/components/SpeedometerGauge.vue";
import StatusIndicators from "../presentation/components/StatusIndicators.vue";
import VehicleTachometer from "../presentation/components/VehicleTachometer.vue";

// ── Simulator ──────────────────────────────────────────────────────────────
const simulator = useVehicleSimulator();

// ── Bluetooth ──────────────────────────────────────────────────────────────
const bluetooth = new BluetoothManager();
const bluetoothStatus = ref<BluetoothStatus>(bluetooth.status);

let unsubBt: (() => void) | null = null;
onMounted(() => {
  unsubBt = bluetooth.onStatusChange((s) => {
    bluetoothStatus.value = s;
  });
});
onBeforeUnmount(() => {
  unsubBt?.();
  bluetooth.disconnect();
});

async function handleBluetoothToggle(): Promise<void> {
  if (bluetoothStatus.value === "connected") {
    bluetooth.disconnect();
  } else {
    await bluetooth.requestDevice();
  }
}

// ── Computed helpers ────────────────────────────────────────────────────────
const displaySpeed = computed(
  () => simulator.vehicle.gpsSpeedKph ?? simulator.vehicle.speedKph,
);

const speedSource = computed<"GPS" | "Simulation">(() =>
  simulator.telemetryStatus.value === "active" ? "GPS" : "Simulation",
);

const profileDetails = computed(
  () =>
    `${simulator.vehicle.profile.cylinders}-cyl · ${simulator.vehicle.profile.gears}-speed · shift @ ${simulator.vehicle.profile.shiftRpm.toLocaleString()} RPM`,
);

const audioButtonLabel = computed(() =>
  simulator.audioEnabled.value ? "Mute audio" : "Enable audio",
);

const audioMessage = computed(
  () =>
    ({
      inactive: "",
      active: "",
      unsupported: "Web Audio is unavailable in this browser.",
      blocked: "Audio was blocked. Tap Enable audio to retry.",
    })[simulator.audioStatus.value],
);

const gpsMessage = computed(
  () =>
    ({
      inactive: "GPS off — using keyboard simulation.",
      active: "GPS active. Speed is read from your device.",
      unavailable: "Geolocation is unavailable in this browser.",
      denied: "Location permission was denied.",
      error: "GPS could not obtain a fix.",
      stale: "GPS data stale — simulation is still running.",
    })[simulator.telemetryStatus.value],
);

const bluetoothLabel = computed(() => {
  switch (bluetoothStatus.value) {
    case "connected":    return "BT ●  " + (bluetooth.deviceName ?? "Connected");
    case "scanning":     return "BT  Scanning…";
    case "disconnected": return "BT ○  Disconnected";
    case "error":        return "BT ✕  Error — retry";
    case "unsupported":  return "";
    default:             return "BT  Connect speaker";
  }
});

function onProfileChange(event: Event): void {
  simulator.selectProfile((event.target as HTMLSelectElement).value);
}

function onGpsChange(event: Event): void {
  simulator.setGps((event.target as HTMLInputElement).checked);
}
</script>

<template>
  <main class="shell">

    <!-- ── Header ─────────────────────────────────────────────────────── -->
    <header>
      <div>
        <p class="eyebrow">Browser sound simulator</p>
        <h1>Car Sound Mod</h1>
      </div>
      <button class="primary" type="button" @click="simulator.enableAudio">
        {{ audioButtonLabel }}
      </button>
    </header>

    <!-- ── Gauge cluster ──────────────────────────────────────────────── -->
    <section class="gauge-cluster" aria-label="Instrument cluster">
      <!-- Tachometer (RPM) — main, larger gauge -->
      <div class="gauge-tacho">
        <VehicleTachometer
          :rpm="simulator.vehicle.rpm"
          :profile="simulator.vehicle.profile"
        />
      </div>

      <!-- Speedometer + gear side panel -->
      <div class="gauge-side">
        <SpeedometerGauge
          :speed-kph="displaySpeed"
          :source="speedSource"
          :max-speed-kph="180"
        />
        <GearDisplay :gear="simulator.vehicle.gear" />
      </div>
    </section>

    <!-- ── Status row ─────────────────────────────────────────────────── -->
    <StatusIndicators
      :audio-status="simulator.audioStatus.value"
      :telemetry-status="simulator.telemetryStatus.value"
      :green-score="simulator.greenScore.points"
      :bluetooth-status="bluetoothStatus"
    />

    <!-- ── Status messages ────────────────────────────────────────────── -->
    <p
      v-if="audioMessage"
      class="status"
      role="alert"
    >
      {{ audioMessage }}
    </p>

    <!-- ── Drive controls ─────────────────────────────────────────────── -->
    <DriveControls
      :accelerating="simulator.vehicle.throttle > 0"
      :braking="simulator.vehicle.brake > 0"
      @control="simulator.setControl"
      @shift="simulator.shift"
      @reset="simulator.reset"
    />

    <!-- ── Settings panel ─────────────────────────────────────────────── -->
    <section class="panel">
      <label for="volume">Volume · {{ simulator.volume.value }}%</label>
      <input
        id="volume"
        type="range"
        min="0"
        max="100"
        :value="simulator.volume.value"
        @input="simulator.setVolume(Number(($event.target as HTMLInputElement).value))"
      />

      <label for="profile" style="margin-top:14px">Vehicle profile</label>
      <select
        id="profile"
        :value="simulator.vehicle.profile.id"
        @change="onProfileChange"
      >
        <option
          v-for="profile in simulator.profiles"
          :key="profile.id"
          :value="profile.id"
        >
          {{ profile.name }}
        </option>
      </select>
      <p>{{ profileDetails }}</p>
    </section>

    <!-- ── GPS + Bluetooth panel ──────────────────────────────────────── -->
    <section class="panel compact">
      <label>
        <input
          type="checkbox"
          :checked="simulator.gpsEnabled.value"
          @change="onGpsChange"
        />
        Use device GPS speed
      </label>
      <p>{{ gpsMessage }}</p>

      <!-- Bluetooth toggle — hidden when Web Bluetooth not supported -->
      <div v-if="bluetoothStatus !== 'unsupported'" class="bluetooth-row">
        <button
          type="button"
          class="bt-btn"
          :class="{
            'bt-btn--connected':  bluetoothStatus === 'connected',
            'bt-btn--scanning':   bluetoothStatus === 'scanning',
            'bt-btn--error':      bluetoothStatus === 'error',
          }"
          :disabled="bluetoothStatus === 'scanning'"
          :aria-label="bluetoothLabel"
          @click="handleBluetoothToggle"
        >
          {{ bluetoothLabel }}
        </button>
        <p class="bt-hint">
          Audio routes through your OS output device. Connect your Bluetooth
          speaker in system settings, then tap above to pair it here.
        </p>
      </div>

      <p class="key-hint">
        W accelerate · S brake · 1 upshift · 2 downshift
      </p>
    </section>

  </main>
</template>

<style>
/* ── Gauge cluster layout ────────────────────────────────────────────────── */
.gauge-cluster {
  display: grid;
  grid-template-columns: 1fr 180px;
  align-items: center;
  gap: 16px;
  margin: 16px auto 8px;
  max-width: 560px;
}

.gauge-tacho {
  width: 100%;
}

.gauge-side {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

/* ── Bluetooth row ───────────────────────────────────────────────────────── */
.bluetooth-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-top: 14px;
  flex-wrap: wrap;
}

.bt-btn {
  flex-shrink: 0;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #1d2530;
  color: var(--text);
  font: inherit;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  padding: 8px 14px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s, border-color 0.15s;
}

.bt-btn:disabled {
  opacity: 0.5;
  cursor: default;
}

.bt-btn--connected {
  background: #163c27;
  border-color: var(--green);
  color: #5fd99e;
}

.bt-btn--scanning {
  background: #1b2a1b;
  border-color: #3a5e3a;
  animation: bt-pulse 0.9s ease-in-out infinite;
}

.bt-btn--error {
  background: #3a1515;
  border-color: var(--red);
  color: #f78080;
}

.bt-btn:focus-visible {
  outline: 3px solid #f7b955;
  outline-offset: 3px;
}

.bt-hint {
  color: var(--muted);
  font-size: 0.8rem;
  line-height: 1.5;
  margin: 0;
}

.key-hint {
  margin-top: 10px;
  color: var(--muted);
  font-size: 0.8rem;
}

@keyframes bt-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}

/* ── Responsive ──────────────────────────────────────────────────────────── */
@media (max-width: 600px) {
  .gauge-cluster {
    grid-template-columns: 1fr 120px;
    gap: 10px;
  }
  .bluetooth-row {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
