<script setup lang="ts">
import MediaPlayer from "../components/MediaPlayer.vue";
import type { ExternalTrackInfo } from "../../infrastructure/android/AndroidLauncherBridge";

defineProps<{
  playing: boolean;
  audioSource: "Bluetooth" | "FM Radio";
  externalTrack?: ExternalTrackInfo | null;
}>();

const emit = defineEmits<{
  "update:playing": [value: boolean];
  "update:audioSource": [value: "Bluetooth" | "FM Radio"];
  "openEqualizer": [];
  "launchBluetoothMusic": [];
  "notice": [msg: string];
}>();
</script>

<template>
  <div class="page media-page">
    <div class="page-title">
      <div class="media-title-group">
        <svg class="media-title-icon" width="22" height="22"><use href="#i-music" /></svg>
        <h1>Media Studio</h1>
      </div>
      <div class="media-header-controls">
        <div class="source-pills" aria-label="Audio source">
          <button
            v-for="src in (['Bluetooth', 'FM Radio'] as const)"
            :key="src"
            type="button"
            class="source-pill"
            :class="{ active: audioSource === src }"
            @click="emit('update:audioSource', src)"
          >
            {{ src === 'Bluetooth' ? 'BT' : 'FM' }}
          </button>
        </div>
        <button
          v-if="audioSource === 'Bluetooth'"
          type="button"
          class="media-bt-music-btn"
          aria-label="Open Head Unit Native Bluetooth Music Player"
          @click="emit('launchBluetoothMusic')"
        >
          <svg width="15" height="15"><use href="#i-music-note" /></svg>
          <span>BT Audio</span>
        </button>
        <button
          type="button"
          class="media-eq-btn"
          aria-label="Open launcher audio equalizer"
          @click="emit('openEqualizer')"
        >
          <svg width="15" height="15"><use href="#i-sliders" /></svg>
          <span>EQ</span>
        </button>
      </div>
    </div>

    <MediaPlayer
      variant="studio"
      :playing="playing"
      :audio-source="audioSource"
      :external-track="externalTrack"
      @update:playing="(val) => emit('update:playing', val)"
      @update:audio-source="(val) => emit('update:audioSource', val)"
      @notice="(msg) => emit('notice', msg)"
    />
  </div>
</template>

<style scoped>
.media-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
}
.media-title-icon {
  color: var(--acid);
}
.media-bt-music-btn, .media-eq-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
</style>
