<script setup lang="ts">
import type { DriveAction } from "../../domain/vehicle/controls";

defineProps<{ accelerating: boolean; braking: boolean }>();
const emit = defineEmits<{
  control: [action: DriveAction, active: boolean];
  shift: [delta: number];
  reset: [];
}>();

function activate(event: PointerEvent, action: DriveAction): void {
  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  emit("control", action, true);
}

function release(event: PointerEvent, action: DriveAction): void {
  (event.currentTarget as HTMLElement)?.blur();
  emit("control", action, false);
}

function handleShift(event: MouseEvent, delta: number): void {
  (event.currentTarget as HTMLElement)?.blur();
  emit("shift", delta);
}

function handleReset(event: MouseEvent): void {
  (event.currentTarget as HTMLElement)?.blur();
  emit("reset");
}
</script>

<template>
  <section class="controls" aria-label="Driving controls">
    <!-- Upshift button -->
    <button
      type="button"
      class="control-btn control-btn--shift"
      aria-label="Upshift gear, shortcut 1 or Q"
      @click="handleShift($event, 1)"
    >
      <svg class="control-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 19V5M5 12l7-7 7 7"/>
      </svg>
      <span class="control-label">Upshift</span>
      <small class="control-badge">1 · Q</small>
    </button>

    <!-- Brake pedal button -->
    <button
      type="button"
      class="control-btn brake"
      :class="{ active: braking }"
      aria-label="Brake, shortcut S or Down Arrow or Space"
      @pointerdown.prevent="activate($event, 'brake')"
      @pointerup="release($event, 'brake')"
      @pointercancel="release($event, 'brake')"
      @lostpointercapture="release($event, 'brake')"
    >
      <svg class="control-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="5" y="4" width="14" height="16" rx="3"/>
        <line x1="9" y1="8" x2="15" y2="8"/>
        <line x1="9" y1="12" x2="15" y2="12"/>
        <line x1="9" y1="16" x2="15" y2="16"/>
      </svg>
      <span class="control-label">Brake</span>
      <small class="control-badge">S · ▼</small>
    </button>

    <!-- Accelerate pedal button -->
    <button
      type="button"
      class="control-btn accelerate"
      :class="{ active: accelerating }"
      aria-label="Accelerate, shortcut W or Up Arrow"
      @pointerdown.prevent="activate($event, 'accelerate')"
      @pointerup="release($event, 'accelerate')"
      @pointercancel="release($event, 'accelerate')"
      @lostpointercapture="release($event, 'accelerate')"
    >
      <svg class="control-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
      <span class="control-label">Accelerate</span>
      <small class="control-badge">W · ▲</small>
    </button>

    <!-- Downshift button -->
    <button
      type="button"
      class="control-btn control-btn--shift"
      aria-label="Downshift gear, shortcut 2 or E"
      @click="handleShift($event, -1)"
    >
      <svg class="control-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 5v14M19 12l-7 7-7-7"/>
      </svg>
      <span class="control-label">Downshift</span>
      <small class="control-badge">2 · E</small>
    </button>

    <!-- Reset button -->
    <button
      type="button"
      class="control-btn reset"
      aria-label="Reset vehicle state"
      @click="handleReset($event)"
    >
      <svg class="control-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
        <path d="M3 3v5h5"/>
      </svg>
      <span class="control-label">Reset</span>
      <small class="control-badge">Drive</small>
    </button>
  </section>
</template>

<style scoped>
.controls {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  width: 100%;
}

.control-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 96px;
  padding: 10px 6px;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: linear-gradient(145deg, #1d2530, #141922);
  color: var(--text);
  font-weight: 800;
  cursor: pointer;
  touch-action: none;
  user-select: none;
  transition: all 0.15s ease;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
}

.control-icon {
  width: 22px;
  height: 22px;
}

.control-label {
  font-size: 0.82rem;
  font-weight: 800;
}

.control-badge {
  font-size: 0.64rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted);
}

.accelerate {
  background: linear-gradient(135deg, #1b5e39, #124026);
  border-color: #278853;
  box-shadow: 0 4px 16px rgba(39, 136, 83, 0.35);
}

.brake {
  background: linear-gradient(135deg, #8b2525, #5a1717);
  border-color: #be3535;
  box-shadow: 0 4px 16px rgba(190, 53, 53, 0.35);
}

.reset {
  background: linear-gradient(135deg, #2c3542, #1d232c);
  border-color: #3f4c5e;
}

.control-btn:hover {
  filter: brightness(1.15);
  transform: translateY(-1px);
}

.control-btn:active,
.control-btn.active {
  transform: translateY(2px);
  filter: brightness(1.3);
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.6);
}

.control-btn:focus-visible {
  outline: 3px solid #f7b955;
  outline-offset: 3px;
}

@media (max-width: 600px) {
  .controls {
    grid-template-columns: repeat(5, 1fr);
    gap: 6px;
  }
  .control-btn {
    min-height: 80px;
    padding: 6px 4px;
  }
  .control-icon {
    width: 18px;
    height: 18px;
  }
  .control-label {
    font-size: 0.7rem;
  }
  .control-badge {
    font-size: 0.52rem;
  }
}
</style>

