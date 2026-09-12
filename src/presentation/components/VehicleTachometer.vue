<script setup lang="ts">
import { computed } from "vue";
import type { VehicleProfile } from "../../domain/vehicle/types";

const props = defineProps<{ rpm: number; profile: VehicleProfile }>();
const maxRpm = computed(() => Math.ceil(props.profile.redlineRpm / 1_000) * 1_000);
const normalizedRpm = computed(() => Math.min(1, Math.max(0, props.rpm / maxRpm.value)));
const needleAngle = computed(() => -135 + normalizedRpm.value * 270);
const tickValues = computed(() => Array.from({ length: maxRpm.value / 1_000 + 1 }, (_, value) => value));
const redlineStartAngle = computed(() => -135 + (props.profile.redlineRpm / maxRpm.value) * 270);

function point(angle: number, radius: number): { x: number; y: number } {
  const radians = ((angle - 90) * Math.PI) / 180;
  return { x: 120 + Math.cos(radians) * radius, y: 120 + Math.sin(radians) * radius };
}

function tickTransform(value: number): string {
  return `rotate(${-135 + (value / (maxRpm.value / 1_000)) * 270} 120 120)`;
}

function labelPosition(value: number): { x: number; y: number } {
  return point(-135 + (value / (maxRpm.value / 1_000)) * 270, 80);
}

function arcPath(startAngle: number, endAngle: number, radius: number): string {
  const start = point(startAngle, radius);
  const end = point(endAngle, radius);
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y}`;
}
</script>

<template>
  <section class="tachometer" aria-label="Engine tachometer">
    <svg viewBox="0 0 240 240" role="img" :aria-label="`Engine speed ${Math.round(rpm)} RPM of ${maxRpm} RPM`">
      <circle class="tachometer__outer" cx="120" cy="120" r="112" />
      <circle class="tachometer__face" cx="120" cy="120" r="101" />
      <path class="tachometer__redline" :d="arcPath(redlineStartAngle, 135, 101)" />
      <g v-for="value in tickValues" :key="value" :transform="tickTransform(value)">
        <line class="tachometer__tick" x1="120" y1="19" x2="120" y2="31" />
      </g>
      <text
        v-for="value in tickValues"
        :key="`label-${value}`"
        class="tachometer__label"
        :x="labelPosition(value).x"
        :y="labelPosition(value).y"
      >
        {{ value }}
      </text>
      <g :transform="`rotate(${needleAngle} 120 120)`">
        <line class="tachometer__needle" x1="120" y1="120" x2="120" y2="35" />
      </g>
      <circle class="tachometer__hub" cx="120" cy="120" r="13" />
      <text class="tachometer__rpm" x="120" y="174">{{ Math.round(rpm).toLocaleString() }}</text>
      <text class="tachometer__rpm-caption" x="120" y="190">RPM · DIAL ×1000</text>
    </svg>
  </section>
</template>
