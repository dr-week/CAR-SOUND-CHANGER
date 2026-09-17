<script setup lang="ts">
/**
 * GearDisplay
 *
 * Center cockpit display showing the current engaged gear,
 * featuring a race-car style SHIFT UP warning light when RPM passes shiftRpm.
 */
import { computed } from "vue";

const props = defineProps<{
  gear: number;
  rpm?: number;
  shiftRpm?: number;
}>();

const isShiftTime = computed(() => {
  if (props.rpm === undefined || props.shiftRpm === undefined) return false;
  return props.rpm >= props.shiftRpm;
});
</script>

<template>
  <section class="gear-card" aria-label="Current gear and shift status">
    <div class="gear-badge-container">
      <span class="gear-title">GEAR</span>
      <strong class="gear-number">{{ gear }}</strong>
    </div>

    <!-- Race cockpit Shift Light Indicator -->
    <div
      class="shift-light"
      :class="{ 'shift-light--active': isShiftTime }"
      aria-label="Shift indicator"
    >
      <svg class="shift-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 19V5M5 12l7-7 7 7"/>
      </svg>
      <span>SHIFT</span>
    </div>
  </section>
</template>

<style scoped>
.gear-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 14px;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: rgba(9, 11, 15, 0.95);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
  min-width: 90px;
}

.gear-badge-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.gear-title {
  color: var(--muted);
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.gear-number {
  color: var(--accent);
  font-size: 2.4rem;
  font-weight: 900;
  line-height: 1;
  text-shadow: 0 0 12px var(--accent-glow);
}

.shift-light {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.03);
  color: var(--muted);
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  opacity: 0.4;
  transition: all 0.15s ease;
}

.shift-icon {
  width: 10px;
  height: 10px;
}

.shift-light--active {
  opacity: 1;
  background: rgba(231, 191, 118, 0.25);
  border-color: var(--amber);
  color: var(--amber);
  box-shadow: 0 0 12px var(--amber-glow);
  animation: shift-flash 0.5s ease-in-out infinite alternate;
}

@keyframes shift-flash {
  from { filter: brightness(1); }
  to   { filter: brightness(1.4); }
}
</style>
