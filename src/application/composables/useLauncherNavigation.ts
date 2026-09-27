import { ref } from "vue";

export type LauncherNavView = "home" | "gauges" | "engine" | "media" | "navigate" | "apps" | "connect" | "settings";

export interface LauncherNavigationOptions {
  hasOpenOverlay?: () => boolean;
  closeTopOverlay?: () => void;
}

export function useLauncherNavigation(options?: LauncherNavigationOptions) {
  const currentView = ref<LauncherNavView>("home");

  function setView(view: LauncherNavView) {
    currentView.value = view;
  }

  function handleBackButton() {
    // 1. If any modal / overlay is open, dismiss it first
    if (options?.hasOpenOverlay?.()) {
      options.closeTopOverlay?.();
      return;
    }
    // 2. If in a sub-view, navigate back to home
    if (currentView.value !== "home") {
      currentView.value = "home";
      return;
    }
    // 3. If already on home, keep the launcher persistent (do nothing)
  }

  function nextMode() {
    const modes: LauncherNavView[] = ["home", "media", "navigate", "apps", "settings"];
    const idx = modes.indexOf(currentView.value);
    const nextIdx = (idx + 1) % modes.length;
    currentView.value = modes[nextIdx];
  }

  return {
    currentView,
    setView,
    handleBackButton,
    nextMode,
  };
}
