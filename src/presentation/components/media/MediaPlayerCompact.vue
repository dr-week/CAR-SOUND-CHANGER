<script setup lang="ts">
import type { Track } from "./playlist";

defineProps<{
  displayTitle: string;
  displayArtist: string;
  displayAlbum: string;
  displayNumber: string;
  compactEyebrow: string;
  playing: boolean;
  elapsedSeconds: number;
  currentTrack: Track;
  progressPercent: number;
  formattedElapsed: string;
  formattedDuration: string;
}>();

const emit = defineEmits<{
  togglePlay: [];
  nextTrack: [];
  prevTrack: [];
  handleSeek: [e: MouseEvent];
  handleScrubberKeydown: [e: KeyboardEvent];
}>();
</script>

<template>
  <section class="media-card card" aria-label="Now playing media">
    <div class="album">NO.<br />{{ displayNumber }}</div>
    <div class="track">
      <span>{{ compactEyebrow }}</span>
      <h2>{{ displayTitle }}</h2>
      <p>{{ displayArtist }} · {{ displayAlbum }}</p>

      <!-- Interactive Scrubber -->
      <div
        class="scrubber-wrap"
        role="slider"
        :aria-valuenow="elapsedSeconds"
        :aria-valuemin="0"
        :aria-valuemax="currentTrack.duration"
        tabindex="0"
        aria-label="Track playback position"
        @click="(e) => emit('handleSeek', e)"
        @keydown="(e) => emit('handleScrubberKeydown', e)"
      >
        <div class="scrubber-fill" :style="{ width: `${progressPercent}%` }"></div>
      </div>
      <div class="scrubber-times">
        <small>{{ formattedElapsed }}</small>
        <small>{{ formattedDuration }}</small>
      </div>
    </div>

    <div class="controls">
      <button type="button" aria-label="Previous track" @click="emit('prevTrack')">
        <svg><use href="#i-prev-track" /></svg>
      </button>
      <button class="play" :aria-label="playing ? 'Pause' : 'Play'" @click="emit('togglePlay')">
        <svg v-if="playing"><use href="#i-pause" /></svg><svg v-else><use href="#i-play" /></svg>
      </button>
      <button type="button" aria-label="Next track" @click="emit('nextTrack')">
        <svg><use href="#i-next-track" /></svg>
      </button>
    </div>
  </section>
</template>
