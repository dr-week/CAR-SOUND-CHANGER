<script setup lang="ts">
/**
 * InstrumentDashboard
 *
 * Composed layout component that assembles the full instrument cluster,
 * drive controls, status row, and Bluetooth badge into one coherent block.
 *
 * Accepts the simulator's reactive output directly as props so individual
 * child components remain single-purpose and independently testable.
 */
import { computed } from "vue";
import type { AudioStatus } from "../../application/composables/useVehicleSimulator";
import type { TelemetryStatus } from "../../application/ports/TelemetryStatus";
import type { VehicleProfile } from "../../domain/vehicle/types";
import type { BluetoothStatus } from "../../infrastructure/bluetooth/BluetoothManager";
import DriveControls from "../components/DriveControls.vue";
import GearDisplay from "../components/GearDisplay.vue";
import SpeedometerGauge from "../components/SpeedometerGauge.vue";
import StatusIndicators from "../components/StatusIndicators.vue";
import VehicleTachometer from "../components/VehicleTachometer.vue";
import type { DriveAction } from "../../domain/vehicle/controls";

interface Props {
  rpm: number;
  gear: number;
  speedKph: number;
  gpsSpeedKph: number | null;
  profile: VehicleProfile;
  accelerating: boolean;
  braking: boolean;
  audioStatus: AudioStatus;
  telemetryStatus: TelemetryStatus;
  greenScore: number;
  bluetoothStatus: BluetoothStatus;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  control: [action: DriveAction, active: boolean];
  shift: [delta: number];
  reset: [];
  "bluetooth-toggle": [];
}>();

/** Active speed for display: prefer real GPS reading if available */
const displaySpeed = computed(() =>
  props.gpsSpeedKph !== null ? props.gpsSpeedKph : props.speedKph,
);

const speedSource = computed<"GPS" | "Simulation">(() =>
  props.telemetryStatus === "active" ? "GPS" : "Simulation",
);

const bluetoothLabel = computed(() => {
  switch (props.bluetoothStatus) {
    case "connected":     return "Bluetooth Active";
    case "scanning":      return "Scanning...";
    case "disconnected":  return "Connect Speaker";
    case "error":         return "Connection Failed";
    case "unsupported":   return "";
    default:              return "Connect Speaker";
  }
});

const bluetoothAriaLabel = computed(() => {
  switch (props.bluetoothStatus) {
    case "connected":    return "Bluetooth connected — tap to disconnect";
    case "scanning":     return "Scanning for Bluetooth devices";
    case "disconnected": return "Bluetooth disconnected — tap to reconnect";
    case "error":        return "Bluetooth error — tap to retry";
    case "unsupported":  return "Bluetooth not supported in this browser";
    default:             return "Connect Bluetooth audio device";
  }
});
</script>

<template>
  <div class="instrument-dashboard">
    <!-- ── Compact twin-gauge cluster: Tachometer + Gear + Speedometer ── -->
    <section class="twin-cluster" aria-label="Instrument cluster">
      <div class="tacho-wrapper">
        <VehicleTachometer :rpm="rpm" :profile="profile" />
      </div>

      <div class="gear-center-wrapper">
        <GearDisplay :gear="gear" :rpm="rpm" :shift-rpm="profile.shiftRpm" />
      </div>

      <div class="speedo-wrapper">
        <SpeedometerGauge
          :speed-kph="displaySpeed"
          :source="speedSource"
          :max-speed-kph="profile.topSpeedKph"
        />
      </div>
    </section>

    <!-- ── Status row ── -->
    <StatusIndicators
      :audio-status="audioStatus"
      :telemetry-status="telemetryStatus"
      :green-score="greenScore"
      :bluetooth-status="bluetoothStatus"
    />

    <!-- ── Drive controls ── -->
    <DriveControls
      :accelerating="accelerating"
      :braking="braking"
      @control="(a, v) => emit('control', a, v)"
      @shift="d => emit('shift', d)"
      @reset="emit('reset')"
    />

    <!-- ── Bluetooth bar ── -->
    <div
      v-if="bluetoothStatus !== 'unsupported'"
      class="bluetooth-row"
      aria-label="Bluetooth audio"
    >
      <button
        type="button"
        class="bluetooth-btn"
        :class="{
          'bluetooth-btn--connected': bluetoothStatus === 'connected',
          'bluetooth-btn--scanning':  bluetoothStatus === 'scanning',
          'bluetooth-btn--error':     bluetoothStatus === 'error',
        }"
        :aria-label="bluetoothAriaLabel"
        :disabled="bluetoothStatus === 'scanning'"
        @click="(e) => { (e.currentTarget as HTMLElement)?.blur(); emit('bluetooth-toggle'); }"
      >
        <svg class="bluetooth-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m7 7 10 10-5 5V2l5 5L7 17"/>
        </svg>
        <span>{{ bluetoothLabel }}</span>
      </button>
      <p class="bluetooth-hint">
        <template v-if="bluetoothStatus === 'connected'">
          Active · tap to disconnect
        </template>
        <template v-else-if="bluetoothStatus === 'scanning'">
          Pairing…
        </template>
        <template v-else-if="bluetoothStatus === 'error'">
          Error · tap to retry
        </template>
        <template v-else>
          Pair Bluetooth speaker
        </template>
      </p>
    </div>
  </div>
</template>

<style scoped>
/* Dashboard wrapper — compact vertical stack */
.instrument-dashboard {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ── Compact side-by-side twin-gauge cluster: Tachometer + Gear + Speedometer ── */
.twin-cluster {
  display: grid;
  grid-template-columns: 1fr 100px 1fr;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(14, 17, 23, 0.85);
  border: 1px solid var(--line);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.tacho-wrapper,
.speedo-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.gear-center-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* ── Bluetooth row ─────────────────────────────────────────────── */
.bluetooth-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 4px 0 0;
  padding: 8px 14px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: rgba(18, 21, 27, 0.9);
}

.bluetooth-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #1d2530;
  color: var(--text);
  font: inherit;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  padding: 6px 12px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}

.bluetooth-btn__icon {
  width: 14px;
  height: 14px;
}

.bluetooth-btn:disabled {
  opacity: 0.55;
  cursor: default;
}

.bluetooth-btn--connected {
  background: #163c27;
  border-color: var(--green);
  color: #5fd99e;
}

.bluetooth-btn--scanning {
  background: #1e2a1e;
  border-color: #3a5e3a;
  animation: bt-pulse 1s ease-in-out infinite;
}

.bluetooth-btn--error {
  background: #3a1515;
  border-color: var(--red);
  color: #f78080;
}

.bluetooth-btn:focus-visible {
  outline: 3px solid #f7b955;
  outline-offset: 3px;
}

.bluetooth-hint {
  margin: 0;
  color: var(--muted);
  font-size: 0.78rem;
  line-height: 1.3;
}

@keyframes bt-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.45; }
}

@media (max-width: 600px) {
  .twin-cluster {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .bluetooth-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
}
</style>
