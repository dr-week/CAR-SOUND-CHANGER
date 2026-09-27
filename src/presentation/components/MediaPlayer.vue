<script lang="ts">
export { PLAYLIST, type Track } from "./media/playlist";
</script>

<script setup lang="ts">
import { computed } from "vue";
import { usePreviewPlayback } from "./media/usePreviewPlayback";
import type { ExternalTrackInfo } from "../../infrastructure/android/AndroidLauncherBridge";
import MediaPlayerLauncher from "./media/MediaPlayerLauncher.vue";
import MediaPlayerCompact from "./media/MediaPlayerCompact.vue";
import MediaPlayerStudio from "./media/MediaPlayerStudio.vue";

const props = withDefaults(
  defineProps<{
    variant?: "compact" | "studio" | "launcher";
    audioSource?: "Bluetooth" | "FM Radio";
    playing?: boolean;
    externalTrack?: ExternalTrackInfo | null;
  }>(),
  {
    variant: "launcher",
    audioSource: "Bluetooth",
    playing: true,
    externalTrack: null,
  },
);

const emit = defineEmits<{
  "update:playing": [playing: boolean];
  "update:audioSource": [source: "Bluetooth" | "FM Radio"];
  notice: [message: string];
}>();

const {
  currentTrack,
  elapsedSeconds,
  formatTime,
  formattedElapsed,
  formattedDuration,
  progressPercent,
  trackIndex,
  togglePlay,
  nextTrack,
  prevTrack,
  selectTrack,
  handleSeek,
  handleScrubberKeydown,
} = usePreviewPlayback(props, emit);

const displayTitle = computed(() => props.externalTrack?.title || currentTrack.value.title);
const displayArtist = computed(() => props.externalTrack?.artist || currentTrack.value.artist);
const displayAlbum = computed(() => props.externalTrack?.album || currentTrack.value.album);
const displayNumber = computed(() =>
  props.externalTrack
    ? (props.audioSource === "FM Radio" ? "FM" : "BT")
    : currentTrack.value.number,
);
const launcherEyebrow = computed(() =>
  props.externalTrack ? `${props.audioSource.toUpperCase()} · LIVE METADATA` : "Media preview",
);
const compactEyebrow = computed(() =>
  props.externalTrack ? `${props.audioSource.toUpperCase()} · LIVE METADATA` : `NOW PLAYING · ${props.audioSource.toUpperCase()}`,
);
const studioEyebrow = computed(() =>
  props.externalTrack ? `${props.audioSource.toUpperCase()} · LIVE METADATA` : `${props.audioSource.toUpperCase()} · LOCAL PREVIEW`,
);
</script>

<template>
  <MediaPlayerLauncher
    v-if="variant === 'launcher'"
    :display-title="displayTitle"
    :display-artist="displayArtist"
    :display-number="displayNumber"
    :launcher-eyebrow="launcherEyebrow"
    :playing="playing"
    @toggle-play="togglePlay"
    @next-track="nextTrack"
    @prev-track="prevTrack"
  />

  <MediaPlayerCompact
    v-else-if="variant === 'compact'"
    :display-title="displayTitle"
    :display-artist="displayArtist"
    :display-album="displayAlbum"
    :display-number="displayNumber"
    :compact-eyebrow="compactEyebrow"
    :playing="playing"
    :elapsed-seconds="elapsedSeconds"
    :current-track="currentTrack"
    :progress-percent="progressPercent"
    :formatted-elapsed="formattedElapsed"
    :formatted-duration="formattedDuration"
    @toggle-play="togglePlay"
    @next-track="nextTrack"
    @prev-track="prevTrack"
    @handle-seek="handleSeek"
    @handle-scrubber-keydown="handleScrubberKeydown"
  />

  <MediaPlayerStudio
    v-else
    :display-title="displayTitle"
    :display-artist="displayArtist"
    :display-album="displayAlbum"
    :display-number="displayNumber"
    :studio-eyebrow="studioEyebrow"
    :playing="playing"
    :elapsed-seconds="elapsedSeconds"
    :current-track="currentTrack"
    :progress-percent="progressPercent"
    :formatted-elapsed="formattedElapsed"
    :formatted-duration="formattedDuration"
    :track-index="trackIndex"
    :format-time="formatTime"
    @toggle-play="togglePlay"
    @next-track="nextTrack"
    @prev-track="prevTrack"
    @select-track="selectTrack"
    @handle-seek="handleSeek"
    @handle-scrubber-keydown="handleScrubberKeydown"
  />
</template>

<style scoped>
@import "./media/player.css";
@import "./media/artwork.css";
@import "./media/transport.css";
</style>
