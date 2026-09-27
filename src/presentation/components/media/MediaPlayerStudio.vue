<script setup lang="ts">
import { PLAYLIST, type Track } from "./playlist";

defineProps<{
  displayTitle: string;
  displayArtist: string;
  displayAlbum: string;
  displayNumber: string;
  studioEyebrow: string;
  playing: boolean;
  elapsedSeconds: number;
  currentTrack: Track;
  progressPercent: number;
  formattedElapsed: string;
  formattedDuration: string;
  trackIndex: number;
  formatTime: (seconds: number) => string;
}>();

const emit = defineEmits<{
  togglePlay: [];
  nextTrack: [];
  prevTrack: [];
  selectTrack: [index: number];
  handleSeek: [e: MouseEvent];
  handleScrubberKeydown: [e: KeyboardEvent];
}>();
</script>

<template>
  <div class="media-studio" aria-label="Media Studio">
    <div class="studio-deck">
      <!-- Left: Vinyl Art & Dynamic Visualizer Orbit -->
      <div class="studio-cover-wrap">
        <div class="album album-large" :class="{ 'vinyl-spin': playing }">
          <span>NO. {{ displayNumber }}</span>
        </div>
      </div>

      <!-- Center: Track Information, Interactive Scrubber, & Transport -->
      <div class="media-info">
        <div class="studio-meta-badge">
          <span class="eyebrow">{{ studioEyebrow }}</span>
          <div v-if="playing" class="mini-live-wave">
            <span class="bar b1" /><span class="bar b2" /><span class="bar b3" />
          </div>
        </div>
        <h2>{{ displayTitle }}</h2>
        <p class="studio-artist">{{ displayArtist }} · {{ displayAlbum }}</p>

        <!-- Studio Wide Scrubber -->
        <div
          class="scrubber-wrap scrubber-wrap--wide"
          role="slider"
          :aria-valuenow="elapsedSeconds"
          :aria-valuemin="0"
          :aria-valuemax="currentTrack.duration"
          tabindex="0"
          aria-label="Track playback progress"
          @click="(e) => emit('handleSeek', e)"
          @keydown="(e) => emit('handleScrubberKeydown', e)"
        >
          <div class="scrubber-fill" :style="{ width: `${progressPercent}%` }"></div>
        </div>
        <div class="scrubber-times scrubber-times--wide">
          <span>{{ formattedElapsed }}</span>
          <span>{{ formattedDuration }}</span>
        </div>

        <div class="big-controls">
          <button type="button" aria-label="Previous track" @click="emit('prevTrack')">
            <svg><use href="#i-prev-track" /></svg>
          </button>
          <button type="button" class="play" :aria-label="playing ? 'Pause' : 'Play'" @click="emit('togglePlay')">
            <svg v-if="playing"><use href="#i-pause" /></svg><svg v-else><use href="#i-play" /></svg>
          </button>
          <button type="button" aria-label="Next track" @click="emit('nextTrack')">
            <svg><use href="#i-next-track" /></svg>
          </button>
        </div>
      </div>

      <!-- Right: Interactive Track Queue -->
      <div class="studio-queue card" aria-label="Playlist Queue">
        <div class="queue-header">
          <p class="eyebrow">QUEUE</p>
          <span class="queue-count">{{ PLAYLIST.length }} tracks</span>
        </div>
        <ul class="queue-list">
          <li
            v-for="(trk, idx) in PLAYLIST"
            :key="trk.id"
            class="queue-item"
            :class="{ 'queue-item--active': idx === trackIndex }"
            role="button"
            tabindex="0"
            @click="emit('selectTrack', idx)"
            @keydown.enter="emit('selectTrack', idx)"
            @keydown.space.prevent="emit('selectTrack', idx)"
          >
            <span class="trk-num">{{ trk.number }}</span>
            <div class="trk-meta">
              <strong>{{ trk.title }}</strong>
              <small>{{ trk.artist }}</small>
            </div>
            <span class="trk-dur">{{ formatTime(trk.duration) }}</span>
            <span v-if="idx === trackIndex && playing" class="trk-eq"></span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.studio-meta-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.mini-live-wave {
  display: inline-flex;
  align-items: flex-end;
  gap: 2px;
  height: 10px;
}
.mini-live-wave .bar {
  width: 2px;
  background: var(--acid);
  border-radius: 1px;
  animation: wave-bounce 0.8s infinite ease-in-out alternate;
}
.mini-live-wave .b1 { height: 4px; }
.mini-live-wave .b2 { height: 10px; animation-delay: 0.2s; }
.mini-live-wave .b3 { height: 6px; animation-delay: 0.4s; }
@keyframes wave-bounce {
  0% { transform: scaleY(0.4); }
  100% { transform: scaleY(1); }
}
</style>
