import { describe, expect, it } from "vitest";
import { useMediaController } from "../useMediaController";

describe("useMediaController", () => {
  it("initializes with default playback state", () => {
    const media = useMediaController();
    expect(media.playing.value).toBe(true);
    expect(media.audioSource.value).toBe("Bluetooth");
    expect(media.externalTrack.value).toBeNull();
  });

  it("synchronizes external Bluetooth/Radio track metadata", () => {
    const media = useMediaController();
    media.setExternalTrack({
      title: "Starboy",
      artist: "The Weeknd",
      album: "Starboy",
      isPlaying: true,
    });

    expect(media.externalTrack.value?.title).toBe("Starboy");
    expect(media.externalTrack.value?.artist).toBe("The Weeknd");
    expect(media.playing.value).toBe(true);

    media.setExternalTrack({
      title: "Starboy",
      artist: "The Weeknd",
      album: "Starboy",
      isPlaying: false,
    });
    expect(media.playing.value).toBe(false);
  });

  it("debounces rapid toggle requests within 350ms", () => {
    const media = useMediaController();
    media.playing.value = true;

    media.togglePlaying();
    expect(media.playing.value).toBe(false);

    // Immediate second toggle should be ignored due to debounce lock
    media.togglePlaying();
    expect(media.playing.value).toBe(false);
  });
});
