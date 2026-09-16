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
  <section class="status-indicators" aria-label="System status">

    <!-- Audio -->
    <div class="badge">
      <span class="badge__label">
        <svg class="badge__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
        </svg>
        Audio
      </span>
      <strong
        class="badge__value"
        :style="{ color: audioStatus === 'active' ? 'var(--green)' : 'var(--muted)' }"
      >
        {{ audioLabel }}
      </strong>
    </div>

    <!-- Speed source (GPS vs Simulation) -->
    <div class="badge">
      <span class="badge__label">
        <svg class="badge__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 2v3m0 14v3M2 12h3m14 0h3"/>
        </svg>
        Source
      </span>
      <strong class="badge__value" :style="{ color: sourceColour }">
        {{ sourceLabel }}
      </strong>
    </div>

    <!-- Green eco-score -->
    <div class="badge badge--score">
      <span class="badge__label">
        <svg class="badge__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.4 19 2c1 2 2 4.1 2 7 0 6-4.5 11-10 11z"/>
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
        </svg>
        Eco
      </span>
      <strong class="badge__value" :style="{ color: scoreColour }">
        {{ greenScore }}<small style="font-size:0.65em;font-weight:500;">/100</small>
      </strong>
    </div>

    <!-- Bluetooth -->
    <div class="badge">
      <span class="badge__label">
        <svg class="badge__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m7 7 10 10-5 5V2l5 5L7 17"/>
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

<style scoped>
.status-indicators {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  width: 100%;
}

.badge {
  padding: 10px 8px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: rgba(18, 21, 27, 0.85);
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: transform 0.15s ease, border-color 0.15s ease, background 0.15s ease;
}

.badge:hover {
  transform: translateY(-1px);
  border-color: rgba(255, 255, 255, 0.16);
  background: rgba(24, 28, 36, 0.95);
}

.badge--score {
  border-color: rgba(49, 165, 102, 0.4);
}

.badge__label {
  color: var(--muted);
  font-size: 0.64rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.badge__icon {
  width: 13px;
  height: 13px;
  opacity: 0.85;
}

.badge__value {
  font-size: 0.92rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  transition: color 0.3s;
}

.badge--scanning {
  animation: pulse 0.9s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.35; }
}

@media (max-width: 600px) {
  .status-indicators {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
