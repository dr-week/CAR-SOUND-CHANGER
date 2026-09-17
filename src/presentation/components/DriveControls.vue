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
    <button type="button" class="shift downshift shift-btn" aria-label="Downshift gear, keyboard 2" @click="emit('shift', -1)">
      <span>↓ Downshift</span><kbd>2</kbd>
    </button>
    <button
      type="button"
      class="pedal brake drive-btn--brake"
      :class="{ active: braking, 'drive-btn--active': braking }"
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
      class="pedal accelerate drive-btn--gas"
      :class="{ active: accelerating, 'drive-btn--active': accelerating }"
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
    <button type="button" class="shift upshift shift-btn" aria-label="Upshift gear, keyboard 1" @click="emit('shift', 1)">
      <span>↑ Upshift</span><kbd>1</kbd>
    </button>
    <button type="button" class="reset reset-btn" aria-label="Reset drive" @click="emit('reset')">↺ <span>Reset</span></button>
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
  min-height: 64px;
  padding: 10px 14px;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.035);
  color: var(--ink);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font: 700 11px var(--mono);
  touch-action: none;
  user-select: none;
  transition: all 0.15s ease;
}
kbd {
  border: 1px solid var(--line);
  border-radius: 6px;
  min-width: 22px;
  padding: 3px 6px;
  font: 10px var(--mono);
  text-align: center;
  background: rgba(0, 0, 0, 0.35);
  color: var(--muted);
}
.accelerate {
  background: rgba(217, 255, 120, 0.08);
  color: var(--acid);
  border-color: rgba(217, 255, 120, 0.25);
}
.accelerate kbd {
  border-color: rgba(217, 255, 120, 0.3);
  color: var(--acid);
}
.accelerate.active,
.accelerate:active {
  background: var(--acid) !important;
  color: #10140e !important;
  box-shadow: 0 0 20px var(--acid-glow);
  transform: translateY(1px);
}
.brake {
  background: rgba(255, 69, 58, 0.08);
  color: var(--red);
  border-color: rgba(255, 69, 58, 0.25);
}
.brake kbd {
  border-color: rgba(255, 69, 58, 0.3);
  color: var(--red);
}
.brake.active,
.brake:active {
  background: var(--red) !important;
  color: #ffffff !important;
  box-shadow: 0 0 20px rgba(255, 69, 58, 0.4);
  transform: translateY(1px);
}
button:hover {
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.06);
}
.reset {
  justify-content: center;
  background: transparent;
  color: var(--muted);
}
.reset:hover {
  color: var(--ink);
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
    min-height: 64px;
  }
}
</style>
