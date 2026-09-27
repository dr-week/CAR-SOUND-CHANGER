import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MediaSessionService } from "../MediaSessionService";

describe("MediaSessionService", () => {
  let originalMediaSession: any;
  let mockMediaSession: any;

  beforeEach(() => {
    originalMediaSession = (globalThis as any).navigator.mediaSession;
    mockMediaSession = {
      metadata: null,
      playbackState: "none",
      setActionHandler: vi.fn(),
      setPositionState: vi.fn(),
    };
    (globalThis as any).navigator.mediaSession = mockMediaSession;
    (globalThis as any).MediaMetadata = vi.fn().mockImplementation((meta) => meta);
  });

  afterEach(() => {
    (globalThis as any).navigator.mediaSession = originalMediaSession;
  });

  it("sets metadata on navigator.mediaSession", () => {
    const service = new MediaSessionService();
    service.setMetadata({
      title: "Nightcall",
      artist: "Kavinsky",
      album: "OutRun",
      artworkUrl: "/icons/icon.svg",
    });

    expect(mockMediaSession.metadata).toEqual({
      title: "Nightcall",
      artist: "Kavinsky",
      album: "OutRun",
      artwork: [
        { src: "/icons/icon.svg", sizes: "192x192", type: "image/png" },
        { src: "/icons/icon.svg", sizes: "512x512", type: "image/png" },
      ],
    });
  });

  it("updates playback state and position state", () => {
    const service = new MediaSessionService();
    service.setPlaybackState(true);
    expect(mockMediaSession.playbackState).toBe("playing");

    service.setPositionState(240, 60);
    expect(mockMediaSession.setPositionState).toHaveBeenCalledWith({
      duration: 240,
      playbackRate: 1.0,
      position: 60,
    });
  });

  it("binds action handlers for automotive play/pause/skip", () => {
    const service = new MediaSessionService();
    const onPlay = vi.fn();
    const onPause = vi.fn();
    const onNext = vi.fn();
    const onPrev = vi.fn();
    const onSeek = vi.fn();

    service.setActionHandlers({
      onPlay,
      onPause,
      onNext,
      onPrevious: onPrev,
      onSeekTo: onSeek,
    });

    expect(mockMediaSession.setActionHandler).toHaveBeenCalledWith("play", onPlay);
    expect(mockMediaSession.setActionHandler).toHaveBeenCalledWith("pause", onPause);
    expect(mockMediaSession.setActionHandler).toHaveBeenCalledWith("nexttrack", onNext);
    expect(mockMediaSession.setActionHandler).toHaveBeenCalledWith("previoustrack", onPrev);
  });
});
