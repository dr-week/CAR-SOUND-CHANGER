<script setup lang="ts">
/**
 * SpeedometerGauge
 *
 * Artistic pure SVG speedometer gauge.
 * Max speed defaults to 180 km/h.
 * Features 3 colored speed zones (Blue / Green / Amber), metallic bezel,
 * dynamic needle rotation (-125deg to +125deg), and digital speed readout.
 *
 * Uses pure SVG rendering without any D3 or DOM layout reflows,
 * guaranteeing zero scroll shifts and smooth 60fps performance.
 */
import { computed } from "vue";

const props = defineProps<{
  speedKph: number;
  source: "GPS" | "Simulation";
  maxSpeedKph?: number;
}>();

const maxSpeed = computed(() => props.maxSpeedKph ?? 180);
const currentSpeed = computed(() => Math.max(0, Math.min(maxSpeed.value, props.speedKph)));

/** Calculate needle angle from -125deg (0 km/h) to +125deg (maxSpeed) */
const needleAngle = computed(() => {
  const fraction = currentSpeed.value / maxSpeed.value;
  return -125 + fraction * 250;
});

const sourceColour = computed(() =>
  props.source === "GPS" ? "var(--green)" : "var(--muted)",
);

/** Generate tick mark positions */
const ticks = computed(() => {
  const steps = 6; // 0, 30, 60, 90, 120, 150, 180
  const result = [];
  for (let i = 0; i <= steps; i++) {
    const value = Math.round((maxSpeed.value / steps) * i);
    const fraction = i / steps;
    const angleRad = ((-125 + fraction * 250) * Math.PI) / 180;
    const r1 = 62;
    const r2 = 72;
    const x1 = 100 + r1 * Math.sin(angleRad);
    const y1 = 90 - r1 * Math.cos(angleRad);
    const x2 = 100 + r2 * Math.sin(angleRad);
    const y2 = 90 - r2 * Math.cos(angleRad);

    const labelR = 52;
    const lx = 100 + labelR * Math.sin(angleRad);
    const ly = 90 - labelR * Math.cos(angleRad);

    result.push({ value, x1, y1, x2, y2, lx, ly });
  }
  return result;
});
</script>

<template>
  <div class="speedo-gauge" :aria-label="`Current speed ${Math.round(currentSpeed)} km/h from ${source}`">
    <svg viewBox="0 0 200 135" class="speedo-svg">
      <!-- Outer metallic bezel -->
      <path
        d="M 22 90 A 78 78 0 1 1 178 90"
        fill="none"
        stroke="#1a202c"
        stroke-width="12"
        stroke-linecap="round"
      />

      <!-- Zone 1: City 0-60 (Blue) -->
      <path
        d="M 22 90 A 78 78 0 0 1 54 36"
        fill="none"
        stroke="#3b82f6"
        stroke-width="5"
        stroke-linecap="round"
        opacity="0.85"
      />

      <!-- Zone 2: Cruising 60-120 (Green) -->
      <path
        d="M 54 36 A 78 78 0 0 1 146 36"
        fill="none"
        stroke="#31a566"
        stroke-width="5"
        stroke-linecap="round"
        opacity="0.85"
      />

      <!-- Zone 3: Fast 120-180 (Amber/Red) -->
      <path
        d="M 146 36 A 78 78 0 0 1 178 90"
        fill="none"
        stroke="#f7b955"
        stroke-width="5"
        stroke-linecap="round"
        opacity="0.85"
      />

      <!-- Tick marks & numeric labels -->
      <g class="speedo-ticks">
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
          {{ tick.value }}
        </text>
      </g>

      <!-- Center digital speed display -->
      <text x="100" y="80" fill="#f3f5f8" font-size="24" font-weight="900" text-anchor="middle">
        {{ Math.round(currentSpeed) }}
      </text>
      <text x="100" y="94" fill="#99a3b3" font-size="7" font-weight="700" letter-spacing="1" text-anchor="middle">
        KM/H
      </text>

      <!-- Animated Needle -->
      <g transform="translate(100, 90)">
        <g :style="{ transform: `rotate(${needleAngle}deg)`, transition: 'transform 0.12s ease-out' }">
          <polygon points="-2.5,0 0,-70 2.5,0" fill="#00f2fe" filter="drop-shadow(0 0 4px #00f2fe)" />
          <circle cx="0" cy="0" r="7" fill="#141923" stroke="#00f2fe" stroke-width="2.5" />
          <circle cx="0" cy="0" r="2.5" fill="#ffffff" />
        </g>
      </g>
    </svg>

    <!-- Speed source telemetry badge -->
    <div class="speedo-telemetry" :style="{ color: sourceColour }">
      <svg class="speedo-telemetry__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 2v3m0 14v3M2 12h3m14 0h3"/>
      </svg>
      <span>{{ source }} Telemetry</span>
    </div>
  </div>
</template>

<style scoped>
.speedo-gauge {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.speedo-svg {
  display: block;
  width: 100%;
  height: auto;
  max-width: 220px;
  filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.5));
}

.speedo-telemetry {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: -6px;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  transition: color 0.3s;
}

.speedo-telemetry__icon {
  width: 11px;
  height: 11px;
}
</style>
