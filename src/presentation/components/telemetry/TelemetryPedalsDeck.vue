<script setup lang="ts">
import type { DriveAction } from "../../../domain/vehicle/controls";

defineProps<{
  accelerating: boolean;
  braking: boolean;
}>();

const emit = defineEmits<{
  control: [action: DriveAction, active: boolean];
  shift: [delta: number];
  reset: [];
}>();

function handlePointerPedal(event: PointerEvent, action: DriveAction, active: boolean) {
  if (event.button !== 0) return;
  if (active) {
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }
  emit("control", action, active);
}
</script>

<template>
  <div class="pedals-deck">
    <button
      class="pedal-btn brake-btn"
      :class="{ active: braking }"
      type="button"
      @pointerdown="handlePointerPedal($event, 'brake', true)"
      @pointerup="handlePointerPedal($event, 'brake', false)"
      @pointercancel="handlePointerPedal($event, 'brake', false)"
    >
      <span>BRAKE</span>
      <small>[S / ↓]</small>
    </button>
    <button
      class="pedal-btn accel-btn"
      :class="{ active: accelerating }"
      type="button"
      @pointerdown="handlePointerPedal($event, 'accelerate', true)"
      @pointerup="handlePointerPedal($event, 'accelerate', false)"
      @pointercancel="handlePointerPedal($event, 'accelerate', false)"
    >
      <span>THROTTLE</span>
      <small>[W / ↑]</small>
    </button>
    <div class="gear-shifters">
      <button class="shift-btn" type="button" aria-label="Shift down" @click="emit('shift', -1)">-</button>
      <button class="shift-btn" type="button" aria-label="Shift up" @click="emit('shift', 1)">+</button>
      <button class="reset-btn" type="button" aria-label="Reset simulation" @click="emit('reset')">⟲</button>
    </div>
  </div>
</template>
