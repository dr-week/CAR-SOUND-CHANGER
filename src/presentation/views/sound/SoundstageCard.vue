<script setup lang="ts">
/**
 * SoundstageCard
 *
 * Sculptural Acoustic Soundstage Blueprint displaying active speaker channels
 * (front, rear, all) with animated acoustic wave propagation.
 */
defineProps<{
  engineZone: string;
  audioEnabled?: boolean;
}>();

const emit = defineEmits<{
  "update:engineZone": [zone: string];
}>();

const zones = ["front", "rear", "all"] as const;
</script>

<template>
  <section class="soundstage-card card" aria-label="Acoustic soundstage blueprint">
    <div class="card-header">
      <p class="eyebrow">ACOUSTIC SOUNDSTAGE</p>
      <span class="zone-pill">{{ engineZone.toUpperCase() }}</span>
    </div>

    <div class="zone-picker" role="group" aria-label="Engine speaker zone">
      <button
        v-for="zone in zones"
        :key="zone"
        type="button"
        class="zone-btn"
        :class="{ active: engineZone === zone }"
        :aria-pressed="engineZone === zone"
        @click="emit('update:engineZone', zone)"
      >
        {{ zone }}
      </button>
    </div>

    <!-- Sculptural SVG Soundstage Map -->
    <div class="soundstage-canvas-wrap">
      <svg viewBox="0 0 220 130" class="soundstage-svg" aria-label="Acoustic speaker map">
        <!-- Car Silhouette -->
        <path
          d="M 55 24 C 75 20, 145 20, 165 24 C 180 30, 190 48, 190 65 C 190 82, 180 100, 165 106 C 145 110, 75 110, 55 106 C 40 100, 30 82, 30 65 C 30 48, 40 30, 55 24 Z"
          fill="rgba(255, 255, 255, 0.03)"
          stroke="rgba(241, 239, 232, 0.28)"
          stroke-width="1.6"
        />
        <!-- Cabin Glass / Interior -->
        <path
          d="M 72 36 C 92 32, 128 32, 148 36 C 158 42, 158 88, 148 94 C 128 98, 92 98, 72 94 C 62 88, 62 42, 72 36 Z"
          fill="rgba(21, 26, 23, 0.75)"
          stroke="rgba(241, 239, 232, 0.18)"
          stroke-width="1.2"
        />
        <line x1="110" y1="32" x2="110" y2="98" stroke="rgba(241, 239, 232, 0.15)" stroke-dasharray="3 3" />

        <!-- Front Acoustic Waves -->
        <g v-if="audioEnabled && (engineZone === 'front' || engineZone === 'all')" class="acoustic-wave front-waves">
          <ellipse cx="60" cy="65" rx="16" ry="24" fill="none" stroke="var(--acid)" stroke-width="1.2" opacity="0.6" />
          <ellipse cx="75" cy="65" rx="22" ry="28" fill="none" stroke="var(--acid)" stroke-width="0.8" opacity="0.4" />
        </g>

        <!-- Rear Acoustic Waves -->
        <g v-if="audioEnabled && (engineZone === 'rear' || engineZone === 'all')" class="acoustic-wave rear-waves">
          <ellipse cx="160" cy="65" rx="16" ry="24" fill="none" stroke="var(--acid)" stroke-width="1.2" opacity="0.6" />
          <ellipse cx="145" cy="65" rx="22" ry="28" fill="none" stroke="var(--acid)" stroke-width="0.8" opacity="0.4" />
        </g>

        <!-- 4 Channel Speaker Pods -->
        <!-- Front Left (Top-Left) -->
        <g class="speaker-pod" :class="{ 'speaker-active': engineZone === 'front' || engineZone === 'all' }">
          <circle cx="68" cy="38" r="7" fill="#1b221d" stroke="rgba(241,239,232,0.3)" stroke-width="1" />
          <circle cx="68" cy="38" r="3" fill="#667269" />
        </g>
        <!-- Front Right (Bottom-Left) -->
        <g class="speaker-pod" :class="{ 'speaker-active': engineZone === 'front' || engineZone === 'all' }">
          <circle cx="68" cy="92" r="7" fill="#1b221d" stroke="rgba(241,239,232,0.3)" stroke-width="1" />
          <circle cx="68" cy="92" r="3" fill="#667269" />
        </g>
        <!-- Rear Left (Top-Right) -->
        <g class="speaker-pod" :class="{ 'speaker-active': engineZone === 'rear' || engineZone === 'all' }">
          <circle cx="152" cy="38" r="7" fill="#1b221d" stroke="rgba(241,239,232,0.3)" stroke-width="1" />
          <circle cx="152" cy="38" r="3" fill="#667269" />
        </g>
        <!-- Rear Right (Bottom-Right) -->
        <g class="speaker-pod" :class="{ 'speaker-active': engineZone === 'rear' || engineZone === 'all' }">
          <circle cx="152" cy="92" r="7" fill="#1b221d" stroke="rgba(241,239,232,0.3)" stroke-width="1" />
          <circle cx="152" cy="92" r="3" fill="#667269" />
        </g>
      </svg>
    </div>
  </section>
</template>

<style scoped src="./soundstageCard.css"></style>
