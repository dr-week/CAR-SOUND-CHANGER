<script setup lang="ts">
/**
 * VehicleTachometer
 *
 * Renders a full-colour RPM tachometer using vue-speedometer v3.
 * Zones:
 *   0 – shiftRpm          → green  (cruise / eco)
 *   shiftRpm – redline-1k → amber  (power band)
 *   redline-1k – redline  → red    (danger / redline)
 */
import { computed } from "vue";
import VueSpeedometer from "vue-speedometer";
import type { VehicleProfile } from "../../domain/vehicle/types";

const props = defineProps<{
  rpm: number;
  profile: VehicleProfile;
}>();

/** Round redline up to the nearest 1 000 for a clean max label */
const maxRpm = computed(() => Math.ceil(props.profile.redlineRpm / 1_000) * 1_000);

/**
 * Three-zone colour stops:
 *   Segment 0: idle → shiftRpm         (green)
 *   Segment 1: shiftRpm → redline-1k   (amber)
 *   Segment 2: redline-1k → maxRpm     (red)
 */
const segmentStops = computed(() => [
  0,
  props.profile.shiftRpm,
  props.profile.redlineRpm - 1_000,
  maxRpm.value,
]);

const currentValueText = computed(
  () => `${Math.round(props.rpm).toLocaleString()} RPM`,
);
</script>

<template>
  <section class="tachometer" :aria-label="`Engine speed ${Math.round(rpm)} RPM`">
    <VueSpeedometer
      :fluid-width="true"
      :value="rpm"
      :min-value="0"
      :max-value="maxRpm"
      :segments="3"
      :custom-segment-stops="segmentStops"
      :segment-colors="['#31a566', '#f7b955', '#e73333']"
      needle-color="#ffffff"
      :ring-width="28"
      :needle-height-ratio="0.82"
      :needle-transition-duration="120"
      needle-transition="easeQuadOut"
      text-color="#c4cbd6"
      :current-value-text="currentValueText"
      value-text-font-size="15px"
      value-text-font-weight="700"
      label-font-size="11px"
      :padding-horizontal="8"
      :padding-vertical="6"
      :force-render="true"
    />
    <p class="tacho-label" aria-hidden="true">
      {{ profile.name }} · shift at {{ profile.shiftRpm.toLocaleString() }} RPM
    </p>
  </section>
</template>

<style scoped>
.tachometer {
  width: 100%;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  filter: drop-shadow(0 10px 24px rgba(0, 0, 0, 0.55));
}

/* vue-speedometer renders an <svg> inside a wrapping div — let it fill */
.tachometer :deep(> div) {
  width: 100% !important;
}

.tacho-label {
  margin: 0;
  color: var(--muted);
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  text-align: center;
}
</style>
