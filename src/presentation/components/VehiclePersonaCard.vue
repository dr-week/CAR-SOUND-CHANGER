<script setup lang="ts">
import { computed } from "vue";
import type { VehicleProfile } from "../../domain/vehicle/types";

const props = defineProps<{
  profile: VehicleProfile;
  rpm: number;
  speedKph: number;
  audioEnabled: boolean;
  throttle: number;
  brake: number;
  profiles: Record<string, VehicleProfile>;
}>();

const emit = defineEmits<{
  toggleEngine: [];
  selectProfile: [id: string];
}>();

// Firing frequency in Hz: (RPM * cylinders) / 120 for 4-stroke engine
const firingFreq = computed(() =>
  props.audioEnabled ? Math.round((props.rpm * props.profile.cylinders) / 120) : 0,
);

const throttlePercent = computed(() => Math.round(Math.min(1, Math.max(0, props.throttle)) * 100));
const brakePercent = computed(() => Math.round(Math.min(1, Math.max(0, props.brake)) * 100));

// Profile quick keys for fast switching
const quickProfiles = computed(() => Object.values(props.profiles).slice(0, 4));
</script>

<template>
  <div class="machine-card card" aria-label="Active Vehicle Machine Persona">
    <!-- Top Header: Vehicle Identity & Ignition Power -->
    <div class="machine-header">
      <div class="machine-title-group">
        <span class="machine-badge">DRIVE PERSONA · {{ profile.cylinders }} CYLINDER</span>
        <h2 class="machine-name">{{ profile.name }}</h2>
        <p class="machine-sub">
          {{ profile.induction ? profile.induction.toUpperCase() : 'NATURAL' }} INDUCTION ·
          REDLINE {{ profile.redlineRpm.toLocaleString() }} RPM · MAX {{ profile.topSpeedKph }} KM/H
        </p>
      </div>

      <button
        type="button"
        class="ignition-button"
        :class="{ 'ignition-on': audioEnabled }"
        :aria-pressed="audioEnabled"
        :aria-label="audioEnabled ? 'Stop Engine' : 'Start Ignition'"
        @click="emit('toggleEngine')"
      >
        <span class="ignition-dot"></span>
        <span>{{ audioEnabled ? "ENGINE ACTIVE" : "START IGNITION" }}</span>
      </button>
    </div>

    <!-- Middle Telemetry: Live Firing Frequency & Throttle/Brake Load Bars -->
    <div class="dynamics-grid">
      <!-- Acoustic Firing Stat -->
      <div class="dynamic-cell acoustic-cell">
        <div class="cell-label">
          <span class="freq-pulse" :class="{ 'freq-pulse--active': audioEnabled }"></span>
          <span>FIRING FREQ</span>
        </div>
        <strong class="cell-val">{{ audioEnabled ? `${firingFreq} HZ` : "STANDBY" }}</strong>
        <small class="cell-sub">Base {{ profile.baseTone }} Hz</small>
      </div>

      <!-- Throttle Force Meter -->
      <div class="dynamic-cell pedal-meter-cell">
        <div class="cell-label">
          <span>THROTTLE</span>
          <strong class="pedal-pct" :class="{ active: throttlePercent > 0 }">{{ throttlePercent }}%</strong>
        </div>
        <div class="meter-bar-wrap">
          <div class="meter-bar-fill throttle-fill" :style="{ width: `${throttlePercent}%` }"></div>
        </div>
        <small class="cell-sub">Pedal Force</small>
      </div>

      <!-- Brake Force Meter -->
      <div class="dynamic-cell pedal-meter-cell">
        <div class="cell-label">
          <span>BRAKE</span>
          <strong class="pedal-pct brake-pct" :class="{ active: brakePercent > 0 }">{{ brakePercent }}%</strong>
        </div>
        <div class="meter-bar-wrap">
          <div class="meter-bar-fill brake-fill" :style="{ width: `${brakePercent}%` }"></div>
        </div>
        <small class="cell-sub">Decel Force</small>
      </div>
    </div>

    <!-- Bottom: Quick Vehicle Preset Switcher -->
    <div class="profile-quick-bar" role="group" aria-label="Quick vehicle profiles">
      <span class="quick-bar-label">SELECT MACHINE:</span>
      <div class="quick-pill-group">
        <button
          v-for="p in quickProfiles"
          :key="p.id"
          type="button"
          class="quick-profile-pill"
          :class="{ 'quick-profile-pill--active': p.id === profile.id }"
          @click="emit('selectProfile', p.id)"
        >
          {{ p.name }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped src="./persona/vehiclePersonaCard.css"></style>
