<script setup lang="ts">
import type { AudioStatus } from "../../application/composables/useVehicleSimulator";
import type { TelemetryStatus } from "../../application/ports/TelemetryStatus";

defineProps<{ audioStatus: AudioStatus; telemetryStatus: TelemetryStatus; greenScore: number }>();
</script>

<template>
  <section class="status-indicators" aria-label="System status">
    <p>
      <span>Audio</span><strong>{{ audioStatus }}</strong>
    </p>
    <p>
      <span>Source</span><strong>{{ telemetryStatus === "active" ? "GPS" : "Simulation" }}</strong>
    </p>
    <p>
      <span>Green</span><strong>{{ greenScore }}/100</strong>
    </p>
  </section>
</template>
