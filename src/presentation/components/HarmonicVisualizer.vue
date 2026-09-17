<script setup lang="ts">
import { computed } from "vue";
import type { VehicleProfile } from "../../domain/vehicle/types";

const props = defineProps<{
  rpm: number;
  profile: VehicleProfile;
  audioEnabled: boolean;
}>();

// Firing frequency in Hz: (RPM * cylinders) / 120 for a 4-stroke engine
const firingFreq = computed(() => Math.round((props.rpm * props.profile.cylinders) / 120));

// Generate 24 dynamic frequency bar heights reacting to harmonics
const harmonics = computed(() => {
  if (!props.audioEnabled) {
    return Array.from({ length: 20 }, (_, i) => ({
      height: 4 + Math.sin(i * 0.4) * 2,
      active: false,
    }));
  }

  const baseRatio = Math.min(1, Math.max(0.1, props.rpm / props.profile.redlineRpm));
  return Array.from({ length: 20 }, (_, i) => {
    const harmonicWeight = 1 / (1 + (i % 4) * 0.25);
    const wave = Math.sin(Date.now() * 0.005 * (i + 1) + i * 0.5);
    const height = Math.min(48, Math.max(6, 48 * baseRatio * harmonicWeight + wave * 6));
    const active = height > 22;
    return { height, active };
  });
});
</script>

<template>
  <div class="harmonic-visualizer" aria-label="Acoustic harmonic spectrum">
    <div class="spec-header">
      <div class="freq-tag">
        <span class="pulse-dot" :class="{ 'pulse-active': audioEnabled }"></span>
        <span>FIRING FREQ</span>
        <strong>{{ audioEnabled ? `${firingFreq} HZ` : "IDLE" }}</strong>
      </div>
      <div class="tone-tag">
        <span>BASE TONE</span>
        <strong>{{ profile.baseTone }} HZ</strong>
      </div>
      <div class="cyl-tag">
        <span>INDUCTION</span>
        <strong>{{ profile.induction ? profile.induction.toUpperCase() : "NATURAL" }}</strong>
      </div>
    </div>

    <!-- Acoustic Bar Spectrum -->
    <div class="spectrum-bars">
      <div
        v-for="(bar, idx) in harmonics"
        :key="idx"
        class="spec-bar-wrapper"
      >
        <div
          class="spec-bar"
          :class="{ 'spec-bar--active': bar.active, 'spec-bar--on': audioEnabled }"
          :style="{ height: `${bar.height}px` }"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.harmonic-visualizer {
  width: 100%;
  padding: 16px 20px;
  background: rgba(15, 19, 16, 0.85);
  border: 1px solid var(--line);
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  backdrop-filter: blur(14px);
}

.spec-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}

.freq-tag,
.tone-tag,
.cyl-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  font: 500 calc(9px * var(--ui-scale)) var(--mono);
  letter-spacing: 0.08em;
  color: var(--muted);
}

.freq-tag strong,
.tone-tag strong,
.cyl-tag strong {
  font-weight: 700;
  color: var(--acid);
}

.pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--muted);
}

.pulse-active {
  background: var(--acid);
  box-shadow: 0 0 8px var(--acid-glow);
  animation: pulse-glow 0.8s ease-in-out infinite alternate;
}

@keyframes pulse-glow {
  from { opacity: 0.5; transform: scale(0.9); }
  to   { opacity: 1; transform: scale(1.2); }
}

.spectrum-bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 52px;
  gap: 3px;
  padding: 2px 4px;
}

.spec-bar-wrapper {
  flex: 1;
  display: flex;
  align-items: flex-end;
  height: 100%;
}

.spec-bar {
  width: 100%;
  min-height: 4px;
  border-radius: 3px 3px 1px 1px;
  background: rgba(241, 239, 232, 0.12);
  transition: height 0.08s ease-out, background 0.15s ease;
}

.spec-bar--on {
  background: rgba(217, 255, 120, 0.4);
}

.spec-bar--active {
  background: var(--acid);
  box-shadow: 0 0 10px var(--acid-glow);
}
</style>
