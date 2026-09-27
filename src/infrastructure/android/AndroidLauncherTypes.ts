export type SteeringWheelAction =
  | "next"
  | "prev"
  | "play_pause"
  | "mode"
  | "vol_up"
  | "vol_down"
  | "vol_mute"
  | "call"
  | "end_call"
  | "voice_assist";

export interface InstalledCarApp {
  label: string;
  packageName: string;
  icon: string;
  category: "media" | "navigation" | "utility" | "vehicle";
}

export interface NativeLauncherInterface {
  launchGoogleMaps?: (destination: string) => boolean;
  launchEqualizer?: () => boolean;
  launchRadio?: () => boolean;
  launchPhone?: () => boolean;
  launchBluetoothMusic?: () => boolean;
  launchSettings?: () => boolean;
  launchPackage?: (packageName: string) => boolean;
  getInstalledApps?: () => string;
}

export interface ExternalTrackInfo {
  title: string;
  artist: string;
  album: string;
  isPlaying: boolean;
}

export interface AndroidLauncherOptions {
  onSteeringWheelKey?: (action: SteeringWheelAction) => void;
  onGearChanged?: (gear: number) => void;
  onIlluminationChanged?: (isNight: boolean) => void;
  onAudioFocusChanged?: (isDucked: boolean, isPaused: boolean) => void;
  onBackButton?: () => boolean | void;
  onTrackChanged?: (track: ExternalTrackInfo) => void;
}
