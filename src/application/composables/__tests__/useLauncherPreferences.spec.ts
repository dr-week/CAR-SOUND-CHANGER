import { beforeEach, describe, expect, it } from "vitest";
import { useLauncherPreferences } from "../useLauncherPreferences";

describe("useLauncherPreferences", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("initializes with default automotive preferences", () => {
    const prefs = useLauncherPreferences();
    expect(prefs.uiScale.value).toBe(110);
    expect(prefs.brightness.value).toBe(74);
    expect(prefs.masterVolume.value).toBe(80);
    expect(prefs.defaultNavApp.value).toBe("internal");
    expect(prefs.defaultMusicApp.value).toBe("internal");
    expect(prefs.muteOnReverse.value).toBe(true);
    expect(prefs.isNight.value).toBe(false);
  });

  it("handles reverse audio attenuation and restores previous volume", () => {
    const prefs = useLauncherPreferences();
    prefs.masterVolume.value = 80;

    // Shift into Reverse
    prefs.handleReverseAudioAttenuation(true);
    expect(prefs.masterVolume.value).toBe(24); // 80 * 0.3 = 24 (70% attenuation)

    // Shift out of Reverse
    prefs.handleReverseAudioAttenuation(false);
    expect(prefs.masterVolume.value).toBe(80); // Restored
  });

  it("handles audio focus ducking for turn-by-turn nav prompts", () => {
    const prefs = useLauncherPreferences();
    prefs.masterVolume.value = 100;

    // Navigation prompt starts speaking
    prefs.handleAudioFocusDucking(true, false);
    expect(prefs.masterVolume.value).toBe(40); // 100 * 0.4 = 40 (60% ducking)

    // Navigation prompt finishes
    prefs.handleAudioFocusDucking(false, false);
    expect(prefs.masterVolume.value).toBe(100); // Restored
  });

  it("persists updated default apps and settings to localStorage", async () => {
    const prefs = useLauncherPreferences();
    prefs.defaultNavApp.value = "com.google.android.apps.maps";
    prefs.defaultMusicApp.value = "com.spotify.music";
    prefs.muteOnReverse.value = false;

    // Create another instance to verify persistence
    const newPrefs = useLauncherPreferences();
    expect(newPrefs.defaultNavApp.value).toBe("com.google.android.apps.maps");
    expect(newPrefs.defaultMusicApp.value).toBe("com.spotify.music");
    expect(newPrefs.muteOnReverse.value).toBe(false);
  });
});
