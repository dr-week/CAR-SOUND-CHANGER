<script setup lang="ts">
import type { DriveAction } from "../../domain/vehicle/controls";

defineProps<{ accelerating: boolean; braking: boolean }>();
const emit = defineEmits<{ control: [action: DriveAction, active: boolean]; shift: [delta: number]; reset: [] }>();

function activate(event: PointerEvent, action: DriveAction): void {
  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  emit("control", action, true);
}

function release(action: DriveAction): void {
  emit("control", action, false);
}
</script>

<template>
  <section class="controls" aria-label="Driving controls">
    <button type="button" aria-label="Upshift, keyboard 1" @click="emit('shift', 1)">
      <span aria-hidden="true">↑</span><small>1 · upshift</small>
    </button>
    <button
      type="button"
      class="brake"
      :class="{ active: braking }"
      @pointerdown.prevent="activate($event, 'brake')"
      @pointerup="release('brake')"
      @pointercancel="release('brake')"
      @lostpointercapture="release('brake')"
    >
      <span>S</span><small>Brake</small>
    </button>
    <button
      type="button"
      class="accelerate"
      :class="{ active: accelerating }"
      @pointerdown.prevent="activate($event, 'accelerate')"
      @pointerup="release('accelerate')"
      @pointercancel="release('accelerate')"
      @lostpointercapture="release('accelerate')"
    >
      <span>W</span><small>Accelerate</small>
    </button>
    <button type="button" aria-label="Downshift, keyboard 2" @click="emit('shift', -1)">
      <span aria-hidden="true">↓</span><small>2 · downshift</small>
    </button>
    <button type="button" class="reset" @click="emit('reset')"><span>Reset</span><small>Drive</small></button>
  </section>
</template>
