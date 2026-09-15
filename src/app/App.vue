<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from "vue";
import { useVehicleSimulator } from "../application/composables/useVehicleSimulator";
import { BluetoothManager } from "../infrastructure/bluetooth/BluetoothManager";
import type { BluetoothStatus } from "../infrastructure/bluetooth/BluetoothManager";
import InstrumentDashboard from "../presentation/dashboard/InstrumentDashboard.vue";

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

    <!-- ── Status messages ────────────────────────────────────────────── -->
    <p
      v-if="audioMessage"
      class="status"
      role="alert"
    >
      {{ audioMessage }}
    </p>

    <!-- ── Main Instrument Dashboard ──────────────────────────────────── -->
    <InstrumentDashboard
      :rpm="simulator.vehicle.rpm"
      :gear="simulator.vehicle.gear"
      :speed-kph="simulator.vehicle.speedKph"
      :gps-speed-kph="simulator.vehicle.gpsSpeedKph"
      :profile="simulator.vehicle.profile"
      :accelerating="simulator.vehicle.throttle > 0"
      :braking="simulator.vehicle.brake > 0"
      :audio-status="simulator.audioStatus.value"
      :telemetry-status="simulator.telemetryStatus.value"
      :green-score="simulator.greenScore.points"
      :bluetooth-status="bluetoothStatus"
      @control="simulator.setControl"
      @shift="simulator.shift"
      @reset="simulator.reset"
      @bluetooth-toggle="handleBluetoothToggle"
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

    <!-- ── GPS & Controls summary ─────────────────────────────────────── -->
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
