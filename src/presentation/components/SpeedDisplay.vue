<script setup lang="ts">
defineProps<{ speedKph: number; source: "GPS" | "Simulation" }>();
</script>

<template>
  <section class="speed-display" aria-label="Current speed">
    <span>Speed</span><strong>{{ Math.round(speedKph) }}</strong
    ><em>km/h</em><small>{{ source }}</small>
  </section>
</template>
