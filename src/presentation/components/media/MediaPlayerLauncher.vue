<script setup lang="ts">
defineProps<{
  displayTitle: string;
  displayArtist: string;
  displayNumber: string;
  launcherEyebrow: string;
  playing: boolean;
}>();

const emit = defineEmits<{
  togglePlay: [];
  nextTrack: [];
  prevTrack: [];
}>();
</script>

<template>
  <section class="launcher-media card" aria-label="Master audio stage">
    <div class="launcher-media-stage">
      <!-- Vinyl Turntable Disc -->
      <div class="vinyl-hero-wrap">
        <div class="vinyl-disc" :class="{ 'vinyl-disc--spinning': playing }">
          <div class="vinyl-groove-outer"></div>
          <div class="vinyl-groove-inner"></div>
          <div class="vinyl-center-label">
            <span class="vinyl-num">NO. {{ displayNumber }}</span>
          </div>
        </div>
      </div>

      <!-- Track Information & Controls -->
      <div class="launcher-track-col">
        <div class="launcher-track-info">
          <span class="launcher-playback-eyebrow">{{ launcherEyebrow }}</span>
          <h2 class="launcher-track-title">{{ displayTitle }}</h2>
          <p class="launcher-track-artist">{{ displayArtist }}</p>
        </div>

        <div class="launcher-transport-row">
          <div class="launcher-controls">
            <button type="button" class="launcher-btn launcher-btn-prev" aria-label="Previous track" @click="emit('prevTrack')">
              <svg><use href="#i-prev-track" /></svg>
            </button>

            <button
              type="button"
              class="launcher-btn launcher-btn-play"
              :class="{ 'launcher-btn-play--active': playing }"
              :aria-label="playing ? 'Pause track' : 'Play track'"
              @click="emit('togglePlay')"
            >
              <svg v-if="playing"><use href="#i-pause" /></svg>
              <svg v-else><use href="#i-play" /></svg>
            </button>

            <button type="button" class="launcher-btn launcher-btn-next" aria-label="Next track" @click="emit('nextTrack')">
              <svg><use href="#i-next-track" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
