import type { TelemetryStatus } from "../../application/ports/TelemetryStatus";

export class BrowserGeolocation {
  private watchId: number | null = null;
  private staleTimer: number | null = null;
  private lastFixAt: number | null = null;
  private lastCoords: { lat: number; lon: number; time: number } | null = null;

  constructor(
    private readonly onSpeed: (speedKph: number) => void,
    private readonly onStatus: (status: TelemetryStatus) => void,
    private readonly staleAfterMs = 5_000,
  ) {}

  start(): void {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      this.onStatus("unavailable");
      return;
    }
    if (this.watchId !== null) return;
    this.lastFixAt = Date.now();
    this.lastCoords = null;

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const now = Date.now();
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        let speedKph: number | null = null;

        if (position.coords.speed !== null && Number.isFinite(position.coords.speed) && position.coords.speed >= 0) {
          speedKph = position.coords.speed * 3.6;
        } else if (this.lastCoords !== null) {
          const dtSeconds = (position.timestamp - this.lastCoords.time) / 1_000;
          if (dtSeconds > 0.5) {
            const distMeters = calculateHaversineDistanceMeters(
              this.lastCoords.lat,
              this.lastCoords.lon,
              lat,
              lon,
            );
            speedKph = (distMeters / dtSeconds) * 3.6;
          }
        }

        if (this.lastCoords === null) {
          this.lastCoords = { lat, lon, time: position.timestamp || now };
        } else if (position.coords.speed !== null || (position.timestamp - this.lastCoords.time) / 1_000 > 0.5) {
          this.lastCoords = { lat, lon, time: position.timestamp || now };
        }

        if (speedKph === null || !Number.isFinite(speedKph) || speedKph < 0 || speedKph > 450) {
          if (this.lastFixAt === null || Date.now() - this.lastFixAt > this.staleAfterMs) {
            this.onStatus("stale");
          }
          return;
        }

        this.lastFixAt = now;
        this.onStatus("active");
        this.onSpeed(speedKph);
      },
      (error) => this.onStatus(error.code === error.PERMISSION_DENIED ? "denied" : "error"),
      { enableHighAccuracy: true, maximumAge: 1_000, timeout: this.staleAfterMs },
    );

    this.staleTimer = window.setInterval(() => {
      if (this.lastFixAt !== null && Date.now() - this.lastFixAt > this.staleAfterMs) {
        this.onStatus("stale");
      }
    }, 1_000);
  }

  stop(): void {
    if (this.watchId !== null) navigator.geolocation.clearWatch(this.watchId);
    if (this.staleTimer !== null) window.clearInterval(this.staleTimer);
    this.watchId = null;
    this.staleTimer = null;
    this.lastFixAt = null;
    this.lastCoords = null;
    this.onStatus("inactive");
  }
}

/** Haversine formula to compute distance in meters between two lat/lon points */
function calculateHaversineDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
