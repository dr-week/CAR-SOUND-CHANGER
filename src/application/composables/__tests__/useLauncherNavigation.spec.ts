import { describe, expect, it, vi } from "vitest";
import { useLauncherNavigation } from "../useLauncherNavigation";

describe("useLauncherNavigation Composable", () => {
  it("initializes with home view", () => {
    const nav = useLauncherNavigation();
    expect(nav.currentView.value).toBe("home");
  });

  it("switches views via setView", () => {
    const nav = useLauncherNavigation();
    nav.setView("media");
    expect(nav.currentView.value).toBe("media");
    nav.setView("engine");
    expect(nav.currentView.value).toBe("engine");
  });

  it("cycles primary modes via nextMode", () => {
    const nav = useLauncherNavigation();
    expect(nav.currentView.value).toBe("home");
    nav.nextMode();
    expect(nav.currentView.value).toBe("media");
    nav.nextMode();
    expect(nav.currentView.value).toBe("navigate");
    nav.nextMode();
    expect(nav.currentView.value).toBe("apps");
    nav.nextMode();
    expect(nav.currentView.value).toBe("settings");
    nav.nextMode();
    expect(nav.currentView.value).toBe("home");
  });

  it("handles back button hierarchically", () => {
    let overlayOpen = true;
    const closeOverlay = vi.fn(() => {
      overlayOpen = false;
    });

    const nav = useLauncherNavigation({
      hasOpenOverlay: () => overlayOpen,
      closeTopOverlay: closeOverlay,
    });

    // 1. When overlay is open, back closes the overlay
    nav.setView("apps");
    nav.handleBackButton();
    expect(closeOverlay).toHaveBeenCalledTimes(1);
    expect(nav.currentView.value).toBe("apps"); // Still in apps

    // 2. When overlay is closed and in sub-view, back returns to home
    nav.handleBackButton();
    expect(nav.currentView.value).toBe("home");

    // 3. When on home, back keeps the launcher persistent
    nav.handleBackButton();
    expect(nav.currentView.value).toBe("home");
  });
});
