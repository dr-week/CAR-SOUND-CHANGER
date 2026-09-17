<script setup lang="ts">
/**
 * InstrumentDashboard
 *
 * Avant-garde cockpit dashboard component assembling the twin-gauge cluster,
 * central gear & shift light indicator, status row, and tactile driving pads.
 */
import type { AudioStatus } from "../../application/composables/useVehicleSimulator";
import type { TelemetryStatus } from "../../application/ports/TelemetryStatus";
import type { VehicleProfile } from "../../domain/vehicle/types";
import type { DriveAction } from "../../domain/vehicle/controls";
import VehicleTachometer from "../components/VehicleTachometer.vue";
import SpeedometerGauge from "../components/SpeedometerGauge.vue";
import GearDisplay from "../components/GearDisplay.vue";
import StatusIndicators from "../components/StatusIndicators.vue";
import DriveControls from "../components/DriveControls.vue";

const props = defineProps<{
  rpm: number;
  gear: number;
  speedKph: number;
  profile: VehicleProfile;
  accelerating: boolean;
  braking: boolean;
  audioStatus: AudioStatus;
  muted: boolean;
  telemetryStatus: TelemetryStatus;
  greenScore: number;
}>();

const emit = defineEmits<{
  control: [action: DriveAction, active: boolean];
  shift: [delta: number];
  reset: [];
}>();
</script>

<template>
  <div class="instrument-dashboard" aria-label="Live driving instruments">
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
          :speed-kph="speedKph"
          :source="telemetryStatus === 'active' ? 'GPS' : 'Simulation'"
          :max-speed-kph="profile.topSpeedKph"
        />
      </div>
    </section>

    <!-- ── Status Bar ── -->
    <StatusIndicators
      :audio-status="audioStatus"
      :telemetry-status="telemetryStatus"
      :green-score="greenScore"
      :bluetooth-status="'idle'"
    />

    <!-- ── Drive Controls Pads ── -->
    <DriveControls
      :accelerating="accelerating"
      :braking="braking"
      @control="(action, active) => emit('control', action, active)"
      @shift="(delta) => emit('shift', delta)"
      @reset="emit('reset')"
    />
  </div>
</template>

<style scoped>
.instrument-dashboard {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.twin-cluster {
  display: grid;
  grid-template-columns: 1fr 100px 1fr;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  background: rgba(12, 15, 21, 0.88);
  border: 1px solid var(--line);
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.45);
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

@media (max-width: 600px) {
  .twin-cluster {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>
