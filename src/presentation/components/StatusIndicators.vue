<script setup lang="ts">
import { computed } from "vue";
import type { AudioStatus } from "../../application/composables/useVehicleSimulator";
import type { TelemetryStatus } from "../../application/ports/TelemetryStatus";
import type { BluetoothStatus } from "../../infrastructure/bluetooth/BluetoothManager";

const props = defineProps<{
  audioStatus: AudioStatus;
  telemetryStatus: TelemetryStatus;
  greenScore: number;
  bluetoothStatus: BluetoothStatus;
}>();

/** Colour helper for the green score badge */
const scoreColour = computed(() => {
  if (props.greenScore >= 80) return "var(--green)";
  if (props.greenScore >= 50) return "#f7b955";
  return "var(--red)";
});

/** Friendly label for audio status */
const audioLabel = computed(() => {
  const map: Record<AudioStatus, string> = {
    inactive:    "Off",
    active:      "On",
    unsupported: "N/A",
    blocked:     "Blocked",
  };
  return map[props.audioStatus];
});

/** Friendly label and colour for bluetooth */
const btLabel = computed(() => {
  const map: Record<BluetoothStatus, string> = {
    idle:         "BT Off",
    scanning:     "Scanning…",
    connected:    "BT On",
    disconnected: "BT Lost",
    error:        "BT Error",
    unsupported:  "No BT",
  };
  return map[props.bluetoothStatus];
});

const btColour = computed(() => {
  if (props.bluetoothStatus === "connected") return "var(--green)";
  if (props.bluetoothStatus === "error" || props.bluetoothStatus === "disconnected") return "var(--red)";
  if (props.bluetoothStatus === "scanning") return "#f7b955";
  return "var(--muted)";
});

/** Source label */
const sourceLabel = computed(() =>
  props.telemetryStatus === "active" ? "GPS" : "Sim",
);

const sourceColour = computed(() =>
  props.telemetryStatus === "active" ? "var(--green)" : "var(--muted)",
);
</script>

<template>
  <section class="status-indicators" aria-label="System Status">
    <!-- Telemetry Source -->
    <div class="badge">
      <span class="badge__label">
        <svg class="badge__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
        Source
      </span>
      <strong class="badge__value" :style="{ color: sourceColour }">
        {{ sourceLabel }}
      </strong>
    </div>

    <!-- Engine Audio -->
    <div class="badge">
      <span class="badge__label">
        <svg class="badge__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
        Sound
      </span>
      <strong
        class="badge__value"
        :style="{ color: audioStatus === 'active' ? 'var(--green)' : 'var(--muted)' }"
      >
        {{ audioLabel }}
      </strong>
    </div>

    <!-- Eco Score -->
    <div class="badge badge--score">
      <span class="badge__label">
        <svg class="badge__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
        </svg>
        Eco
      </span>
      <strong class="badge__value" :style="{ color: scoreColour }">
        {{ greenScore }}
      </strong>
    </div>

    <!-- Bluetooth -->
    <div class="badge">
      <span class="badge__label">
        <svg class="badge__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m7 7 10 10-5 5V2l5 5L7 17" />
        </svg>
        Output
      </span>
      <strong
        class="badge__value"
        :class="{ 'badge--scanning': bluetoothStatus === 'scanning' }"
        :style="{ color: btColour }"
      >
        {{ btLabel }}
      </strong>
    </div>
  </section>
</template>

<style scoped src="./status/statusIndicators.css"></style>
