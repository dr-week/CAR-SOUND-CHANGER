<script setup lang="ts">
defineProps<{ gear: number; speedKph: number }>();
</script>

<template>
  <section class="gear-display" aria-label="Current gear and speed">
    <span>Gear</span><strong>{{ gear }}</strong
    ><small>{{ Math.round(speedKph) }} km/h</small>
  </section>
</template>
