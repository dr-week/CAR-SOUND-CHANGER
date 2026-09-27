import type { SteeringWheelAction } from "./AndroidLauncherTypes";

export function mapKeyToSteeringWheelAction(e: KeyboardEvent): SteeringWheelAction | null {
  switch (e.key) {
    case "MediaTrackNext":
      return "next";
    case "MediaTrackPrevious":
      return "prev";
    case "MediaPlayPause":
      return "play_pause";
    case "F12":
    case "Mode":
      return "mode";
    case "AudioVolumeUp":
      return "vol_up";
    case "AudioVolumeDown":
      return "vol_down";
    case "AudioVolumeMute":
      return "vol_mute";
    default:
      return null;
  }
}
