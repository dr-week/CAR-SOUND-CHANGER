export class BrowserGeolocation {
  private watchId: number | null = null;
  constructor(private readonly onSpeed: (speedKph: number) => void) {}
  start(): void { if (!navigator.geolocation || this.watchId !== null) return; this.watchId = navigator.geolocation.watchPosition(position => { const speed = position.coords.speed; if (speed !== null && speed >= 0) this.onSpeed(speed * 3.6); }, () => undefined, { enableHighAccuracy: true, maximumAge: 1000 }); }
  stop(): void { if (this.watchId !== null) navigator.geolocation.clearWatch(this.watchId); this.watchId = null; }
}
