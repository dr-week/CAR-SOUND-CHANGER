<script setup lang="ts">
import { computed } from "vue";
import type { VehicleProfile } from "../../../domain/vehicle/types";

const props = defineProps<{
  rpm: number;
  profile: VehicleProfile;
}>();

const isShiftRecommended = computed(() => {
  return props.profile.shiftRpm > 0 && props.rpm >= props.profile.shiftRpm;
});

const isRedline = computed(() => {
  return props.rpm >= props.profile.redlineRpm;
});

// Tachometer Arc Math: 180-degree sweep (-90 to +90 degrees)
const maxRpm = computed(() => Math.max(8000, props.profile.redlineRpm + 1000));
const rpmFraction = computed(() => Math.min(1, Math.max(0, props.rpm / maxRpm.value)));
const redlineFraction = computed(() => Math.min(1, Math.max(0, props.profile.redlineRpm / maxRpm.value)));

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180.0;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

const backgroundArc = computed(() => describeArc(100, 100, 76, -110, 110));
const currentRpmArc = computed(() => {
  const endAngle = -110 + rpmFraction.value * 220;
  return describeArc(100, 100, 76, -110, endAngle);
});
const redlineArc = computed(() => {
  const startAngle = -110 + redlineFraction.value * 220;
  return describeArc(100, 100, 76, startAngle, 110);
});
</script>

<template>
  <div class="hud-module tacho-module">
    <svg class="tacho-svg" viewBox="0 0 200 120">
      <!-- Background track -->
      <path :d="backgroundArc" fill="none" stroke="rgba(255, 255, 255, 0.08)" stroke-width="8" stroke-linecap="round" />
      <!-- Redline zone -->
      <path :d="redlineArc" fill="none" stroke="rgba(255, 100, 80, 0.35)" stroke-width="8" stroke-linecap="round" />
      <!-- Active RPM sweep -->
      <path
        :d="currentRpmArc"
        fill="none"
        :stroke="isRedline ? 'var(--red)' : isShiftRecommended ? 'var(--amber)' : 'var(--acid)'"
        stroke-width="8"
        stroke-linecap="round"
        class="rpm-active-arc"
      />
    </svg>
    <div class="tacho-center">
      <span class="rpm-number" :class="{ 'rpm-alert': isShiftRecommended || isRedline }">
        {{ Math.round(rpm) }}
      </span>
      <span class="profile-tag">{{ profile.name }}</span>
    </div>
  </div>
</template>
