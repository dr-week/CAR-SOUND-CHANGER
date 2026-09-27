import { describe, expect, it, vi } from "vitest";
import { CapabilityRegistry } from "../CapabilityRegistry";

function createRegistry() {
  const handlers = {
    openSoundStudio: vi.fn(),
    openGauges: vi.fn(),
    launchNativePackage: vi.fn(() => false),
    openEqualizerModal: vi.fn(),
    launchNativeEqualizer: vi.fn(() => false),
    notify: vi.fn(),
  };
  return { registry: new CapabilityRegistry(handlers), handlers };
}

describe("CapabilityRegistry", () => {
  it("exposes only truthful built-in destinations", () => {
    const { registry } = createRegistry();
    expect(registry.getBuiltInLauncherApps().map((app) => app.packageName)).toEqual([
      "internal.sound.mod",
      "internal.gauges",
      "internal.equalizer",
    ]);
  });

  it("routes internal destinations without invoking Android packages", () => {
    const { registry, handlers } = createRegistry();
    registry.handleAppLaunch(registry.getBuiltInLauncherApps()[0]);
    expect(handlers.openSoundStudio).toHaveBeenCalledOnce();
    expect(handlers.launchNativePackage).not.toHaveBeenCalled();
  });

  it("reports an unavailable installed package without guessing a fallback", () => {
    const { registry, handlers } = createRegistry();
    registry.handleAppLaunch({
      label: "Stock Radio",
      packageName: "vendor.stock.radio",
      icon: "radio",
      category: "media",
    });
    expect(handlers.launchNativePackage).toHaveBeenCalledWith("vendor.stock.radio");
    expect(handlers.notify).toHaveBeenCalledWith("Stock Radio is unavailable");
  });

  it("delegates internal.equalizer to launchNativeEqualizer and falls back to modal", () => {
    const { registry, handlers } = createRegistry();
    const eqApp = registry.getBuiltInLauncherApps().find((a) => a.packageName === "internal.equalizer")!;

    // When native equalizer returns false (unavailable) -> fallback to modal
    registry.handleAppLaunch(eqApp);
    expect(handlers.launchNativeEqualizer).toHaveBeenCalled();
    expect(handlers.openEqualizerModal).toHaveBeenCalledOnce();

    // When native equalizer returns true (hardware DSP found) -> do not open modal
    handlers.launchNativeEqualizer.mockReturnValue(true);
    handlers.openEqualizerModal.mockClear();
    registry.handleAppLaunch(eqApp);
    expect(handlers.launchNativeEqualizer).toHaveBeenCalledTimes(2);
    expect(handlers.openEqualizerModal).not.toHaveBeenCalled();
  });
});

