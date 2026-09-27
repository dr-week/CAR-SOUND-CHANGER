import type { InstalledCarApp, NativeLauncherInterface } from "./AndroidLauncherTypes";

export class AndroidAppLauncher {
  constructor(private getNative: () => NativeLauncherInterface | null) {}

  public launchEqualizer(): boolean {
    const native = this.getNative();
    if (native?.launchEqualizer) return native.launchEqualizer();
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("android-launch-app", {
          detail: { target: "equalizer", action: "android.media.action.DISPLAY_AUDIO_EFFECT_CONTROL_PANEL" },
        }),
      );
    }
    return false;
  }

  public launchRadio(): boolean {
    const native = this.getNative();
    if (native?.launchRadio) return native.launchRadio();
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("android-launch-app", {
          detail: { target: "radio", action: "android.intent.action.MAIN", category: "android.intent.category.APP_MUSIC" },
        }),
      );
    }
    return false;
  }

  public launchPhone(): boolean {
    const native = this.getNative();
    if (native?.launchPhone) return native.launchPhone();
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("android-launch-app", {
          detail: { target: "phone", action: "android.intent.action.DIAL" },
        }),
      );
    }
    return false;
  }

  public launchBluetoothMusic(): boolean {
    const native = this.getNative();
    if (native?.launchBluetoothMusic) return native.launchBluetoothMusic();
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("android-launch-app", {
          detail: { target: "bluetooth-music", action: "com.syu.bt.music" },
        }),
      );
    }
    return false;
  }

  public launchSettings(): boolean {
    return this.getNative()?.launchSettings?.() ?? false;
  }

  public launchPackage(packageName: string): boolean {
    if (packageName === "com.syu.bt.phone") return this.launchPhone();
    if (packageName === "com.syu.bt.music") return this.launchBluetoothMusic();
    const native = this.getNative();
    if (native?.launchPackage) return native.launchPackage(packageName);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("android-launch-package", { detail: { packageName } }),
      );
    }
    return false;
  }

  public getInstalledApps(): InstalledCarApp[] {
    const native = this.getNative();
    if (native?.getInstalledApps) {
      try {
        const raw = native.getInstalledApps();
        if (typeof raw === "string") return JSON.parse(raw);
      } catch (e) {
        console.warn("Failed to parse native installed apps:", e);
      }
    }
    return [];
  }
}
