import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AndroidLauncherBridge } from "../AndroidLauncherBridge";

describe("AndroidLauncherBridge", () => {
  let bridge: AndroidLauncherBridge;
  let onSteeringWheel: any;
  let onGear: any;
  let onBack: any;
  let onTrack: any;
  let onIllum: any;
  let onAudioFocus: any;

  beforeEach(() => {
    onSteeringWheel = vi.fn();
    onGear = vi.fn();
    onBack = vi.fn();
    onTrack = vi.fn();
    onIllum = vi.fn();
    onAudioFocus = vi.fn();
    bridge = new AndroidLauncherBridge({
      onSteeringWheelKey: onSteeringWheel,
      onGearChanged: onGear,
      onBackButton: onBack,
      onTrackChanged: onTrack,
      onIlluminationChanged: onIllum,
      onAudioFocusChanged: onAudioFocus,
    });
  });

  afterEach(() => {
    bridge.destroy();
    vi.unstubAllGlobals();
  });

  it("intercepts hardware media keys and triggers callbacks", () => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "MediaTrackNext" }));
    expect(onSteeringWheel).toHaveBeenCalledWith("next");

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "MediaTrackPrevious" }));
    expect(onSteeringWheel).toHaveBeenCalledWith("prev");

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "MediaPlayPause" }));
    expect(onSteeringWheel).toHaveBeenCalledWith("play_pause");

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "F12" }));
    expect(onSteeringWheel).toHaveBeenCalledWith("mode");

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "AudioVolumeMute" }));
    expect(onSteeringWheel).toHaveBeenCalledWith("vol_mute");
  });

  it("handles Back key and dispatches onBackButton", () => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(onBack).toHaveBeenCalled();

    const win = window as any;
    win.onAndroidBackButton();
    expect(onBack).toHaveBeenCalledTimes(2);
  });

  it("handles MCU global bridge calls from Kotlin WebView", () => {
    const win = window as any;
    expect(win.onAndroidGearChanged).toBeDefined();

    win.onAndroidGearChanged(-1);
    expect(onGear).toHaveBeenCalledWith(-1);

    win.onAndroidSteeringWheelKey("vol_up");
    expect(onSteeringWheel).toHaveBeenCalledWith("vol_up");

    win.onAndroidSteeringWheelKey("vol_mute");
    expect(onSteeringWheel).toHaveBeenCalledWith("vol_mute");

    win.onAndroidSteeringWheelKey("call");
    expect(onSteeringWheel).toHaveBeenCalledWith("call");

    win.onAndroidIlluminationChanged(true);
    expect(onIllum).toHaveBeenCalledWith(true);

    win.onAndroidAudioFocusChanged(true, false);
    expect(onAudioFocus).toHaveBeenCalledWith(true, false);

    win.onAndroidTrackChanged("Song", "Artist", "Album", true);
    expect(onTrack).toHaveBeenCalledWith({
      title: "Song",
      artist: "Artist",
      album: "Album",
      isPlaying: true,
    });
  });

  it("calls native AndroidLauncher when launching Equalizer or dispatches custom event fallback", () => {
    const dispatchSpy = vi.spyOn(window, "dispatchEvent");
    bridge.launchEqualizer();
    expect(dispatchSpy).toHaveBeenCalled();
  });

  it("dispatches custom event fallbacks for launchPhone and launchBluetoothMusic", () => {
    const dispatchSpy = vi.spyOn(window, "dispatchEvent");
    bridge.launchPhone();
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "android-launch-app",
        detail: { target: "phone", action: "android.intent.action.DIAL" },
      }),
    );

    bridge.launchBluetoothMusic();
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "android-launch-app",
        detail: { target: "bluetooth-music", action: "com.syu.bt.music" },
      }),
    );
  });

  it("delegates .phone and .music package names to launchPhone and launchBluetoothMusic", () => {
    const phoneSpy = vi.spyOn(bridge, "launchPhone");
    const musicSpy = vi.spyOn(bridge, "launchBluetoothMusic");

    bridge.launchPackage("com.syu.bt.phone");
    expect(phoneSpy).toHaveBeenCalled();

    bridge.launchPackage("com.syu.bt.music");
    expect(musicSpy).toHaveBeenCalled();
  });

  it("does not invent installed hardware apps without a native package manager", () => {
    const apps = bridge.getInstalledApps();
    expect(apps).toEqual([]);
  });
  it("launches Spotify by its real package instead of redirecting it to Bluetooth", () => {
    const launchPackage = vi.fn(() => true);
    const launchBluetoothMusic = vi.fn(() => true);
    vi.stubGlobal("AndroidLauncher", { launchPackage, launchBluetoothMusic });
    expect(bridge.launchPackage("com.spotify.music")).toBe(true);
    expect(launchPackage).toHaveBeenCalledWith("com.spotify.music");
    expect(launchBluetoothMusic).not.toHaveBeenCalled();
  });
  it("hands a trimmed destination to native Google Maps and handles bridge failure", () => {
    const launchGoogleMaps = vi.fn(() => true);
    vi.stubGlobal("AndroidLauncher", { launchGoogleMaps });
    expect(bridge.launchGoogleMaps("  Delhi  ")).toBe(true);
    expect(launchGoogleMaps).toHaveBeenCalledWith("Delhi");
    launchGoogleMaps.mockImplementation(() => { throw new Error("Unavailable"); });
    expect(bridge.launchGoogleMaps("Delhi")).toBe(false);
  });
});
