<script setup lang="ts">
/**
 * ClockWidget
 * Luxury automotive chronometer / timepiece widget inspired by Porsche Sport Chrono and Mini Cooper.
 */
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

const now = ref(new Date());
let timer: number | undefined;

onMounted(() => {
  timer = window.setInterval(() => {
    now.value = new Date();
  }, 1000);
});

onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
});

const hours = computed(() => now.value.getHours());
const minutes = computed(() => now.value.getMinutes());
const seconds = computed(() => now.value.getSeconds());

const hourAngle = computed(() => ((hours.value % 12) + minutes.value / 60) * 30);
const minuteAngle = computed(() => (minutes.value + seconds.value / 60) * 6);
const secondAngle = computed(() => seconds.value * 6);

const timeString = computed(() =>
  now.value.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false })
);

const dateString = computed(() =>
  now.value.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }).toUpperCase()
);

/** 12 hour tick marks */
const hourTicks = Array.from({ length: 12 }, (_, i) => {
  const angle = (i * 30 * Math.PI) / 180;
  return {
    x1: 150 + 106 * Math.sin(angle),
    y1: 150 - 106 * Math.cos(angle),
    x2: 150 + 118 * Math.sin(angle),
    y2: 150 - 118 * Math.cos(angle),
    isMajor: i % 3 === 0,
  };
});
</script>

<template>
  <div class="clock-widget" role="img" :aria-label="`Time ${timeString}, ${dateString}`">
    <svg viewBox="0 0 300 300" class="clock-svg">
      <defs>
        <radialGradient id="clockFaceGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#19241d" />
          <stop offset="65%" stop-color="#101713" />
          <stop offset="100%" stop-color="#090d0b" />
        </radialGradient>
        <radialGradient id="clockHubGrad" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stop-color="#243229" />
          <stop offset="60%" stop-color="#141c16" />
          <stop offset="100%" stop-color="#0a0e0c" />
        </radialGradient>
      </defs>

      <!-- Outer Bezel -->
      <circle cx="150" cy="150" r="144" fill="#090d0b" stroke="rgba(255,255,255,0.08)" stroke-width="2" />
      <circle cx="150" cy="150" r="140" fill="url(#clockFaceGrad)" stroke="rgba(217,255,120,0.08)" stroke-width="1.5" />
      <circle cx="150" cy="150" r="126" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1" />

      <!-- Hour Ticks -->
      <line
        v-for="(tick, idx) in hourTicks"
        :key="idx"
        :x1="tick.x1"
        :y1="tick.y1"
        :x2="tick.x2"
        :y2="tick.y2"
        :stroke="tick.isMajor ? '#d9ff78' : 'rgba(255,255,255,0.25)'"
        :stroke-width="tick.isMajor ? 2.5 : 1.5"
        stroke-linecap="round"
      />

      <!-- Analog Hands -->
      <!-- Hour Hand -->
      <g :transform="`rotate(${hourAngle} 150 150)`">
        <line x1="150" y1="150" x2="150" y2="82" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" />
      </g>
      <!-- Minute Hand -->
      <g :transform="`rotate(${minuteAngle} 150 150)`">
        <line x1="150" y1="150" x2="150" y2="54" stroke="#d9ff78" stroke-width="3" stroke-linecap="round" />
      </g>
      <!-- Second Hand -->
      <g :transform="`rotate(${secondAngle} 150 150)`">
        <line x1="150" y1="170" x2="150" y2="44" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round" />
        <circle cx="150" cy="150" r="3.5" fill="#f59e0b" />
      </g>

      <!-- Center Hub with Digital Time & Date -->
      <circle cx="150" cy="150" r="54" fill="url(#clockHubGrad)" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" />
      <text x="150" y="145" fill="#ffffff" font-size="24" font-weight="800" font-family="var(--mono)" text-anchor="middle" dominant-baseline="central">
        {{ timeString }}
      </text>
      <text x="150" y="165" fill="#8e9c8f" font-size="8.5" font-weight="700" font-family="var(--mono)" letter-spacing="1" text-anchor="middle">
        {{ dateString }}
      </text>
    </svg>
  </div>
</template>

<style scoped>
.clock-widget {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.clock-svg {
  display: block;
  width: 100%;
  height: auto;
  max-width: 310px;
  filter: drop-shadow(0 16px 36px rgba(0, 0, 0, 0.7));
}
</style>
