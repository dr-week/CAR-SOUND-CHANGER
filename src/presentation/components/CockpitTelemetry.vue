<script setup lang="ts">
import { computed, ref } from "vue";
import type { TelemetryStatus } from "../../application/ports/TelemetryStatus";
import type { DriveAction } from "../../domain/vehicle/controls";
import type { VehicleProfile } from "../../domain/vehicle/types";
import TelemetryTachometer from "./telemetry/TelemetryTachometer.vue";
import TelemetryPedalsDeck from "./telemetry/TelemetryPedalsDeck.vue";

const props = defineProps<{
  rpm: number;
  gear: number;
  speedKph: number;
  profile: VehicleProfile;
  telemetryStatus: TelemetryStatus;
  greenScore: number;
  audioEnabled: boolean;
  accelerating: boolean;
  braking: boolean;
}>();

const emit = defineEmits<{
  control: [action: DriveAction, active: boolean];
  shift: [delta: number];
  reset: [];
}>();

const showPedals = ref(false);

const isShiftRecommended = computed(() => {
  return props.profile.shiftRpm > 0 && props.rpm >= props.profile.shiftRpm;
});

const scoreBadgeColor = computed(() => {
  if (props.greenScore >= 80) return "var(--acid)";
  if (props.greenScore >= 50) return "var(--amber)";
  return "var(--red)";
});
</script>

<template>
  <div class="cockpit-hud" aria-label="Cockpit telemetry HUD">
    <!-- Top instrument cluster ribbon -->
    <div class="hud-cluster">
      <!-- Speedometer Module -->
      <div class="hud-module speedo-module">
        <span class="hud-label">
          <svg class="icon-gps" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3m0 14v3M2 12h3m14 0h3" />
          </svg>
          {{ telemetryStatus === "active" ? "GPS" : "SIM" }} SPEED
        </span>
        <div class="speed-readout">
          <strong>{{ Math.round(speedKph) }}</strong>
          <small>KM/H</small>
        </div>
        <span class="top-speed-note">MAX {{ profile.topSpeedKph }}</span>
      </div>

      <!-- Tachometer Module -->
      <TelemetryTachometer :rpm="rpm" :profile="profile" />

      <!-- Gear Module -->
      <div class="hud-module gear-module">
        <span class="hud-label">GEAR</span>
        <div class="gear-badge" :class="{ 'shift-glow': isShiftRecommended }">
          <span class="gear-num">{{ gear === 0 ? "N" : gear === -1 ? "R" : gear }}</span>
          <span v-if="isShiftRecommended" class="shift-hint">SHIFT ▲</span>
        </div>
        <span class="gear-total">OF {{ profile.gears }}</span>
      </div>

      <!-- Eco Score / Diagnostics Module -->
      <div class="hud-module score-module">
        <span class="hud-label">ECO SCORE</span>
        <div class="score-pill" :style="{ borderColor: scoreBadgeColor, color: scoreBadgeColor }">
          <svg class="eco-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <strong>{{ Math.round(greenScore) }}</strong>
        </div>
        <button
          type="button"
          class="pedal-toggle"
          :class="{ active: showPedals }"
          :aria-pressed="showPedals"
          @click="showPedals = !showPedals"
        >
          {{ showPedals ? "HIDE PEDALS" : "SHOW PEDALS" }}
        </button>
      </div>
    </div>

    <!-- Virtual Pedals Deck (Expandable) -->
    <transition name="slide-pedals">
      <TelemetryPedalsDeck
        v-if="showPedals"
        :accelerating="accelerating"
        :braking="braking"
        @control="(action, active) => emit('control', action, active)"
        @shift="(delta) => emit('shift', delta)"
        @reset="emit('reset')"
      />
    </transition>
  </div>
</template>

<style scoped src="./telemetry/cockpitTelemetry.css"></style>
