import type { SteeringWheelAction, ExternalTrackInfo } from "../../infrastructure/android/AndroidLauncherBridge";

export interface SteeringWheelHandlers {
  onMode: () => void;
  onPlayPause: () => void;
  onVolumeChange: (delta: number) => void;
  onMuteToggle: () => void;
  onCall: () => void;
  onEndCall: () => void;
  onVoiceAssist: () => void;
  onGearChanged: (gear: number) => void;
  onIlluminationChanged: (isNight: boolean) => void;
  onAudioFocusChanged: (isDucked: boolean, isPaused: boolean) => void;
  onTrackChanged: (track: ExternalTrackInfo) => void;
  onBackButton: () => void;
}

export function createSteeringWheelDispatcher(handlers: SteeringWheelHandlers) {
  return {
    onSteeringWheelKey: (action: SteeringWheelAction) => {
      switch (action) {
        case "mode":
          handlers.onMode();
          break;
        case "play_pause":
          handlers.onPlayPause();
          break;
        case "vol_up":
          handlers.onVolumeChange(5);
          break;
        case "vol_down":
          handlers.onVolumeChange(-5);
          break;
        case "vol_mute":
          handlers.onMuteToggle();
          break;
        case "call":
          handlers.onCall();
          break;
        case "end_call":
          handlers.onEndCall();
          break;
        case "voice_assist":
          handlers.onVoiceAssist();
          break;
      }
    },
    onGearChanged: handlers.onGearChanged,
    onIlluminationChanged: handlers.onIlluminationChanged,
    onAudioFocusChanged: handlers.onAudioFocusChanged,
    onTrackChanged: handlers.onTrackChanged,
    onBackButton: handlers.onBackButton,
  };
}
