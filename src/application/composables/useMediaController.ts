import { ref } from "vue";
import type { ExternalTrackInfo } from "../../infrastructure/android/AndroidLauncherBridge";

export type AudioSource = "Bluetooth" | "FM Radio";

export function useMediaController() {
  const playing = ref<boolean>(true);
  const audioSource = ref<AudioSource>("Bluetooth");
  const externalTrack = ref<ExternalTrackInfo | null>(null);
  let lastToggleTime = 0;

  function setPlaying(val: boolean) {
    playing.value = val;
  }

  function togglePlaying() {
    const now = Date.now();
    // Protect against erratic toggle command queues from rapid multi-taps
    if (now - lastToggleTime < 350) return;
    lastToggleTime = now;
    playing.value = !playing.value;
  }

  function setAudioSource(source: AudioSource) {
    audioSource.value = source;
  }

  function setExternalTrack(track: ExternalTrackInfo | null) {
    externalTrack.value = track;
    if (track && typeof track.isPlaying === "boolean") {
      playing.value = track.isPlaying;
    }
  }

  return {
    playing,
    audioSource,
    externalTrack,
    setPlaying,
    togglePlaying,
    setAudioSource,
    setExternalTrack,
  };
}

