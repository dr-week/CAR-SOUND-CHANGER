/**
 * MediaSessionService
 *
 * Integrates with the standard Web MediaSession API (navigator.mediaSession)
 * to broadcast current track metadata, album artwork, playback state, and
 * position to Android Automotive OS, Android head units, Bluetooth AVRCP,
 * and steering wheel controls.
 */

export interface TrackMetadata {
  title: string;
  artist: string;
  album: string;
  artworkUrl?: string;
}

export interface MediaSessionHandlers {
  onPlay?: () => void;
  onPause?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onSeekTo?: (time: number) => void;
}

export class MediaSessionService {
  private isSupported: boolean;

  constructor() {
    this.isSupported = typeof navigator !== "undefined" && "mediaSession" in navigator;
  }

  setMetadata(track: TrackMetadata): void {
    if (!this.isSupported || !navigator.mediaSession) return;

    try {
      const artwork = track.artworkUrl
        ? [
            { src: track.artworkUrl, sizes: "192x192", type: "image/png" },
            { src: track.artworkUrl, sizes: "512x512", type: "image/png" },
          ]
        : [];

      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: track.album,
        artwork,
      });
    } catch {
      // Graceful fallback for non-compliant browser or head unit environments
    }
  }

  setPlaybackState(playing: boolean): void {
    if (!this.isSupported || !navigator.mediaSession) return;
    try {
      navigator.mediaSession.playbackState = playing ? "playing" : "paused";
    } catch {
      // Ignored
    }
  }

  setPositionState(duration: number, position: number): void {
    if (!this.isSupported || !navigator.mediaSession || !("setPositionState" in navigator.mediaSession)) {
      return;
    }
    try {
      if (duration > 0 && position >= 0 && position <= duration) {
        navigator.mediaSession.setPositionState({
          duration,
          playbackRate: 1.0,
          position,
        });
      }
    } catch {
      // Ignored
    }
  }

  setActionHandlers(handlers: MediaSessionHandlers): void {
    if (!this.isSupported || !navigator.mediaSession) return;

    const actionMap: [MediaSessionAction, (() => void) | undefined][] = [
      ["play", handlers.onPlay],
      ["pause", handlers.onPause],
      ["previoustrack", handlers.onPrevious],
      ["nexttrack", handlers.onNext],
    ];

    for (const [action, handler] of actionMap) {
      try {
        if (handler) {
          navigator.mediaSession.setActionHandler(action, handler);
        } else {
          navigator.mediaSession.setActionHandler(action, null);
        }
      } catch {
        // Unsupported action on certain head unit WebViews
      }
    }

    if (handlers.onSeekTo) {
      try {
        navigator.mediaSession.setActionHandler("seekto", (details) => {
          if (details.seekTime !== undefined && handlers.onSeekTo) {
            handlers.onSeekTo(details.seekTime);
          }
        });
      } catch {
        // Ignored
      }
    }
  }

  destroy(): void {
    if (!this.isSupported || !navigator.mediaSession) return;
    try {
      navigator.mediaSession.playbackState = "none";
      const actions: MediaSessionAction[] = ["play", "pause", "previoustrack", "nexttrack", "seekto"];
      for (const action of actions) {
        navigator.mediaSession.setActionHandler(action, null);
      }
    } catch {
      // Ignored
    }
  }
}
