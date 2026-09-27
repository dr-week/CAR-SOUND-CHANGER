<script setup lang="ts">
import { ref } from "vue";
const props = defineProps<{ volume: number }>();
const emit = defineEmits<{ volume: [value: number] }>();
const restoreVolume = ref(50);

// The parent owns volume; retain the last audible preference for mute/restore.
function toggleMute() {
  if (props.volume > 0) restoreVolume.value = props.volume;
  emit("volume", props.volume > 0 ? 0 : restoreVolume.value);
}
</script>

<template>
  <div class="home-shortcuts">
    <div class="volume-capsule" role="group" aria-label="Volume controls">
      <button type="button" :aria-label="volume === 0 ? 'Restore volume' : 'Mute volume'" :aria-pressed="volume === 0" @click="toggleMute">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M11 5 6 9H3v6h3l5 4Z" />
          <path v-if="volume === 0" d="m16 9 5 6m0-6-5 6" />
          <path v-else d="M15 8q5 4 0 8" />
        </svg>
      </button>
      <button type="button" aria-label="Decrease volume" :disabled="volume <= 0" @click="emit('volume', Math.max(0, volume - 5))">−</button>
      <output aria-label="Volume level">{{ volume }}%</output>
      <button type="button" aria-label="Increase volume" :disabled="volume >= 100" @click="emit('volume', Math.min(100, volume + 5))">+</button>
    </div>
  </div>
</template>

<style scoped>
.home-shortcuts {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.volume-capsule {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
}

button {
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  color: #edf1ec;
  font-size: 26px;
  cursor: pointer;
  touch-action: manipulation;
  transition: background 0.12s ease, transform 0.1s ease;
}

button svg {
  width: 22px;
  height: 22px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
}

button:active:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(0.94);
}

button:disabled {
  opacity: 0.35;
  cursor: default;
}

button[aria-pressed="true"] {
  background: rgba(217, 255, 120, 0.14);
  border-color: rgba(217, 255, 120, 0.5);
  color: var(--acid);
}

output {
  min-width: 48px;
  flex-shrink: 0;
  text-align: center;
  font: 700 calc(15px * var(--ui-scale)) var(--mono);
  font-variant-numeric: tabular-nums;
  color: #edf1ec;
}
</style>
