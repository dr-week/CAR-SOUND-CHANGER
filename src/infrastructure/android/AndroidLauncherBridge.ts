import type {
  AndroidLauncherOptions,
  ExternalTrackInfo,
  InstalledCarApp,
  NativeLauncherInterface,
  SteeringWheelAction,
} from "./AndroidLauncherTypes";
import { mapKeyToSteeringWheelAction } from "./AndroidKeyMap";
import { AndroidAppLauncher } from "./AndroidAppLauncher";

export * from "./AndroidLauncherTypes";

export class AndroidLauncherBridge {
  private options: AndroidLauncherOptions;
  private keyHandler: (e: KeyboardEvent) => void;
  private isDestroyed = false;
  private appLauncher: AndroidAppLauncher;

  constructor(options: AndroidLauncherOptions = {}) {
    this.options = { ...options };
    this.keyHandler = this.handleKeyDown.bind(this);
    this.appLauncher = new AndroidAppLauncher(() => this.getNativeInterface());
    this.init();
  }

  public init(): void {
    if (typeof window === "undefined") return;

    window.addEventListener("keydown", this.keyHandler);

    const win = window as unknown as Record<string, unknown>;
    win.__androidLauncherBridge = this;
    win.onAndroidGearChanged = (gear: number) => this.options.onGearChanged?.(gear);
    win.onAndroidIlluminationChanged = (isNight: boolean) => this.options.onIlluminationChanged?.(isNight);
    win.onAndroidAudioFocusChanged = (isDucked: boolean, isPaused: boolean) =>
      this.options.onAudioFocusChanged?.(isDucked, isPaused);
    win.onAndroidSteeringWheelKey = (action: string) => this.handleSteeringWheelAction(action);
    win.onAndroidBackButton = () => this.handleBackButton();
    win.onAndroidTrackChanged = (title: string, artist: string, album: string, isPlaying: boolean) =>
      this.options.onTrackChanged?.({ title, artist, album, isPlaying });
  }

  public destroy(): void {
    if (typeof window === "undefined" || this.isDestroyed) return;
    this.isDestroyed = true;
    window.removeEventListener("keydown", this.keyHandler);

    const win = window as unknown as Record<string, unknown>;
    delete win.__androidLauncherBridge;
    delete win.onAndroidGearChanged;
    delete win.onAndroidIlluminationChanged;
    delete win.onAndroidAudioFocusChanged;
    delete win.onAndroidSteeringWheelKey;
    delete win.onAndroidBackButton;
    delete win.onAndroidTrackChanged;
  }

  public setOptions(options: Partial<AndroidLauncherOptions>): void {
    this.options = { ...this.options, ...options };
  }

  public launchEqualizer(): boolean {
    return this.appLauncher.launchEqualizer();
  }

  public launchRadio(): boolean {
    return this.appLauncher.launchRadio();
  }

  public launchPhone(): boolean {
    return this.appLauncher.launchPhone();
  }

  public launchBluetoothMusic(): boolean {
    return this.appLauncher.launchBluetoothMusic();
  }

  public launchSettings(): boolean {
    return this.appLauncher.launchSettings();
  }

  public launchPackage(packageName: string): boolean {
    if (packageName === "com.syu.bt.phone") return this.launchPhone();
    if (packageName === "com.syu.bt.music") return this.launchBluetoothMusic();
    return this.appLauncher.launchPackage(packageName);
  }

  public getInstalledApps(): InstalledCarApp[] {
    return this.appLauncher.getInstalledApps();
  }

  public handleBackButton(): void {
    this.options.onBackButton?.();
  }

  public launchGoogleMaps(destination = ""): boolean {
    try {
      return this.getNativeInterface()?.launchGoogleMaps?.(destination.trim()) ?? false;
    } catch {
      return false;
    }
  }

  private getNativeInterface(): NativeLauncherInterface | null {
    if (typeof window === "undefined") return null;
    const win = window as unknown as Record<string, NativeLauncherInterface | undefined>;
    return win.AndroidCar || win.AndroidMcu || win.AndroidLauncher || null;
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (e.key === "Escape" || e.keyCode === 4) {
      this.handleBackButton();
      return;
    }
    const action = mapKeyToSteeringWheelAction(e);
    if (action) this.options.onSteeringWheelKey?.(action);
  }

  public handleSteeringWheelAction(action: string): void {
    const act = action.toLowerCase();
    const valid: SteeringWheelAction[] = [
      "next", "prev", "play_pause", "mode", "vol_up", "vol_down", "vol_mute", "call", "end_call", "voice_assist",
    ];
    if (valid.includes(act as SteeringWheelAction)) {
      this.options.onSteeringWheelKey?.(act as SteeringWheelAction);
    }
  }
}
