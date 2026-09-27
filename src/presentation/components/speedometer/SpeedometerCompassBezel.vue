<script setup lang="ts">
import { computed } from "vue";
import { polarToCartesian } from "./gaugeMath";

const props = defineProps<{
  compassRotation: number;
  hasHeading: boolean;
  headingDegrees?: number | null;
}>();

const compassTicks = computed(() => {
  const angles = [0, 45, 90, 135, 180, 225, 270, 315];
  return angles.map((deg) => polarToCartesian(150, 150, 132, deg));
});
</script>

<template>
  <g class="compass-orbit" :style="{ transform: `rotate(${compassRotation}deg)` }" aria-hidden="true">
    <g class="compass-orbit-ticks">
      <circle
        v-for="(pt, idx) in compassTicks"
        :key="'cpt-' + idx"
        :cx="pt.x"
        :cy="pt.y"
        :r="idx % 2 === 0 ? 2.3 : 1.3"
        :fill="idx % 2 === 0 ? '#f1efe8' : '#7b8780'"
        stroke="none"
      />
    </g>

    <!-- Revolving True North Beacon ("The Red Dot") -->
    <g v-if="hasHeading && headingDegrees !== null && headingDegrees !== undefined" class="compass-beacon-rotator">
      <circle cx="150" cy="18" r="5" fill="#ff8585" stroke="none" filter="url(#spNeonGlow)" />
      <circle cx="150" cy="18" r="2" fill="#ffe4e4" stroke="none" />
      <text
        x="150"
        y="9"
        fill="#ffaaaa"
        font-size="7"
        font-weight="900"
        font-family="var(--mono)"
        text-anchor="middle"
        dominant-baseline="central"
      >
        N
      </text>
    </g>
  </g>
</template>
