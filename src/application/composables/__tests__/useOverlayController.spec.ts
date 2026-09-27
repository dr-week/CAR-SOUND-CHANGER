import { describe, expect, it } from "vitest";
import { useOverlayController } from "../useOverlayController";

describe("useOverlayController Composable", () => {
  it("manages overlay open states", () => {
    const overlays = useOverlayController();
    expect(overlays.hasOpenOverlay.value).toBe(false);

    overlays.cameraActive.value = true;
    expect(overlays.hasOpenOverlay.value).toBe(true);

    overlays.closeTopOverlay();
    expect(overlays.cameraActive.value).toBe(false);
    expect(overlays.hasOpenOverlay.value).toBe(false);
  });

  it("manages notice toasts", () => {
    const overlays = useOverlayController();
    expect(overlays.notice.value).toBeNull();

    overlays.showNotice("Test notification");
    expect(overlays.notice.value).toBe("Test notification");

    overlays.clearNotice();
    expect(overlays.notice.value).toBeNull();
  });
});
