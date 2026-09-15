<script setup lang="ts">
/**
 * VehicleTachometer
 *
 * Pure SVG engine RPM tachometer.
 * Features 3 dynamic colored RPM zones (Green eco / Amber power / Red redline),
 * metallic bezel, dynamic needle rotation (-125deg to +125deg), and digital RPM readout.
 *
 * Uses pure SVG rendering without any D3 or canvas layout reflows,
 * preventing height collapse inside flex/grid containers.
 */
import { computed } from "vue";
import type { VehicleProfile } from "../../domain/vehicle/types";

const props = defineProps<{
  rpm: number;
  profile: VehicleProfile;
}>();

/** Round redline up to nearest 1,000 for a clean max label */
const maxRpm = computed(() => Math.ceil(props.profile.redlineRpm / 1_000) * 1_000);
const currentRpm = computed(() => Math.max(0, Math.min(maxRpm.value, props.rpm)));

/** Calculate needle angle from -125deg (0 RPM) to +125deg (maxRpm) */
const needleAngle = computed(() => {
  const fraction = currentRpm.value / maxRpm.value;
  return -125 + fraction * 250;
});

/** Fraction positions for segment arc angles */
const shiftFrac = computed(() => Math.min(1, props.profile.shiftRpm / maxRpm.value));
const redlineStartFrac = computed(() => Math.min(1, (props.profile.redlineRpm - 1_000) / maxRpm.value));

/** Convert polar angle to SVG Cartesian coordinate on radius R */
function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.sin(angleInRadians),
    y: centerY - radius * Math.cos(angleInRadians),
  };
}

/** Generate an SVG arc path string */
function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return ["M", start.x, start.y, "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(" ");
}

/** Arc paths for green, amber, red zones */
const greenArc = computed(() => {
  const startA = -125;
  const endA = -125 + shiftFrac.value * 250;
  return describeArc(100, 90, 78, startA, endA);
});

const amberArc = computed(() => {
  const startA = -125 + shiftFrac.value * 250;
  const endA = -125 + redlineStartFrac.value * 250;
  return describeArc(100, 90, 78, startA, endA);
});

const redArc = computed(() => {
  const startA = -125 + redlineStartFrac.value * 250;
  const endA = 125;
  return describeArc(100, 90, 78, startA, endA);
});

/** Generate tick mark positions */
const ticks = computed(() => {
  const steps = 6;
  const result = [];
  for (let i = 0; i <= steps; i++) {
    const value = Math.round((maxRpm.value / steps) * i);
    const fraction = i / steps;
    const angleRad = ((-125 + fraction * 250) * Math.PI) / 180;
    const r1 = 62;
    const r2 = 72;
    const x1 = 100 + r1 * Math.sin(angleRad);
    const y1 = 90 - r1 * Math.cos(angleRad);
    const x2 = 100 + r2 * Math.sin(angleRad);
    const y2 = 90 - r2 * Math.cos(angleRad);

    const labelR = 50;
    const lx = 100 + labelR * Math.sin(angleRad);
    const ly = 90 - labelR * Math.cos(angleRad);

    const labelText = value >= 1000 ? `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k` : `${value}`;

    result.push({ value, labelText, x1, y1, x2, y2, lx, ly });
  }
  return result;
});
</script>

<template>
  <div class="tachometer" :aria-label="`Engine speed ${Math.round(currentRpm)} RPM`">
    <svg viewBox="0 0 200 135" class="tacho-svg">
      <!-- Outer metallic bezel -->
      <path
        d="M 22 90 A 78 78 0 1 1 178 90"
        fill="none"
        stroke="#1a202c"
        stroke-width="12"
        stroke-linecap="round"
      />

      <!-- Zone 1: Eco (Green) -->
      <path
        :d="greenArc"
        fill="none"
        stroke="#31a566"
        stroke-width="5"
        stroke-linecap="round"
        opacity="0.9"
      />

      <!-- Zone 2: Power Band (Amber) -->
      <path
        :d="amberArc"
        fill="none"
        stroke="#f7b955"
        stroke-width="5"
        stroke-linecap="round"
        opacity="0.9"
      />

      <!-- Zone 3: Redline (Red) -->
      <path
        :d="redArc"
        fill="none"
        stroke="#e73333"
        stroke-width="6"
        stroke-linecap="round"
        opacity="0.95"
      />

      <!-- Tick marks & numeric labels -->
      <g class="tacho-ticks">
        <line
          v-for="tick in ticks"
          :key="tick.value"
          :x1="tick.x1"
          :y1="tick.y1"
          :x2="tick.x2"
          :y2="tick.y2"
          stroke="#525d6e"
          stroke-width="2"
          stroke-linecap="round"
        />
        <text
          v-for="tick in ticks"
          :key="'lbl-' + tick.value"
          :x="tick.lx"
          :y="tick.ly"
          fill="#8d99ae"
          font-size="8"
          font-weight="700"
          text-anchor="middle"
          dominant-baseline="central"
        >
          {{ tick.labelText }}
        </text>
      </g>

      <!-- Center digital RPM readout -->
      <text x="100" y="78" fill="#f3f5f8" font-size="22" font-weight="900" text-anchor="middle">
        {{ Math.round(currentRpm).toLocaleString() }}
      </text>
      <text x="100" y="94" fill="#99a3b3" font-size="7" font-weight="700" letter-spacing="1" text-anchor="middle">
        RPM
      </text>

      <!-- Animated Needle -->
      <g transform="translate(100, 90)">
        <g :style="{ transform: `rotate(${needleAngle}deg)`, transition: 'transform 0.12s ease-out' }">
          <polygon points="-2.5,0 0,-70 2.5,0" fill="#ff4757" filter="drop-shadow(0 0 4px #ff4757)" />
          <circle cx="0" cy="0" r="7" fill="#141923" stroke="#ff4757" stroke-width="2.5" />
          <circle cx="0" cy="0" r="2.5" fill="#ffffff" />
        </g>
      </g>
    </svg>

    <p class="tacho-label" aria-hidden="true">
      {{ profile.name }} · shift @ {{ profile.shiftRpm.toLocaleString() }} RPM
    </p>
  </div>
</template>

<style scoped>
.tachometer {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.tacho-svg {
  display: block;
  width: 100%;
  height: auto;
  max-width: 220px;
  filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.5));
}

.tacho-label {
  margin-top: -6px;
  margin-bottom: 0;
  color: var(--muted);
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  text-align: center;
}
</style>
