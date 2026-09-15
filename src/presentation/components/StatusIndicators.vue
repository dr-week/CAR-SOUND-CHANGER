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
      <span class="badge__label">Audio</span>
      <strong
        class="badge__value"
        :style="{ color: audioStatus === 'active' ? 'var(--green)' : 'var(--muted)' }"
      >
        {{ audioLabel }}
      </strong>
    </div>

    <!-- Speed source (GPS vs Simulation) -->
    <div class="badge">
      <span class="badge__label">Source</span>
      <strong class="badge__value" :style="{ color: sourceColour }">
        {{ sourceLabel }}
      </strong>
    </div>

    <!-- Green eco-score -->
    <div class="badge badge--score">
      <span class="badge__label">Eco</span>
      <strong class="badge__value" :style="{ color: scoreColour }">
        {{ greenScore }}<small style="font-size:0.65em;font-weight:500;">/100</small>
      </strong>
    </div>

    <!-- Bluetooth -->
    <div class="badge">
      <span class="badge__label">Output</span>
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
  gap: 8px;
  margin: 10px auto 20px;
  max-width: 560px;
}

.badge {
  padding: 10px 8px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: rgba(18, 21, 27, 0.9);
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.badge--score {
  border-color: #2e7d55;
}

.badge__label {
  color: var(--muted);
  font-size: 0.63rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.badge__value {
  font-size: 0.9rem;
  font-weight: 700;
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
