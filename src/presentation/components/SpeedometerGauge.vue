<script setup lang="ts">
/**
 * SpeedometerGauge
 *
 * Automotive-grade circular instrument cluster inspired by Mini Cooper center display.
 * Pure SVG rendering with 270-degree sweep, dynamic neon luminescence,
 * outer sports needle, and integrated digital cockpit hub.
 */
import { computed, ref, watch } from "vue";
import { describeArc, generateSpeedTicks } from "./speedometer/gaugeMath";
import SpeedometerCompassBezel from "./speedometer/SpeedometerCompassBezel.vue";
import SpeedometerDigitalHub from "./speedometer/SpeedometerDigitalHub.vue";
const props = withDefaults(defineProps<{
  speedKph: number;
  source: "GPS" | "Simulation";
  maxSpeedKph?: number;
  hideCenterDigital?: boolean;
  telemetryStatus?: string;
  readingAvailable?: boolean;
  headingDegrees?: number | null;
}>(), { readingAvailable: true, maxSpeedKph: 200, telemetryStatus: undefined, headingDegrees: null });
const hasReading = computed(() => props.readingAvailable !== false && Number.isFinite(props.speedKph) && props.speedKph >= 0);
const maxSpeed = computed(() => props.maxSpeedKph ?? 200);
const currentSpeed = computed(() => Math.max(0, Math.min(maxSpeed.value, props.speedKph)));
const hasHeading = computed(
  () => props.headingDegrees !== null && props.headingDegrees !== undefined && Number.isFinite(props.headingDegrees),
);
const compassRotation = ref(0);
const compassReady = ref(false);
watch(() => props.headingDegrees, (heading) => {
  if (heading == null || !Number.isFinite(heading)) {
    compassReady.value = false;
    return;
  }
  const target = -((heading % 360 + 360) % 360);
  if (!compassReady.value) compassRotation.value = target;
  else compassRotation.value += ((target - compassRotation.value) % 360 + 540) % 360 - 180;
  compassReady.value = true;
}, { immediate: true });
const cardinalDirections = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"] as const;
const cardinalHeading = computed(() => {
  if (!hasHeading.value || props.headingDegrees === null || props.headingDegrees === undefined) return "";
  const normalized = ((props.headingDegrees % 360) + 360) % 360;
  const index = Math.round(normalized / 45) % 8;
  return cardinalDirections[index];
});
const headingDisplay = computed(() => {
  if (!hasHeading.value || props.headingDegrees === null || props.headingDegrees === undefined) return "";
  const deg = Math.round(((props.headingDegrees % 360) + 360) % 360);
  return `${cardinalHeading.value} · ${deg.toString().padStart(3, "0")}°`;
});
/** 270-degree sweep: from -135deg (0 km/h) to +135deg (maxSpeed) */
const needleAngle = computed(() => {
  const fraction = currentSpeed.value / maxSpeed.value;
  return -135 + fraction * 270;
});
const bgTrackArc = computed(() => describeArc(150, 150, 118, -135, 135));
const activeSpeedArc = computed(() => {
  if (currentSpeed.value <= 0) return "";
  const endAngle = Math.min(135, needleAngle.value);
  if (endAngle <= -134) return "";
  return describeArc(150, 150, 118, -135, endAngle);
});
const ticks = computed(() => generateSpeedTicks(maxSpeed.value, currentSpeed.value, hasReading.value));
</script>
<template>
  <div class="speedo-gauge" role="img" :aria-label="hasReading ? `Current speed ${Math.round(currentSpeed)} km/h from ${source}` : `${source} speed unavailable`">
    <svg viewBox="0 0 300 300" class="speedo-svg">
      <defs>
        <radialGradient id="spDialFaceGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#18221b" />
          <stop offset="60%" stop-color="#101612" />
          <stop offset="100%" stop-color="#080b09" />
        </radialGradient>
        <radialGradient id="spHubGrad" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stop-color="#232e27" />
          <stop offset="55%" stop-color="#131915" />
          <stop offset="100%" stop-color="#090d0b" />
        </radialGradient>
        <linearGradient id="spActiveGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#22c55e" />
          <stop offset="45%" stop-color="#d9ff78" />
          <stop offset="80%" stop-color="#38bdf8" />
          <stop offset="100%" stop-color="#f59e0b" />
        </linearGradient>
        <filter id="spNeonGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <!-- 1. Outer Metallic Bezel Ring & Compass Orbit -->
      <circle cx="150" cy="150" r="146" fill="#080b09" stroke="rgba(255, 255, 255, 0.08)" stroke-width="2" />
      <circle cx="150" cy="150" r="142" fill="url(#spDialFaceGrad)" stroke="rgba(217, 255, 120, 0.08)" stroke-width="1.5" />
      <circle cx="150" cy="150" r="132" fill="none" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1" stroke-dasharray="2 4" />
      <SpeedometerCompassBezel
        :compass-rotation="compassRotation"
        :has-heading="hasHeading"
        :heading-degrees="headingDegrees"
      />
      <!-- 2. Inactive Speed Track -->
      <path :d="bgTrackArc" fill="none" stroke="#151d18" stroke-width="10" stroke-linecap="round" />
      <!-- 3. Dynamic Active Speed Arc -->
      <path
        v-if="hasReading && activeSpeedArc"
        :d="activeSpeedArc"
        fill="none"
        stroke="url(#spActiveGrad)"
        stroke-width="10"
        stroke-linecap="round"
        filter="url(#spNeonGlow)"
      />
      <!-- 4. Precision Ticks & Numbers -->
      <g class="speedo-ticks">
        <line
          v-for="tick in ticks"
          :key="'tick-' + tick.value + '-' + tick.x1"
          :x1="tick.x1"
          :y1="tick.y1"
          :x2="tick.x2"
          :y2="tick.y2"
          :stroke="tick.isActive ? '#d9ff78' : 'rgba(255, 255, 255, 0.22)'"
          :stroke-width="tick.isMajor ? 2.2 : 1.2"
          stroke-linecap="round"
          :filter="tick.isActive ? 'drop-shadow(0 0 4px rgba(217, 255, 120, 0.5))' : 'none'"
        />
        <text
          v-for="tick in ticks.filter(t => t.isMajor)"
          :key="'lbl-' + tick.value"
          :x="tick.lx"
          :y="tick.ly"
          :fill="tick.isActive ? '#ffffff' : '#64748b'"
          font-size="9"
          font-weight="800"
          font-family="var(--mono)"
          text-anchor="middle"
          dominant-baseline="central"
        >
          {{ tick.value }}
        </text>
      </g>
      <!-- 5. Sports Aerodynamic Needle -->
      <g v-if="hasReading" :transform="`rotate(${needleAngle} 150 150)`" class="needle-rotator">
        <polygon points="148,84 149.5,32 150,28 150.5,32 152,84" fill="#d9ff78" filter="url(#spNeonGlow)" />
        <circle cx="150" cy="32" r="3.5" fill="#ffffff" filter="drop-shadow(0 0 6px #d9ff78)" />
      </g>
      <!-- 6. Central Digital Instrument Hub -->
      <SpeedometerDigitalHub
        v-if="!hideCenterDigital"
        :has-reading="hasReading"
        :current-speed="currentSpeed"
        :has-heading="hasHeading"
        :heading-display="headingDisplay"
      />
    </svg>
  </div>
</template>
<style scoped src="./speedometer/speedometerGauge.css"></style>
