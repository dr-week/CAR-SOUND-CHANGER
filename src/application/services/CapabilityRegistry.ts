import type { InstalledCarApp } from "../../infrastructure/android/AndroidLauncherBridge";

export interface LauncherAppActionHandlers {
  openSoundStudio: () => void;
  openGauges: () => void;
  openEqualizerModal: () => void;
  launchNativeEqualizer: () => boolean;
  launchNativePackage: (packageName: string) => boolean;
  notify: (message: string) => void;
}

export class CapabilityRegistry {
  private isLaunching = false;
  private launchTimer: number | undefined;

  constructor(private readonly handlers: LauncherAppActionHandlers) {}

  public getBuiltInLauncherApps(): InstalledCarApp[] {
    return [
      { label: "Car Sound Studio", packageName: "internal.sound.mod", icon: "car", category: "vehicle" },
      { label: "Vehicle Gauges", packageName: "internal.gauges", icon: "gauge", category: "vehicle" },
      { label: "Launcher Equalizer", packageName: "internal.equalizer", icon: "equalizer", category: "media" },
    ];
  }

  public handleAppLaunch(app: InstalledCarApp): boolean {
    if (this.isLaunching) {
      return false; // Prevent duplicate app launches during delayed responses
    }

    this.isLaunching = true;
    if (typeof window !== "undefined") {
      window.clearTimeout(this.launchTimer);
      this.launchTimer = window.setTimeout(() => {
        this.isLaunching = false;
      }, 750);
    }

    if (app.packageName === "internal.sound.mod") {
      this.handlers.openSoundStudio();
      this.isLaunching = false;
      return true;
    }
    if (app.packageName === "internal.gauges") {
      this.handlers.openGauges();
      this.isLaunching = false;
      return true;
    }
    if (app.packageName === "internal.equalizer") {
      if (!this.handlers.launchNativeEqualizer()) {
        this.handlers.openEqualizerModal();
      }
      this.isLaunching = false;
      return true;
    }

    // Attempt native package launch with immediate opening feedback
    this.handlers.notify(`Opening ${app.label}...`);
    const success = this.handlers.launchNativePackage(app.packageName);
    if (!success) {
      this.isLaunching = false;
      this.handlers.notify(`${app.label} is unavailable`);
      return false;
    }

    return true;
  }
}
