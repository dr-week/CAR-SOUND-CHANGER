import type { TelemetryStatus } from "../../application/ports/TelemetryStatus";

export class BrowserGeolocation {
  private watchId: number | null = null;
  private staleTimer: number | null = null;
  private lastFixAt: number | null = null;

  constructor(
    private readonly onSpeed: (speedKph: number) => void,
    private readonly onStatus: (status: TelemetryStatus) => void,
    private readonly staleAfterMs = 5_000,
  ) {}

  start(): void {
    if (!navigator.geolocation) {
      this.onStatus("unavailable");
      return;
    }
    if (this.watchId !== null) return;
    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const speed = position.coords.speed;
        this.lastFixAt = Date.now();
        this.onStatus("active");
        if (speed !== null && Number.isFinite(speed) && speed >= 0) this.onSpeed(speed * 3.6);
      },
      (error) => this.onStatus(error.code === error.PERMISSION_DENIED ? "denied" : "error"),
      { enableHighAccuracy: true, maximumAge: 1_000 },
    );
    this.staleTimer = window.setInterval(() => {
      if (this.lastFixAt !== null && Date.now() - this.lastFixAt > this.staleAfterMs) this.onStatus("stale");
    }, 1_000);
  }

  stop(): void {
    if (this.watchId !== null) navigator.geolocation.clearWatch(this.watchId);
    if (this.staleTimer !== null) window.clearInterval(this.staleTimer);
    this.watchId = null;
    this.staleTimer = null;
    this.lastFixAt = null;
    this.onStatus("inactive");
  }
}
