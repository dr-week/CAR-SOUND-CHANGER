<script setup lang="ts">
const emit = defineEmits<{ swipe: [direction: -1 | 1] }>();
let start: { x: number; y: number; id: number } | null = null;

function begin(event: PointerEvent) {
  // Native maps, sliders and buttons own their gestures; never steal their input.
  if ((event.target as Element).closest('button, input, a, [role="slider"], [data-no-swipe]')) return;
  if (!event.isPrimary || event.button !== 0) return;
  start = { x: event.clientX, y: event.clientY, id: event.pointerId };
}
function finish(event: PointerEvent) {
  if (!start || start.id !== event.pointerId) return;
  const dx = event.clientX - start.x;
  const dy = event.clientY - start.y;
  start = null;
  // Deliberate horizontal travel prevents bumps and vertical scrolling changing widgets.
  if (Math.abs(dx) >= 64 && Math.abs(dx) > Math.abs(dy) * 1.5) emit("swipe", dx < 0 ? 1 : -1);
}
</script>

<template>
  <section class="swipe-surface" @pointerdown="begin" @pointerup="finish" @pointercancel="start = null">
    <slot />
  </section>
</template>

<style scoped>
.swipe-surface {
  touch-action: pan-y;
}
</style>
