<script setup lang="ts">
defineProps<{ gear: number }>();
</script>

<template>
  <section class="gear-display" aria-label="Current gear">
    <span>Gear</span><strong>{{ gear }}</strong>
  </section>
</template>
