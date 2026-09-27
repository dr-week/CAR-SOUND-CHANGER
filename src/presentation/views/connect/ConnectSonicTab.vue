<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
  (e: 'sonicPair'): void;
}>();

const isPulsing = ref(false);

function triggerChirp() {
  isPulsing.value = true;
  emit('sonicPair');
  setTimeout(() => {
    isPulsing.value = false;
  }, 3000);
}
</script>

<template>
  <section class="connect-card">
    <div class="connect-card-icon" :class="{ pulsing: isPulsing }">
      <svg><use href="#i-broadcast" /></svg>
    </div>
    <h2>Ultrasonic Acoustic Chirp</h2>
    <p>Transmits zero-hardware 19.5 kHz inaudible pulse to companion app</p>
    <button
      type="button"
      class="connect-action-btn"
      :disabled="isPulsing"
      @click="triggerChirp"
    >
      <svg width="18" height="18"><use href="#i-volume" /></svg>
      <span>{{ isPulsing ? 'Transmitting Chirp (19.5 kHz)...' : 'Emit Pairing Chirp' }}</span>
    </button>
  </section>
</template>
