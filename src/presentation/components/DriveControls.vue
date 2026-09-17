<script setup lang="ts">
import type { DriveAction } from "../../domain/vehicle/controls";
defineProps<{ accelerating: boolean; braking: boolean }>();
const emit = defineEmits<{ control: [action: DriveAction, active: boolean]; shift: [delta: number]; reset: [] }>();
function activate(event: PointerEvent, action: DriveAction): void {
  if (event.button !== 0) return;
  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  emit("control", action, true);
}
function keyboard(event: KeyboardEvent, action: DriveAction, active: boolean): void {
  if (event.code !== "Space" && event.code !== "Enter") return;
  event.preventDefault();
  event.stopPropagation();
  if (!event.repeat) emit("control", action, active);
}
</script>

<template>
  <section class="controls" aria-label="Driving controls">
    <button type="button" class="shift" aria-label="Upshift gear, keyboard 1" @click="emit('shift', 1)">
      <span>↑ Upshift</span><kbd>1</kbd>
    </button>
    <button
      type="button"
      class="pedal brake"
      :class="{ active: braking }"
      :aria-pressed="braking"
      aria-label="Brake, hold S"
      @pointerdown.prevent="activate($event, 'brake')"
      @pointerup="emit('control', 'brake', false)"
      @pointercancel="emit('control', 'brake', false)"
      @lostpointercapture="emit('control', 'brake', false)"
      @keydown="keyboard($event, 'brake', true)"
      @keyup="keyboard($event, 'brake', false)"
      @blur="emit('control', 'brake', false)"
    >
      <span>Brake</span><kbd>S</kbd>
    </button>
    <button
      type="button"
      class="pedal accelerate"
      :class="{ active: accelerating }"
      :aria-pressed="accelerating"
      aria-label="Accelerate, hold W"
      @pointerdown.prevent="activate($event, 'accelerate')"
      @pointerup="emit('control', 'accelerate', false)"
      @pointercancel="emit('control', 'accelerate', false)"
      @lostpointercapture="emit('control', 'accelerate', false)"
      @keydown="keyboard($event, 'accelerate', true)"
      @keyup="keyboard($event, 'accelerate', false)"
      @blur="emit('control', 'accelerate', false)"
    >
      <span>Accelerate</span><kbd>W</kbd>
    </button>
    <button type="button" class="shift downshift" aria-label="Downshift gear, keyboard 2" @click="emit('shift', -1)">
      <span>↓ Downshift</span><kbd>2</kbd>
    </button>
    <button type="button" class="reset" aria-label="Reset drive" @click="emit('reset')">↺ <span>Reset</span></button>
  </section>
</template>

<style scoped>
.controls {
  display: grid;
  grid-template-columns: 1fr 1fr 1.2fr 1fr auto;
  gap: 8px;
}
button {
  min-width: 0;
  min-height: 60px;
  padding: 12px;
  border: 1px solid #50594f;
  border-radius: 3px;
  background: #272e28;
  color: #e8ece1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 11px;
  touch-action: none;
  user-select: none;
}
kbd {
  border: 1px solid #657060;
  border-radius: 3px;
  min-width: 22px;
  padding: 4px;
  font: 10px var(--mono);
  text-align: center;
}
.accelerate {
  background: #dec18b;
  color: #292d24;
  border-color: #dec18b;
}
.accelerate kbd {
  border-color: #9d8458;
}
.brake {
  background: #373a31;
}
button:hover {
  border-color: #dfc28c;
}
button.active,
button:active {
  background: #e8d4ae;
  color: #20251f;
  transform: translateY(1px);
}
.reset {
  justify-content: center;
  background: transparent;
  color: #bdc5b9;
}
@media (max-width: 900px) {
  button {
    padding: 10px;
  }
  .reset span {
    display: none;
  }
}
@media (max-width: 700px) {
  .controls {
    grid-template-columns: 1fr 1fr 48px;
  }
  .brake {
    grid-column: 1;
    grid-row: 1;
  }
  .accelerate {
    grid-column: 2 / 4;
    grid-row: 1;
  }
  .shift {
    grid-column: 1;
    grid-row: 2;
  }
  .downshift {
    grid-column: 2;
  }
  .reset {
    grid-column: 3;
    grid-row: 2;
  }
  button {
    min-height: 52px;
  }
}
</style>
