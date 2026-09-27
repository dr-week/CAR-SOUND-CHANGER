<script setup lang="ts">
import type { VehicleProfile } from "../../domain/vehicle/types";

defineProps<{
  active: boolean;
  profile: VehicleProfile;
  rpm: number;
  speedKph: number;
  telemetryStatus: string;
  throttle: number;
  brake: number;
  greenScore: number;
  penalties: { harshBrake: number; highRpm: number; harshThrottle: number };
  audioStatus: string;
  bluetoothName: string | null;
  bluetoothStatus: string;
}>();

const emit = defineEmits<{
  "close": [];
}>();
</script>

<template>
  <div v-if="active" class="diagnostics-modal" role="dialog" aria-label="Vehicle Diagnostics">
    <div class="diag-card card">
      <div class="diag-header">
        <div>
          <p class="eyebrow">TELEMETRY & OBD-II DIAGNOSTICS</p>
          <h2>Vehicle Systems Inspector</h2>
        </div>
        <button type="button" class="quick-close" aria-label="Close" @click="emit('close')">✕</button>
      </div>
      <div class="diag-grid">
        <div class="diag-item">
          <span>ACTIVE PROFILE</span>
          <strong>{{ profile.name }}</strong>
        </div>
        <div class="diag-item">
          <span>ENGINE RPM</span>
          <strong>{{ Math.round(rpm) }} RPM</strong>
        </div>
        <div class="diag-item">
          <span>VEHICLE SPEED</span>
          <strong>{{ Math.round(speedKph) }} KM/H ({{ telemetryStatus.toUpperCase() }})</strong>
        </div>
        <div class="diag-item">
          <span>THROTTLE / BRAKE</span>
          <strong>{{ Math.round(throttle * 100) }}% / {{ Math.round(brake * 100) }}%</strong>
        </div>
        <div class="diag-item">
          <span>GREEN ECO SCORE</span>
          <strong>{{ greenScore }}/100</strong>
        </div>
        <div class="diag-item">
          <span>PENALTIES (HARSH DRIVING)</span>
          <small>Brake: {{ penalties.harshBrake.toFixed(1) }} | RPM: {{ penalties.highRpm.toFixed(1) }} | Throttle: {{ penalties.harshThrottle.toFixed(1) }}</small>
        </div>
        <div class="diag-item">
          <span>AUDIO ENGINE STATUS</span>
          <strong>{{ audioStatus.toUpperCase() }} (Sample Rate 44.1kHz)</strong>
        </div>
        <div class="diag-item">
          <span>BLUETOOTH GATT</span>
          <strong>{{ bluetoothName || bluetoothStatus.toUpperCase() }}</strong>
        </div>
      </div>
    </div>
  </div>
</template>
