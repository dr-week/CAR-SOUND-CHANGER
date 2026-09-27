import { onBeforeUnmount } from "vue";
import { AndroidLauncherBridge } from "../infrastructure/android/AndroidLauncherBridge";

export interface LauncherBridgeContext {
  nav: any;
  overlays: any;
  media: any;
  prefs: any;
  phone: any;
  device: any;
}

export function useLauncherAndroidBridge(ctx: LauncherBridgeContext) {
  const bridge = new AndroidLauncherBridge({
    onSteeringWheelKey: (action) => {
      if (action === "mode") {
        ctx.nav.nextMode();
        ctx.overlays.showNotice(`Mode: ${ctx.nav.currentView.value.toUpperCase()}`);
      } else if (action === "play_pause") {
        ctx.media.togglePlaying();
      } else if (action === "vol_up") {
        ctx.prefs.masterVolume.value = Math.min(100, ctx.prefs.masterVolume.value + 5);
      } else if (action === "vol_down") {
        ctx.prefs.masterVolume.value = Math.max(0, ctx.prefs.masterVolume.value - 5);
      } else if (action === "vol_mute") {
        ctx.prefs.masterVolume.value = ctx.prefs.masterVolume.value === 0 ? 70 : 0;
        ctx.overlays.showNotice(ctx.prefs.masterVolume.value === 0 ? "Mute" : "Volume Restored");
      } else if (action === "call") {
        if (ctx.phone.activeCall.value?.isIncoming) {
          ctx.phone.answerCall();
        } else if (!bridge.launchPhone()) {
          ctx.overlays.showNotice("Opening Phone...");
        }
      } else if (action === "end_call") {
        if (ctx.phone.activeCall.value) {
          ctx.phone.endCall();
          ctx.overlays.showNotice("Call ended");
        } else {
          ctx.overlays.showNotice("No active call");
        }
      } else if (action === "voice_assist") {
        ctx.overlays.showNotice("Voice Assist activated");
      }
    },
    onGearChanged: (gear) => {
      ctx.device.setGear(gear);
      ctx.prefs.handleReverseAudioAttenuation(gear === -1);
      if (gear === -1) {
        ctx.overlays.showNotice("Reverse engaged · Audio attenuated");
      }
    },
    onIlluminationChanged: (night) => {
      ctx.prefs.setNightMode(night);
      if (night) {
        ctx.prefs.brightness.value = Math.min(ctx.prefs.brightness.value, 40);
        ctx.overlays.showNotice("Night Mode: Headlights Detected");
      } else {
        ctx.prefs.brightness.value = 75;
        ctx.overlays.showNotice("Day Mode: Ambient Light Restored");
      }
    },
    onAudioFocusChanged: (isDucked, isPaused) => {
      ctx.prefs.handleAudioFocusDucking(isDucked, isPaused);
      if (isPaused && ctx.media.playing.value) {
        ctx.media.setPlaying(false);
        ctx.overlays.showNotice("Audio paused for priority speech");
      }
    },
    onTrackChanged: (track) => {
      ctx.media.setExternalTrack(track);
    },
    onBackButton: () => {
      ctx.nav.handleBackButton();
    },
  });

  onBeforeUnmount(() => {
    bridge.destroy();
  });

  return bridge;
}
