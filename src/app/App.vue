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
        <p class="eyebrow">Artistic Sound Simulator</p>
        <h1>Car Sound Mod</h1>
      </div>
      <button
        class="primary"
        type="button"
        @click="(e) => { (e.target as HTMLElement)?.blur(); simulator.enableAudio(); }"
      >
        <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
          <path v-if="simulator.audioEnabled.value" d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
          <line v-else x1="23" y1="9" x2="17" y2="15"/>
        </svg>
        <span>{{ audioButtonLabel }}</span>
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
      <label for="volume" class="settings-label">
        <svg class="settings-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
        </svg>
        Volume · {{ simulator.volume.value }}%
      </label>
      <input
        id="volume"
        type="range"
        min="0"
        max="100"
        :value="simulator.volume.value"
        @input="simulator.setVolume(Number(($event.target as HTMLInputElement).value))"
        @change="($event.target as HTMLElement)?.blur()"
      />

      <label for="profile" class="settings-label" style="margin-top:14px">
        <svg class="settings-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
          <circle cx="7" cy="17" r="2"/>
          <circle cx="17" cy="17" r="2"/>
        </svg>
        Vehicle profile
      </label>
      <select
        id="profile"
        :value="simulator.vehicle.profile.id"
        @change="(e) => { onProfileChange(e); (e.target as HTMLElement)?.blur(); }"
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
      <label class="gps-label">
        <input
          type="checkbox"
          :checked="simulator.gpsEnabled.value"
          @change="(e) => { onGpsChange(e); (e.target as HTMLElement)?.blur(); }"
        />
        <svg class="settings-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
        Use device GPS telemetry
      </label>
      <p>{{ gpsMessage }}</p>

      <div class="key-shortcuts-badge">
        <span class="shortcut-item"><strong>W</strong> / <strong>▲</strong> Accelerate</span>
        <span class="shortcut-item"><strong>S</strong> / <strong>▼</strong> / <strong>Space</strong> Brake</span>
        <span class="shortcut-item"><strong>1</strong> / <strong>Q</strong> Shift Up</span>
        <span class="shortcut-item"><strong>2</strong> / <strong>E</strong> Shift Down</span>
      </div>
    </section>

  </main>
</template>
