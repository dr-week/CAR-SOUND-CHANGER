<script setup lang="ts">
defineProps<{
  brightness: number;
  masterVolume: number;
}>();

const emit = defineEmits<{
  "update:brightness": [value: number];
  "update:masterVolume": [value: number];
  "close": [];
  "simulateCall": [];
  "simulateNotification": [];
}>();
</script>

<template>
  <aside class="quick-panel" role="region" aria-label="Quick Controls Drawer">
    <div class="quick-header">
      <p class="eyebrow">QUICK CONTROLS</p>
      <button class="quick-close" aria-label="Close" @click="emit('close')">✕</button>
    </div>

    <!-- Brightness with Tactile Steppers -->
    <div class="quick-control-group">
      <div class="quick-label-row">
        <svg aria-hidden="true"><use href="#i-sun" /></svg>
        <span>Brightness</span>
        <strong>{{ brightness }}%</strong>
      </div>
      <div class="stepper-row">
        <button
          type="button"
          class="stepper-btn"
          aria-label="Decrease brightness"
          @click="emit('update:brightness', Math.max(10, brightness - 5))"
        >
          −
        </button>
        <div class="slider-touch-area">
          <input
            :value="brightness"
            type="range"
            min="10"
            max="100"
            aria-label="Saved display brightness preference"
            @input="(e) => emit('update:brightness', Number((e.target as HTMLInputElement).value))"
          />
        </div>
        <button
          type="button"
          class="stepper-btn"
          aria-label="Increase brightness"
          @click="emit('update:brightness', Math.min(100, brightness + 5))"
        >
          +
        </button>
      </div>
    </div>

    <!-- Master Volume with Tactile Steppers -->
    <div class="quick-control-group">
      <div class="quick-label-row">
        <svg aria-hidden="true"><use href="#i-music" /></svg>
        <span>Master Volume</span>
        <strong>{{ masterVolume }}%</strong>
      </div>
      <div class="stepper-row">
        <button
          type="button"
          class="stepper-btn"
          aria-label="Decrease volume"
          @click="emit('update:masterVolume', Math.max(0, masterVolume - 5))"
        >
          −
        </button>
        <div class="slider-touch-area">
          <input
            :value="masterVolume"
            type="range"
            min="0"
            max="100"
            aria-label="Saved master volume preference"
            @input="(e) => emit('update:masterVolume', Number((e.target as HTMLInputElement).value))"
          />
        </div>
        <button
          type="button"
          class="stepper-btn"
          aria-label="Increase volume"
          @click="emit('update:masterVolume', Math.min(100, masterVolume + 5))"
        >
          +
        </button>
      </div>
    </div>

    <!-- Simulation Triggers for Development / In-Vehicle Testing -->
    <div class="quick-control-group">
      <div class="quick-label-row">
        <svg aria-hidden="true"><use href="#i-phone" /></svg>
        <span>Test Telemetry</span>
      </div>
      <div class="sim-actions-row">
        <button
          type="button"
          class="sim-action-btn"
          aria-label="Simulate incoming call"
          @click="emit('simulateCall')"
        >
          📞 Call
        </button>
        <button
          type="button"
          class="sim-action-btn"
          aria-label="Simulate WhatsApp notification"
          @click="emit('simulateNotification')"
        >
          💬 Alert
        </button>
      </div>
    </div>
  </aside>
</template>

<style scoped src="./controls/quickControlsDrawer.css"></style>
