<script setup lang="ts">
import type { VehicleProfile } from "../../domain/vehicle/types";
import type { DriveAction } from "../../domain/vehicle/controls";
import type { AudioStatus } from "../../application/composables/useVehicleSimulator";
import type { TelemetryStatus } from "../../application/ports/TelemetryStatus";
import type { BluetoothStatus } from "../../infrastructure/bluetooth/BluetoothManager";
import InstrumentDashboard from "../dashboard/InstrumentDashboard.vue";

defineProps<{
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
  bluetoothStatus?: BluetoothStatus;
}>();

const emit = defineEmits<{
  control: [action: DriveAction, active: boolean];
  shift: [delta: number];
  reset: [];
}>();
</script>

<template>
  <div class="page gauges-page">
    <div class="page-title">
      <div>
        <p class="eyebrow">COCKPIT INSTRUMENTATION</p>
        <h1>Gauges Cluster</h1>
      </div>
    </div>

    <InstrumentDashboard
      :rpm="rpm"
      :gear="gear"
      :speed-kph="speedKph"
      :profile="profile"
      :accelerating="accelerating"
      :braking="braking"
      :audio-status="audioStatus"
      :muted="muted"
      :telemetry-status="telemetryStatus"
      :green-score="greenScore"
      :bluetooth-status="bluetoothStatus"
      @control="(action, active) => emit('control', action, active)"
      @shift="(delta) => emit('shift', delta)"
      @reset="emit('reset')"
    />
  </div>
</template>
