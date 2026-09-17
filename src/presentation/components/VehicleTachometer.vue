<script setup lang="ts">
import { computed } from "vue";
import type { VehicleProfile } from "../../domain/vehicle/types";
const props = defineProps<{ rpm: number; profile: VehicleProfile }>();
// Leave visible headroom so an exact-thousand redline still has a red zone.
const maxRpm = computed(() => (Math.floor(props.profile.redlineRpm / 1000) + 1) * 1000);
const ticks = computed(() => Array.from({ length: maxRpm.value / 250 + 1 }, (_, i) => i));
const angle = (rpm: number) => -130 + Math.max(0, Math.min(1, rpm / maxRpm.value)) * 260;
const needleAngle = computed(() => angle(Number.isFinite(props.rpm) ? props.rpm : 0));
function point(degrees: number, radius: number) {
  const a = (degrees * Math.PI) / 180;
  return { x: 180 + radius * Math.sin(a), y: 160 - radius * Math.cos(a) };
}
const redline = computed(() => {
  const start = point(angle(props.profile.redlineRpm), 134);
  const end = point(130, 134);
  return `M ${start.x} ${start.y} A 134 134 0 0 1 ${end.x} ${end.y}`;
});
</script>

<template>
  <svg class="tachometer" viewBox="0 0 360 310" role="img" :aria-label="`Engine speed ${Math.round(rpm)} RPM`">
    <circle cx="180" cy="160" r="144" fill="none" stroke="rgba(241, 239, 232, 0.12)" stroke-width=".6" />
    <path :d="redline" fill="none" stroke="var(--amber)" stroke-width="4" />
    <g v-for="tick in ticks" :key="tick">
      <line
        :x1="point(angle(tick * 250), 126).x"
        :y1="point(angle(tick * 250), 126).y"
        :x2="point(angle(tick * 250), tick % 4 === 0 ? 111 : 120).x"
        :y2="point(angle(tick * 250), tick % 4 === 0 ? 111 : 120).y"
        :stroke="tick * 250 >= profile.redlineRpm ? 'var(--amber)' : 'rgba(241, 239, 232, 0.4)'"
        :stroke-width="tick % 4 === 0 ? 1.8 : 1"
      />
      <text
        v-if="tick % 4 === 0"
        :x="point(angle(tick * 250), 94).x"
        :y="point(angle(tick * 250), 94).y"
        class="tick-label"
      >
        {{ tick / 4 }}
      </text>
    </g>
    <g :transform="`rotate(${needleAngle} 180 160)`">
      <path d="M 178 174 L 180 44 L 182 174 Z" fill="var(--acid)" filter="drop-shadow(0 0 6px var(--acid-glow))" />
    </g>
    <circle cx="180" cy="160" r="8" fill="#151a17" stroke="var(--acid)" stroke-width="2" />
    <text x="180" y="226" class="rpm-value">{{ Math.round(rpm).toLocaleString() }}</text>
    <text x="180" y="246" class="rpm-caption">REVOLUTIONS / MIN</text>
  </svg>
</template>

<style scoped>
.tachometer {
  width: 100%;
  max-height: 310px;
  display: block;
  margin: 4px auto 0;
  overflow: visible;
}
.tick-label {
  fill: #cdd2c9;
  font: 12px var(--mono);
  text-anchor: middle;
  dominant-baseline: middle;
}
.rpm-value {
  fill: #edece5;
  font: 30px var(--mono);
  text-anchor: middle;
}
.rpm-caption {
  fill: #aab3ab;
  font: 8px var(--mono);
  letter-spacing: 1.5px;
  text-anchor: middle;
}
@media (max-width: 700px) {
  .tachometer {
    max-height: 250px;
  }
}
</style>
