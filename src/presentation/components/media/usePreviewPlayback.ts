import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { MediaSessionService } from "../../../infrastructure/media/MediaSessionService";

import { PLAYLIST } from "./playlist";

// Demo-only playback state; never treat this timer as native player telemetry.
export function usePreviewPlayback(
  props: { readonly playing: boolean },
  emit: { (event: "update:playing", value: boolean): void; (event: "notice", message: string): void },
) {
  const trackIndex = ref(0);
  const elapsedSeconds = ref(42);
  let playInterval: number | undefined;
  const mediaSession = new MediaSessionService();

  const currentTrack = computed(() => PLAYLIST[trackIndex.value] ?? PLAYLIST[0]);

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  const formattedElapsed = computed(() => formatTime(elapsedSeconds.value));
  const formattedDuration = computed(() => formatTime(currentTrack.value.duration));
  const progressPercent = computed(() =>
    Math.min(100, Math.max(0, (elapsedSeconds.value / currentTrack.value.duration) * 100)),
  );

  function togglePlay() {
    const next = !props.playing;
    emit("update:playing", next);
    emit("notice", next ? `Playing: ${currentTrack.value.title}` : "Playback paused");
  }

  function nextTrack() {
    trackIndex.value = (trackIndex.value + 1) % PLAYLIST.length;
    elapsedSeconds.value = 0;
    emit("notice", `Next track: ${currentTrack.value.title}`);
  }

  function prevTrack() {
    if (elapsedSeconds.value > 4) {
      elapsedSeconds.value = 0;
    } else {
      trackIndex.value = (trackIndex.value - 1 + PLAYLIST.length) % PLAYLIST.length;
      elapsedSeconds.value = 0;
    }
    emit("notice", `Previous track: ${currentTrack.value.title}`);
  }

  function selectTrack(index: number) {
    trackIndex.value = index;
    elapsedSeconds.value = 0;
    if (!props.playing) emit("update:playing", true);
    emit("notice", `Now playing: ${currentTrack.value.title}`);
  }

  function handleSeek(event: MouseEvent) {
    const bar = event.currentTarget as HTMLElement;
    const rect = bar.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    elapsedSeconds.value = Math.round(ratio * currentTrack.value.duration);
    mediaSession.setPositionState(currentTrack.value.duration, elapsedSeconds.value);
  }

  function handleScrubberKeydown(event: KeyboardEvent) {
    let handled = false;
    switch (event.key) {
      case "ArrowLeft":
      case "ArrowDown":
        elapsedSeconds.value = Math.max(0, elapsedSeconds.value - 5);
        handled = true;
        break;
      case "ArrowRight":
      case "ArrowUp":
        elapsedSeconds.value = Math.min(currentTrack.value.duration, elapsedSeconds.value + 5);
        handled = true;
        break;
      case "Home":
        elapsedSeconds.value = 0;
        handled = true;
        break;
      case "End":
        elapsedSeconds.value = currentTrack.value.duration;
        handled = true;
        break;
      case "PageDown":
        elapsedSeconds.value = Math.max(0, elapsedSeconds.value - 30);
        handled = true;
        break;
      case "PageUp":
        elapsedSeconds.value = Math.min(currentTrack.value.duration, elapsedSeconds.value + 30);
        handled = true;
        break;
    }
    if (handled) {
      event.preventDefault();
      mediaSession.setPositionState(currentTrack.value.duration, elapsedSeconds.value);
    }
  }

  watch(
    currentTrack,
    (trk) => {
      mediaSession.setMetadata({
        title: trk.title,
        artist: trk.artist,
        album: trk.album,
        artworkUrl: "/icons/icon.svg",
      });
    },
    { immediate: true },
  );

  watch(
    () => props.playing,
    (isPlaying) => {
      mediaSession.setPlaybackState(isPlaying);
    },
    { immediate: true },
  );

  onMounted(() => {
    mediaSession.setActionHandlers({
      onPlay: () => {
        emit("update:playing", true);
        emit("notice", `Playing: ${currentTrack.value.title}`);
      },
      onPause: () => {
        emit("update:playing", false);
        emit("notice", "Playback paused");
      },
      onNext: () => nextTrack(),
      onPrevious: () => prevTrack(),
      onSeekTo: (time) => {
        elapsedSeconds.value = Math.round(time);
      },
    });

    playInterval = window.setInterval(() => {
      if (props.playing) {
        if (elapsedSeconds.value >= currentTrack.value.duration) {
          nextTrack();
        } else {
          elapsedSeconds.value += 1;
          if (elapsedSeconds.value % 5 === 0) {
            mediaSession.setPositionState(currentTrack.value.duration, elapsedSeconds.value);
          }
        }
      }
    }, 1000);
  });

  onBeforeUnmount(() => {
    window.clearInterval(playInterval);
    mediaSession.destroy();
  });
  return {
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
  };
}
