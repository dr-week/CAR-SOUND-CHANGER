<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  brightness: number;
  uiScale: number;
  muteOnReverse: boolean;
}>();

const emit = defineEmits<{
  "update:brightness": [val: number];
  "update:uiScale": [val: number];
  "update:muteOnReverse": [val: boolean];
}>();

const scalePercent = computed(() => {
  return props.uiScale > 2 ? Math.round(props.uiScale) : Math.round(props.uiScale * 100);
});

function isScale(targetPercent: number): boolean {
  return Math.abs(scalePercent.value - targetPercent) < 6;
}
</script>

<template>
  <!-- 1. Display Brightness -->
  <section class="setting-card">
    <div class="setting-icon-badge mint"><svg><use href="#i-sun" /></svg></div>
    <div class="setting-content">
      <div class="setting-header-row">
        <h2>Display preference</h2>
        <span class="value-badge">{{ brightness }}%</span>
      </div>
      <input
        :value="brightness"
        type="range"
        min="10"
        max="100"
        aria-label="Display Brightness"
        class="setting-slider"
        @input="emit('update:brightness', Number(($event.target as HTMLInputElement).value))"
      />
    </div>
  </section>

  <!-- 2. UI Scale -->
  <section class="setting-card">
    <div class="setting-icon-badge cyan"><svg><use href="#i-grid" /></svg></div>
    <div class="setting-content">
      <div class="setting-header-row">
        <h2>Interface Scale</h2>
        <span class="value-badge">{{ scalePercent }}%</span>
      </div>
      <div class="segmented-pills" role="radiogroup" aria-label="Scale selection">
        <button
          type="button"
          class="segmented-pill"
          :class="{ active: isScale(85) }"
          @click="emit('update:uiScale', 85)"
        >
          85%
        </button>
        <button
          type="button"
          class="segmented-pill"
          :class="{ active: isScale(100) }"
          @click="emit('update:uiScale', 100)"
        >
          100%
        </button>
        <button
          type="button"
          class="segmented-pill"
          :class="{ active: isScale(125) }"
          @click="emit('update:uiScale', 125)"
        >
          125%
        </button>
      </div>
    </div>
  </section>

  <!-- 3. Mute on Reverse -->
  <section class="setting-card">
    <div class="setting-icon-badge amber"><svg><use href="#i-volume" /></svg></div>
    <div class="setting-content">
      <div class="setting-header-row">
        <h2>Reverse gear audio attenuation</h2>
        <button
          type="button"
          class="toggle-switch-btn"
          :class="{ active: muteOnReverse }"
          :aria-pressed="muteOnReverse"
          aria-label="Toggle reverse gear audio attenuation"
          @click="emit('update:muteOnReverse', !muteOnReverse)"
        >
          <span class="switch-knob" />
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped src="./settingsDisplay.css"></style>
