<script setup lang="ts">
/**
 * SpeedometerGauge
 *
 * Renders a half-circle speedometer using vue-speedometer v3.
 * Max speed is 180 km/h (Suzuki Brezza rated max).
 * Zones:
 *   0 – 60   → blue   (city)
 *   60 – 120 → green  (highway)
 *   120 – 180 → amber (fast)
 *
 * Falls back to a simple numeric label when the gauge would be too
 * small (< 120 px parent width via CSS container query).
 */
import { computed } from "vue";
import VueSpeedometer from "vue-speedometer";

const props = defineProps<{
  speedKph: number;
  source: "GPS" | "Simulation";
  /** Optional: override max speed for non-Brezza profiles */
  maxSpeedKph?: number;
}>();

const maxSpeed = computed(() => props.maxSpeedKph ?? 180);

const currentValueText = computed(
  () => `${Math.round(props.speedKph)} km/h`,
);

const sourceColour = computed(() =>
  props.source === "GPS" ? "#31a566" : "#c4cbd6",
);
</script>

<template>
  <section
    class="speedo"
    :aria-label="`Current speed ${Math.round(speedKph)} km/h from ${source}`"
  >
    <VueSpeedometer
      :fluid-width="true"
      :value="speedKph"
      :min-value="0"
      :max-value="maxSpeed"
      :segments="3"
      :custom-segment-stops="[0, 60, 120, maxSpeed]"
      :segment-colors="['#3b82f6', '#31a566', '#f7b955']"
      :needle-color="sourceColour"
      :ring-width="24"
      :needle-height-ratio="0.8"
      :needle-transition-duration="200"
      needle-transition="easeQuadOut"
      text-color="#c4cbd6"
      :current-value-text="currentValueText"
      value-text-font-size="14px"
      value-text-font-weight="700"
      label-font-size="10px"
      :padding-horizontal="6"
      :padding-vertical="4"
      :force-render="false"
    />

    <!-- Source badge below the gauge -->
    <p class="speedo-source" :style="{ color: sourceColour }" aria-hidden="true">
      ▶ {{ source }}
    </p>
  </section>
</template>

<style scoped>
.speedo {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.speedo :deep(> div) {
  width: 100% !important;
}

.speedo-source {
  margin: 0;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 700;
  transition: color 0.3s;
}
</style>
